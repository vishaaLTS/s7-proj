'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  BrainCircuit,
  Building2,
  Target,
  BookOpen,
  FolderGit2,
  FileCheck,
  MessageSquareCode,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/career-intelligence', label: 'Career Intelligence', icon: TrendingUp, badge: 'Showcase' },
    { href: '/resume', label: 'Resume Analyzer', icon: FileText },
    { href: '/skills', label: 'Skill Profile & Verify', icon: CheckCircle2 },
    { href: '/assessment', label: 'Skill Assessments', icon: BrainCircuit },
    { href: '/companies', label: 'Target Companies', icon: Building2 },
    { href: '/skill-gap', label: 'Skill Gap & Readiness', icon: Target },
    { href: '/roadmap', label: 'Bridge Training Roadmap', icon: BookOpen },
    { href: '/projects', label: 'Recommended Projects', icon: FolderGit2 },
    { href: '/ats-analyzer', label: 'ATS Resume Inspector', icon: FileCheck },
    { href: '/mock-interview', label: 'AI Mock Interview', icon: MessageSquareCode },
    { href: '/jobs', label: 'Job Matches & Fit', icon: Briefcase },
  ];

  if (userRole === 'ADMIN') {
    navItems.push({ href: '/admin', label: 'Admin Portal', icon: ShieldCheck, badge: 'Admin' });
  }

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-1.5">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Career Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  item.badge === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 px-2">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Final-Year Project
          </p>
          <p className="text-[10px] text-slate-500">Youth Employment Skill Gap Analysis Portal</p>
        </div>
      </div>
    </aside>
  );
};
