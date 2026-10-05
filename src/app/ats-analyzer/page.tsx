'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { FileCheck, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ATSPage() {
  const [user, setUser] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRoleTitle, setTargetRoleTitle] = useState('Full Stack Developer');
  const [atsResult, setAtsResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.success && data.data.resumes.length > 0) {
        setResumes(data.data.resumes);
        setSelectedResumeId(data.data.resumes[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunATS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) return;

    setAnalyzing(true);
    try {
      const res = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResumeId, targetRoleTitle }),
      });

      const data = await res.json();
      if (data.success) {
        setAtsResult(data.data.atsResult);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              Applicant Tracking System Optimization
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              ATS Resume Analyzer & Keyword Auditor
            </h1>
            <p className="text-xs text-slate-400">
              Inspect your uploaded resume against target job postings. Uncover missing keywords, section completeness, and formatting scores.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <form onSubmit={handleRunATS} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Uploaded Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Position Title</label>
                <input
                  type="text"
                  value={targetRoleTitle}
                  onChange={(e) => setTargetRoleTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Full Stack Developer"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={analyzing || !selectedResumeId}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                  <span>{analyzing ? 'Auditing Resume...' : 'Analyze ATS Compatibility'}</span>
                </button>
              </div>
            </form>
          </div>

          {atsResult && (
            <div className="space-y-6">
              {/* ATS Score Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1 text-center">
                  <p className="text-xs text-slate-400">ATS Score</p>
                  <p className="text-4xl font-extrabold text-blue-400">{atsResult.score}/100</p>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1 text-center">
                  <p className="text-xs text-slate-400">Keyword Alignment</p>
                  <p className="text-4xl font-extrabold text-emerald-400">{atsResult.keywordMatchPct}%</p>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1 text-center">
                  <p className="text-xs text-slate-400">Formatting Audit</p>
                  <p className="text-4xl font-extrabold text-indigo-400">{atsResult.formattingScore}/100</p>
                </div>
              </div>

              {/* Feedback Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Resume Strengths
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {atsResult.feedback?.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Missing Keywords & Priority Improvements
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {atsResult.missingKeywords?.map((kw: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                        + {kw}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    {atsResult.feedback?.improvements?.map((imp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
