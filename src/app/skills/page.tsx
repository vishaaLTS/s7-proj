'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Award,
  Sparkles,
  Search,
  ShieldCheck
} from 'lucide-react';

export default function SkillsPage() {
  const [user, setUser] = useState<any>(null);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState('INTERMEDIATE');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const fetchSkillsData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) {
        setCatalog(data.data.catalog || []);
        setUserSkills(data.data.userSkills || []);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: newSkillName, proficiencyLevel: newProficiency }),
      });

      const data = await res.json();
      if (data.success) {
        setNewSkillName('');
        fetchSkillsData();
      }
    } catch (err) {
      console.error('Add skill error:', err);
    }
  };

  const handleRemoveSkill = async (userSkillId: string) => {
    try {
      const res = await fetch(`/api/skills/${userSkillId}`, { method: 'DELETE' });
      if (res.ok) fetchSkillsData();
    } catch (err) {
      console.error('Delete skill error:', err);
    }
  };

  const filteredUserSkills = userSkills.filter(us =>
    us.skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    us.skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Skill Verification & Authoritative Profile
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Verified Candidate Skill Profile
            </h1>
            <p className="text-xs text-slate-400">
              Manage your verified technical and domain skills. Proficiency scores are used by the Skill Gap Engine to calculate company readiness.
            </p>
          </div>

          {/* Add Skill Widget */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              Add Skill & Verification
            </h2>

            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. PostgreSQL, Docker, Next.js, Python..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={newProficiency}
                onChange={(e) => setNewProficiency(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="ELEMENTARY">ELEMENTARY</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
                <option value="EXPERT">EXPERT</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors shrink-0"
              >
                Verify & Add Skill
              </button>
            </form>
          </div>

          {/* User Skills List */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Verified Skills ({filteredUserSkills.length})
                </h2>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter skills..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUserSkills.map((us) => (
                <div
                  key={us.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{us.skill.name}</span>
                        {us.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </p>
                      <p className="text-[10px] text-slate-400">{us.skill.category}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveSkill(us.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove Skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-semibold">
                      {us.proficiencyLevel}
                    </span>
                    <span className="text-[10px] text-slate-500">Score: {us.numericScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
