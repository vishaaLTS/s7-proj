'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Target,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FileCheck,
  MessageSquareCode,
  Briefcase,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const [gapData, setGapData] = useState<any>(null);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) {
        setUser(meData.data.user);
        if (meData.data.user.profile?.targetCompanyId) setSelectedCompanyId(meData.data.user.profile.targetCompanyId);
        if (meData.data.user.profile?.targetRoleId) setSelectedRoleId(meData.data.user.profile.targetRoleId);
      }

      const compRes = await fetch('/api/companies');
      const compData = await compRes.json();
      if (compData.success) setCompanies(compData.data.companies);

      const rolesRes = await fetch('/api/roles');
      const rolesData = await rolesRes.json();
      if (rolesData.success) setRoles(rolesData.data.roles);

      const gapRes = await fetch('/api/skill-gap/analyze');
      const gapJson = await gapRes.json();
      if (gapJson.success) {
        setGapData(gapJson.data.gapSummary || gapJson.data.summary);
        setReadinessData(gapJson.data.readiness);
      }

      const rmRes = await fetch('/api/roadmap');
      const rmData = await rmRes.json();
      if (rmData.success) setRoadmap(rmData.data.roadmap);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedCompanyId || !selectedRoleId) return;
    setAnalyzing(true);

    try {
      const res = await fetch('/api/skill-gap/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompanyId, jobRoleId: selectedRoleId }),
      });

      const data = await res.json();
      if (data.success) {
        setGapData(data.data.gapSummary);
        setReadinessData(data.data.readiness);

        const rmRes = await fetch('/api/roadmap', { method: 'POST' });
        const rmData = await rmRes.json();
        if (rmData.success) setRoadmap(rmData.data.roadmap);
      }
    } catch (err) {
      console.error('Error running skill gap analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/roadmap/tasks/${taskId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (data.success && roadmap) {
        setRoadmap((prev: any) => ({
          ...prev,
          completedTasks: data.data.roadmap.completedTasks,
          completedHours: data.data.roadmap.completedHours,
          streakDays: data.data.roadmap.streakDays,
          tasks: prev.tasks.map((t: any) => (t.id === taskId ? { ...t, isCompleted: data.data.task.isCompleted } : t)),
        }));
      }
    } catch (err) {
      console.error('Task toggle error:', err);
    }
  };

  // Derive Next Best Action based on user readiness state
  const getNextBestAction = () => {
    if (!readinessData) {
      return { title: 'Select Target Company & Job Role', desc: 'Set your target career goal to unlock personalized skill gap rules and learning roadmap.', link: '#target-section', btnText: 'Configure Target' };
    }
    if (!readinessData.hasAssessment) {
      return { title: 'Take Skill Assessment', desc: 'Complete a technical assessment to verify your skill proficiency and boost your readiness score.', link: '/assessment', btnText: 'Take Assessment' };
    }
    if (readinessData.skillMatchScore < 70) {
      return { title: 'Bridge Priority Skill Gaps', desc: 'Complete weekly tasks in your bridge training roadmap to level up missing target skills.', link: '/roadmap', btnText: 'View Roadmap' };
    }
    if (!readinessData.hasProjects) {
      return { title: 'Build Practical Project', desc: 'Complete a recommended hands-on portfolio project to demonstrate real-world experience.', link: '/projects', btnText: 'Explore Projects' };
    }
    if (!readinessData.hasATS) {
      return { title: 'Run ATS Resume Inspection', desc: 'Scan your resume against target company job descriptions to optimize keywords and formatting.', link: '/ats-analyzer', btnText: 'Inspect Resume' };
    }
    if (!readinessData.hasInterview) {
      return { title: 'Start AI Mock Interview', desc: 'Practice simulated technical and behavioral rounds tailored to your target company.', link: '/mock-interview', btnText: 'Start Interview' };
    }
    return { title: 'Apply for Matching Jobs', desc: 'Your company readiness score is high! Review top job matches and track your applications.', link: '/jobs', btnText: 'View Job Matches' };
  };

  const nextAction = getNextBestAction();

  const radarData = [
    { subject: 'Skill Match', A: readinessData?.skillMatchScore || 0, fullMark: 100 },
    { subject: 'Assessments', A: readinessData?.assessmentScore || 0, fullMark: 100 },
    { subject: 'Projects', A: readinessData?.projectScore || 0, fullMark: 100 },
    { subject: 'ATS Score', A: readinessData?.atsScore || 0, fullMark: 100 },
    { subject: 'Interview', A: readinessData?.interviewScore || 0, fullMark: 100 },
  ];

  const gapBarData = [
    { name: 'Matched', value: gapData?.matchedCount || 0, color: '#10b981' },
    { name: 'Partial Gap', value: gapData?.partialCount || 0, color: '#f59e0b' },
    { name: 'Missing Priority', value: gapData?.missingCount || 0, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Employment Readiness Portal
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Welcome, {user?.profile?.fullName || 'Candidate'}!
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">
                Bridge your target company&apos;s skill requirements with real-time AI gap analysis, personalized learning roadmaps, and mock interview practice.
              </p>
            </div>

            <Link
              href="/career-intelligence"
              className="z-10 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center space-x-2 shrink-0 transition-transform hover:scale-105"
            >
              <span>Explore Career Intelligence</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
          </div>

          {/* Target Selector */}
          <div id="target-section" className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Target Company & Job Role Configuration</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md font-mono">
                PostgreSQL Database Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Company</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Job Role</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Job Role --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing || !selectedCompanyId || !selectedRoleId}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                  <span>{analyzing ? 'Analyzing Gaps...' : 'Compute Readiness Score'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* NEXT BEST ACTION CARD */}
          <div className="glass-card p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Recommended Next Best Action
              </span>
              <h3 className="text-base font-bold text-white">{nextAction.title}</h3>
              <p className="text-xs text-slate-300 max-w-xl">{nextAction.desc}</p>
            </div>

            <Link
              href={nextAction.link}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shrink-0 flex items-center space-x-1.5 transition"
            >
              <span>{nextAction.btnText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Overall Readiness</span>
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  {readinessData ? `${readinessData.overallReadinessScore}%` : 'Not Set'}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Weighted Fit</span>
              </div>
              <p className="text-[10px] text-slate-500">Authoritative ScoreEngine formula</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Core Skill Match</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  {readinessData ? `${readinessData.skillMatchScore}%` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {gapData ? `${gapData.matchedCount}/${gapData.totalCount}` : '0/0'} skills
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Verified skills vs requirement rules</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ATS Resume Match</span>
                <FileCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  {typeof readinessData?.atsScore === 'number'
                    ? readinessData.atsScore
                    : 'None'}
                </span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-500">Parsed resume keyword compatibility</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Mock Interview Fit</span>
                <MessageSquareCode className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  {typeof readinessData?.interviewScore === 'number'
                    ? `${readinessData.interviewScore}%`
                    : 'None'}
                </span>
                <span className="text-[10px] text-slate-400">Technical Score</span>
              </div>
              <p className="text-[10px] text-slate-500">AI evaluation on clarity & correctness</p>
            </div>
          </div>

          {/* Visual Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Radar Chart */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Readiness Radar Analysis
                </h3>
                <span className="text-[10px] text-slate-400">Authoritative ReadinessService</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar name="Candidate Profile" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 italic">
                {`"${readinessData?.explanation || 'Select a target company & role to compute readiness scores.'}"`}
              </p>
            </div>

            {/* Skill Gap Distribution Bar Chart */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Target Skill Gap Breakdown
                </h3>
                <span className="text-[10px] text-slate-400">Rules Engine Output</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gapBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#475569" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {gapBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  <p className="text-xs font-bold text-emerald-400">{gapData?.matchedCount || 0}</p>
                  <p className="text-[10px] text-slate-400">Matched Skills</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                  <p className="text-xs font-bold text-amber-400">{gapData?.partialCount || 0}</p>
                  <p className="text-[10px] text-slate-400">Partial Skills</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  <p className="text-xs font-bold text-rose-400">{gapData?.missingCount || 0}</p>
                  <p className="text-[10px] text-slate-400">Priority Gaps</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
