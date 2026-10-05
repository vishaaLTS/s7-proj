'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Building2, Globe, Award, Briefcase, ChevronRight } from 'lucide-react';

export default function CompaniesPage() {
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/companies');
      const data = await res.json();
      if (data.success) setCompanies(data.data.companies || []);
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Company Intelligence Database
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Target Employers & Hiring Standards
            </h1>
            <p className="text-xs text-slate-400">
              Browse top employers (TCS, Infosys, Wipro, Amazon, Google, Microsoft, Zoho) and inspect their required technical skill stacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((c) => (
              <div
                key={c.id}
                className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-blue-400 text-base">
                      {c.name[0]}
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono font-semibold">
                      {c.tier}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-bold text-base text-white">{c.name}</h2>
                    <p className="text-xs text-slate-400">{c.industry}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-400 font-semibold">Supported Job Roles:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.companyJobRoles?.map((cjr: any) => (
                      <span key={cjr.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {cjr.jobRole.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
