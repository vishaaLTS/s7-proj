import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse, errorResponse } from '@/lib/rbac';
import { FileStorageService } from '@/services/file-storage';
import { AIService } from '@/services/ai-service';
import { SkillAliasService } from '@/services/skill-alias';
import { NotificationService } from '@/services/notification-service';
import pdfParse from 'pdf-parse';
import { extractTextFromDocx } from '@/lib/docx-extractor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await authorizeUser();
  if ('error' in auth) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 'BAD_REQUEST', 400);
    }

    const fileNameLower = file.name.toLowerCase();
    const isPdf = fileNameLower.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx = fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc') || file.type.includes('wordprocessingml');

    if (!isPdf && !isDocx) {
      return errorResponse('Only PDF and DOCX files are supported for resume processing.', 'INVALID_FILE_TYPE', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // File validation
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse('File size exceeds 10MB limit', 'PAYLOAD_TOO_LARGE', 400);
    }

    // Save using FileStorageService
    const fileAsset = await FileStorageService.saveFile(
      auth.user.userId,
      buffer,
      file.name,
      isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    // Extract raw text
    let parsedText = '';
    try {
      if (isPdf) {
        const pdfData = await pdfParse(buffer);
        parsedText = pdfData.text || '';
      } else if (isDocx) {
        parsedText = extractTextFromDocx(buffer);
      }
    } catch (e) {
      console.warn('Text extraction error:', e);
      parsedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    }

    // Create Resume record
    const resume = await prisma.resume.create({
      data: {
        userId: auth.user.userId,
        fileAssetId: fileAsset.id,
        title: file.name,
        parsedText: parsedText.substring(0, 20000),
        isPrimary: true,
      }
    });

    // Run AI Resume Analysis
    const aiAnalysis = await AIService.analyzeResume(parsedText || 'Sample Resume');

    // Save ResumeAnalysis record
    const analysisRecord = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        parsedJson: JSON.stringify(aiAnalysis.data),
        summary: aiAnalysis.data.summary,
        experienceYears: aiAnalysis.data.experienceYears,
        educationScore: aiAnalysis.data.educationScore,
        aiModel: `${aiAnalysis.provider} (${aiAnalysis.model})`,
      }
    });

    // Automatically normalize and attach detected skills to user profile
    for (const extractedSkill of aiAnalysis.data.skills) {
      const canonicalSkill = await SkillAliasService.normalizeAndGetSkill(extractedSkill.name, extractedSkill.category);
      if (canonicalSkill) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId: {
              userId: auth.user.userId,
              skillId: canonicalSkill.id,
            }
          },
          create: {
            userId: auth.user.userId,
            skillId: canonicalSkill.id,
            proficiencyLevel: extractedSkill.proficiency || 'INTERMEDIATE',
            numericScore: 70.0,
            evidence: extractedSkill.evidence || `Extracted from uploaded resume ${file.name}`,
            isVerified: false,
          },
          update: {
            proficiencyLevel: extractedSkill.proficiency || 'INTERMEDIATE',
            evidence: extractedSkill.evidence || `Updated from uploaded resume ${file.name}`,
          }
        });
      }
    }

    await NotificationService.createNotification(
      auth.user.userId,
      'Resume Uploaded & Analyzed',
      `Successfully processed resume "${file.name}". ${aiAnalysis.data.skills.length} skills extracted and candidate profile updated.`,
      'SUCCESS'
    );

    return jsonResponse({
      resume,
      analysis: analysisRecord,
      parsedData: aiAnalysis.data,
      provider: aiAnalysis.provider,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to upload and process resume', 'SERVER_ERROR', 500);
  }
}
