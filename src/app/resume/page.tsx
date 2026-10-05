'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Cpu,
  RefreshCw,
  FileCheck
} from 'lucide-react';

export default function ResumePage() {
  const [user, setUser] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const [showRawText, setShowRawText] = useState(false);
  const [activeResumeText, setActiveResumeText] = useState('');

  const fetchResumes = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.success && data.data.resumes.length > 0) {
        setResumes(data.data.resumes);
        const primary = data.data.resumes[0];
        setActiveResumeText(primary.parsedText || '');
        if (primary.analysis) {
          try {
            setAnalysisResult(JSON.parse(primary.analysis.parsedJson));
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Resume upload failed');
      }

      setAnalysisResult(data.data.parsedData);
      setActiveResumeText(data.data.resume?.parsedText || '');
      fetchResumes();
    } catch (err: any) {
      setError(err.message || 'Failed to process resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              AI Resume Parser & Skill Extraction
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Resume Analysis Engine
            </h1>
            <p className="text-xs text-slate-400">
              Upload your PDF or Word resume. Our AI engine extracts structured skills, experience history, and automatically updates your candidate profile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Upload Panel */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-400" />
                Upload Resume Document
              </h2>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center space-y-3 transition-colors bg-slate-900/40">
                  <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      {selectedFile ? selectedFile.name : 'Select or Drag & Drop Resume File'}
                    </p>
                    <p className="text-[10px] text-slate-500">Supports PDF & DOCX (Max 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-file-input"
                  />
                  <label
                    htmlFor="resume-file-input"
                    className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
                  <span>{uploading ? 'Extracting Text & Skills...' : 'Upload & Parse Resume'}</span>
                </button>
              </form>

              {/* Uploaded Files History */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Version History</p>
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setActiveResumeText(r.parsedText || '');
                      if (r.analysis) {
                        try {
                          setAnalysisResult(JSON.parse(r.analysis.parsedJson));
                        } catch {}
                      }
                    }}
                    className="p-3 bg-slate-900/80 hover:bg-slate-900 cursor-pointer rounded-xl border border-slate-800 text-xs space-y-1 transition-colors"
                  >
                    <p className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>{r.title}</span>
                      <span className="text-[9px] text-blue-400 font-mono">PRIMARY</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Uploaded on {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Extracted Structured JSON Output */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Extracted Profile & Skill Evidence
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-[10px] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-500/30 transition-colors font-mono"
                  >
                    {showRawText ? 'Hide Extracted PDF Text' : 'View Extracted Resume Text (Debug)'}
                  </button>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                    Zod Validated
                  </span>
                </div>
              </div>

              {/* Debug raw text toggle section */}
              {showRawText && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-amber-400">Extracted PDF Raw Text (Source of Truth):</p>
                  <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto p-2 bg-slate-900 rounded border border-slate-800">
                    {activeResumeText || 'No text extracted.'}
                  </pre>
                </div>
              )}

              {analysisResult ? (
                <div className="space-y-6 text-xs">
                  {/* Candidate Contact Metadata */}
                  {(analysisResult.fullName || analysisResult.email || analysisResult.phone || analysisResult.location) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
                      <div>
                        <p className="text-[10px] text-slate-500">Candidate Name</p>
                        <p className="font-bold text-slate-200">{analysisResult.fullName || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Email Address</p>
                        <p className="font-semibold text-blue-400">{analysisResult.email || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Phone</p>
                        <p className="font-semibold text-slate-300">{analysisResult.phone || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Location</p>
                        <p className="font-semibold text-slate-300">{analysisResult.location || 'Not specified'}</p>
                      </div>
                    </div>
                  )}

                  {/* Personal Summary */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <p className="font-bold text-blue-400">Executive Summary</p>
                    <p className="text-slate-300 leading-relaxed">{analysisResult.summary}</p>
                  </div>

                  {/* Extracted Education */}
                  {analysisResult.education && analysisResult.education.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-bold text-slate-300">Extracted Education</p>
                      <div className="space-y-2">
                        {analysisResult.education.map((edu: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-white">{edu.degree}</p>
                              <p className="text-slate-400 text-[11px]">{edu.institution}</p>
                            </div>
                            <div className="text-right font-mono text-[11px]">
                              {edu.graduationYear && <p className="text-slate-300">Graduated: {edu.graduationYear}</p>}
                              {edu.cgpa && <p className="text-emerald-400">{edu.cgpa}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracted Skills Badges */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-300">Automatically Detected Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.skills?.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center space-x-2"
                        >
                          <span className="font-semibold text-slate-200">{s.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                            {s.proficiency || 'INTERMEDIATE'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-300">Extracted Projects</p>
                    <div className="space-y-2">
                      {analysisResult.projects?.map((p: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                          <p className="font-bold text-white">{p.title}</p>
                          <p className="text-slate-400 text-[11px]">{p.description}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {p.technologies?.map((tech: string, i: number) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-slate-400 space-y-2">
                  <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>No resume analysis loaded. Upload your resume to extract candidate skill evidence.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
