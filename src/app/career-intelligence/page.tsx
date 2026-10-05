'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Sparkles,
  User,
  CheckCircle2,
  Target,
  Award,
  BookOpen,
  FolderGit2,
  Briefcase,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function CareerIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/career-intelligence');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error loading career intelligence pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const user = data?.user;
  const profile = user?.profile;
  const readiness = data?.readinessData?.readiness;
  const userSkills = data?.userSkills || [];
  const skillGaps = data?.skillGaps || [];
  const recommendedTraining = data?.recommendedTraining || [];
  const recommendedProjects = data?.recommendedProjects || [];
  const jobRecommendations = data?.jobRecommendations || [];
  const interviewPrepTopics = data?.interviewPrepTopics || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Unified Showcase Experience
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Full-Stack AI Career Intelligence Pipeline
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              End-to-end data flow connecting candidate profile &rarr; verified skills &rarr; company rules &rarr; readiness breakdown &rarr; bridge training &rarr; projects &rarr; interview prep &rarr; job match.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Assembling career intelligence pipeline...</div>
          ) : (
            <>
              {/* Step 1: Candidate Profile */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Step 1: Candidate Profile & Academic Background
                  </h2>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                    Verified Database Entity
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500 text-[10px]">Candidate Name</p>
                    <p className="font-semibold text-slate-200">{profile?.fullName || 'Candidate Profile Incomplete'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">Institution</p>
                    <p className="font-semibold text-slate-200">{profile?.institution || user?.educations[0]?.institution || 'Not Provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">Degree & Grade</p>
                    <p className="font-semibold text-slate-200">{profile?.degree || user?.educations[0]?.degree || 'N/A'} ({profile?.cgpa ? `${profile.cgpa} CGPA` : 'N/A'})</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">Graduation Year</p>
                    <p className="font-semibold text-slate-200">{profile?.graduationYear || '2024'}</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Verified Candidate Skill Profile */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Step 2: Verified Candidate Skill Profile ({userSkills.length} Verified)
                  </h2>
                  <Link href="/skills" className="text-xs text-blue-400 hover:underline">
                    Manage Skills &rarr;
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userSkills.length > 0 ? (
                    userSkills.map((us: any) => (
                      <div
                        key={us.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center space-x-2"
                      >
                        <span className="font-semibold text-slate-200">{us.skill.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                          {us.proficiencyLevel}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No verified skills attached yet.</p>
                  )}
                </div>
              </div>

              {/* Step 3: Target Company & Skill Gap Analysis */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    Step 3: Target Company Rules & Skill Gap Analysis
                  </h2>
                  <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                    {data?.readinessData?.companyName || 'Target Company'} • {data?.readinessData?.jobRoleTitle || 'Target Role'}
                  </span>
                </div>

                {skillGaps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skillGaps.map((gap: any) => (
                      <div
                        key={gap.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                          gap.status === 'MATCHED'
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                            : gap.status === 'PARTIAL'
                            ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                            : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{gap.skill.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase">{gap.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Current: {gap.currentLevel} &rarr; Required: {gap.requiredLevel}
                        </p>
                        <p className="text-[10px] text-slate-300 pt-1">{gap.recommendationText}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select a target company and job role on the Skill Gap page to generate rules.</p>
                )}
              </div>

              {/* Step 4: Readiness Scorecard */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-400" />
                    Step 4: Authoritative Company Readiness Breakdown
                  </h2>
                  <span className="text-2xl font-extrabold text-blue-400">
                    {readiness?.overallReadinessScore || 0}% Overall Fit
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center pt-2">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-white">{readiness?.skillMatchScore ?? 0}%</p>
                    <p className="text-[10px] text-slate-400">Skill Match (35%)</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-white">
                      {typeof readiness?.assessmentScore === 'number' ? `${readiness.assessmentScore}%` : 'Not Taken'}
                    </p>
                    <p className="text-[10px] text-slate-400">Assessment (20%)</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-white">
                      {typeof readiness?.projectScore === 'number' ? `${readiness.projectScore}%` : 'None'}
                    </p>
                    <p className="text-[10px] text-slate-400">Projects (15%)</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-white">
                      {typeof readiness?.atsScore === 'number' ? `${readiness.atsScore}%` : 'Not Evaluated'}
                    </p>
                    <p className="text-[10px] text-slate-400">ATS Score (10%)</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-white">
                      {typeof readiness?.interviewScore === 'number' ? `${readiness.interviewScore}%` : 'Not Taken'}
                    </p>
                    <p className="text-[10px] text-slate-400">Interview (20%)</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 pt-2">{readiness?.explanation}</p>
              </div>

              {/* Step 5: Recommended Bridge Training */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    Step 5: Personalized Bridge Training Resources
                  </h2>
                  <Link href="/roadmap" className="text-xs text-blue-400 hover:underline">
                    View Roadmap &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedTraining.map((t: any) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{t.title}</span>
                        <span className="text-[10px] text-purple-400 font-mono">{t.provider}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{t.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 6: Recommended Projects */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    Step 6: High-Impact Portfolio Projects
                  </h2>
                  <Link href="/projects" className="text-xs text-blue-400 hover:underline">
                    View All Projects &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {recommendedProjects.map((p: any) => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{p.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{p.description}</p>
                      <p className="text-[11px] text-indigo-300">💡 {p.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 7: Recommended Jobs */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    Step 7: Job Recommendations with Fit Metrics
                  </h2>
                  <Link href="/jobs" className="text-xs text-blue-400 hover:underline">
                    View All Jobs &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {jobRecommendations.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{item.job.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.job.company.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{item.matchBreakdown?.explanation}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-extrabold text-emerald-400">{item.matchPercentage}% Fit</span>
                        <p className="text-[10px] text-slate-500">Weighted Job Match</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
