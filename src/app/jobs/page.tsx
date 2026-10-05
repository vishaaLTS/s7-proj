'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Briefcase, Building2, MapPin, ExternalLink, Bookmark, CheckCircle2, Search, Filter } from 'lucide-react';

export default function JobsPage() {
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applications, setApplications] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchJobsAndApplications();
  }, []);

  const fetchJobsAndApplications = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const [resJobs, resApps] = await Promise.all([
        fetch('/api/jobs/recommendations'),
        fetch('/api/applications'),
      ]);

      const jobsData = await resJobs.json();
      const appsData = await resApps.json();

      if (jobsData.success) setRecommendations(jobsData.data.recommendations || []);

      if (appsData.success && appsData.data.applications) {
        const appMap: Record<string, any> = {};
        appsData.data.applications.forEach((a: any) => {
          appMap[a.jobId] = a;
        });
        setApplications(appMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string, status: 'SAVED' | 'APPLIED') => {
    setActionLoading(jobId);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchJobsAndApplications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = recommendations.filter((item) => {
    const titleMatch = item.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch = item.job.company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = item.job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = titleMatch || companyMatch || descMatch;
    const matchesType = jobTypeFilter === 'ALL' || item.job.jobType === jobTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Weighted Job Match Engine
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Job Matches & Career Recommendations
            </h1>
            <p className="text-xs text-slate-400">
              Personalized candidate-to-job matching computed from verified skills, experience, and education rules.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 glass-card p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Job Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Computing deterministic job fit scores...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No matching jobs found. Try adjusting your search query.</div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((item) => {
                const app = applications[item.job.id];
                const isSaved = app?.status === 'SAVED';
                const isApplied = app && app.status !== 'SAVED';

                const sourceLabel =
                  item.job.source === 'INTERNAL_SEED'
                    ? 'Internal Demo'
                    : item.job.source === 'ADMIN_CREATED'
                    ? 'Admin Created'
                    : 'External Provider';

                return (
                  <div
                    key={item.id}
                    className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-white">{item.job.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                          {item.job.jobType}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {sourceLabel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {item.job.company.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {item.job.location}
                        </span>
                        <span className="text-emerald-400 font-mono font-semibold">{item.job.salaryRange}</span>
                      </p>

                      <p className="text-xs text-slate-300">{item.job.description}</p>

                      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                        <p className="text-blue-300 font-medium">💡 {item.matchBreakdown?.explanation}</p>
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 pt-1">
                          <span>Skills Match: <strong className="text-slate-200">{item.skillMatchPct}%</strong></span>
                          <span>Experience Match: <strong className="text-slate-200">{item.experienceMatchPct}%</strong></span>
                          <span>Education Match: <strong className="text-slate-200">{item.educationMatchPct}%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3 shrink-0 w-full md:w-auto">
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-emerald-400">{item.matchPercentage}%</span>
                        <p className="text-[10px] text-slate-500">Candidate Fit Match</p>
                      </div>

                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <button
                          onClick={() => handleApply(item.job.id, 'SAVED')}
                          disabled={actionLoading === item.job.id || isSaved || Boolean(isApplied)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition ${
                            isSaved
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                          }`}
                          title="Save Job"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        {isApplied ? (
                          <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {app.status}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(item.job.id, 'APPLIED')}
                            disabled={actionLoading === item.job.id}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <span>Apply Now</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
