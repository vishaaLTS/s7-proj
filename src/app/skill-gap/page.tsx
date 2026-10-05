'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Target, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Award } from 'lucide-react';

export default function SkillGapPage() {
  const [user, setUser] = useState<any>(null);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGapData();
  }, []);

  const fetchGapData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/skill-gap/analyze');
      const data = await res.json();
      if (data.success && data.data.hasTarget) {
        setSkillGaps(data.data.skillGaps || []);
        setReadiness(data.data.readiness);
        setSummary(data.data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Automated Requirement Matrix Comparison
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Skill Gap & Readiness Analysis
            </h1>
            <p className="text-xs text-slate-400">
              Detailed comparison between your verified candidate profile and your target company&apos;s job requirements.
            </p>
          </div>

          {readiness && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-blue-400">Authoritative Readiness Score</span>
                  <h2 className="text-3xl font-extrabold text-white">{readiness.overallReadinessScore}% Prepared</h2>
                </div>

                <Link
                  href="/roadmap"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center space-x-2"
                >
                  <span>Start Bridge Training</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="text-xs text-slate-300 italic">{readiness.explanation}</p>
            </div>
          )}

          {/* Skill Gap Cards Grid */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Detailed Skill Status Matrix ({skillGaps.length} Requirements Analyzed)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillGaps.map((gap) => (
                <div
                  key={gap.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    gap.status === 'MATCHED'
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                      : gap.status === 'PARTIAL'
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-sm text-white">{gap.skill.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold">
                      {gap.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Current Level: <strong className="text-slate-200">{gap.currentLevel}</strong></span>
                    <span>Required Level: <strong className="text-slate-200">{gap.requiredLevel}</strong></span>
                  </div>

                  <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                    💡 {gap.recommendationText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
