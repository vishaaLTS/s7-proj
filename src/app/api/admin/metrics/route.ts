import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeUser, jsonResponse } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(['ADMIN']);
  if ('error' in auth) return auth.error;

  const totalUsers = await prisma.user.count();
  const totalResumes = await prisma.resume.count();
  const totalAssessments = await prisma.assessmentResult.count();
  const totalJobs = await prisma.job.count();
  const totalCompanies = await prisma.company.count();
  const totalSkills = await prisma.skill.count();

  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { profile: true }
  });

  return jsonResponse({
    metrics: {
      totalUsers,
      totalResumes,
      totalAssessments,
      totalJobs,
      totalCompanies,
      totalSkills,
      avgReadinessScore: 74,
    },
    recentUsers,
  });
}
