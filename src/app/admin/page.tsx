'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ShieldCheck, Users, Building2, Briefcase, Award, Plus, CheckCircle2, Search } from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'skills' | 'companies' | 'jobs'>('users');
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'STUDENT', fullName: '' });
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Programming', description: '' });
  const [newCompany, setNewCompany] = useState({ name: '', industry: 'IT Services', tier: 'TIER_1', website: '' });
  const [newJob, setNewJob] = useState({ companyId: '', title: '', location: 'Bengaluru', jobType: 'FULL_TIME', description: '', requirements: 'JavaScript, React, Node.js', salaryRange: '₹6 LPA - ₹10 LPA' });

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const resMetrics = await fetch('/api/admin/metrics');
      const metricsData = await resMetrics.json();
      if (metricsData.success) setMetrics(metricsData.data.metrics);

      if (activeTab === 'users') {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success) setUsersList(data.data.users || []);
      } else if (activeTab === 'skills') {
        const res = await fetch('/api/admin/skills');
        const data = await res.json();
        if (data.success) setSkillsList(data.data.skills || []);
      } else if (activeTab === 'companies') {
        const res = await fetch('/api/admin/companies');
        const data = await res.json();
        if (data.success) setCompaniesList(data.data.companies || []);
      } else if (activeTab === 'jobs') {
        const [resJobs, resCompanies] = await Promise.all([
          fetch('/api/admin/jobs'),
          fetch('/api/admin/companies'),
        ]);
        const jobsData = await resJobs.json();
        const compData = await resCompanies.json();
        if (jobsData.success) setJobsList(jobsData.data.jobs || []);
        if (compData.success) setCompaniesList(compData.data.companies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewUser({ email: '', password: '', role: 'STUDENT', fullName: '' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewSkill({ name: '', category: 'Programming', description: '' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewCompany({ name: '', industry: 'IT Services', tier: 'TIER_1', website: '' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reqArray = newJob.requirements.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newJob,
          companyId: newJob.companyId || companiesList[0]?.id,
          requirements: reqArray,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewJob({ companyId: '', title: '', location: 'Bengaluru', jobType: 'FULL_TIME', description: '', requirements: 'JavaScript, React, Node.js', salaryRange: '₹6 LPA - ₹10 LPA' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform Operations & Governance
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Admin Governance Portal
            </h1>
            <p className="text-xs text-slate-400">
              Manage system entity records backed directly by the database APIs.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Users</span>
              <p className="text-3xl font-extrabold text-white">{metrics?.totalUsers || usersList.length}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Resumes Processed</span>
              <p className="text-3xl font-extrabold text-blue-400">{metrics?.totalResumes || 0}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Assessments Taken</span>
              <p className="text-3xl font-extrabold text-emerald-400">{metrics?.totalAssessments || 0}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Active Jobs</span>
              <p className="text-3xl font-extrabold text-indigo-400">{metrics?.totalJobs || jobsList.length}</p>
            </div>
          </div>

          {/* Tab Navigation & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Users ({usersList.length})
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'skills' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Skills ({skillsList.length})
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'companies' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Companies ({companiesList.length})
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'jobs' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Jobs ({jobsList.length})
              </button>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New {activeTab.slice(0, -1).toUpperCase()}</span>
            </button>
          </div>

          {/* Active Tab Data Table */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {activeTab.toUpperCase()} DATABASE RECORDS
            </h2>

            {loading ? (
              <div className="text-center py-8 text-slate-400 text-xs">Loading records from database...</div>
            ) : activeTab === 'users' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">User Email / Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Institution</th>
                      <th className="p-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">
                          {u.profile?.fullName || u.email}
                          <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{u.profile?.institution || 'N/A'}</td>
                        <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'skills' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Skill Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Aliases Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {skillsList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">{s.name}</td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
                            {s.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{s.aliases?.length || 0} Aliases</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'companies' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Industry</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3">Website</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {companiesList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">{c.name}</td>
                        <td className="p-3 text-slate-400">{c.industry}</td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                            {c.tier}
                          </span>
                        </td>
                        <td className="p-3 text-blue-400 font-mono">{c.website || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Job Title</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Job Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {jobsList.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">{j.title}</td>
                        <td className="p-3 text-slate-400">{j.company?.name}</td>
                        <td className="p-3 text-slate-400">{j.location}</td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                            {j.jobType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Add New {activeTab.slice(0, -1).toUpperCase()}
            </h3>

            {activeTab === 'users' && (
              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="JOB_SEEKER">JOB_SEEKER</option>
                    <option value="COUNSELOR">COUNSELOR</option>
                    <option value="EMPLOYER">EMPLOYER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold">
                    Create User
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'skills' && (
              <form onSubmit={handleCreateSkill} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Skill Name</label>
                  <input
                    type="text"
                    required
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold">
                    Create Skill
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'companies' && (
              <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Industry</label>
                  <input
                    type="text"
                    required
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold">
                    Create Company
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'jobs' && (
              <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Description</label>
                  <textarea
                    required
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white h-20"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Requirements (Comma Separated)</label>
                  <input
                    type="text"
                    required
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold">
                    Create Job
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
