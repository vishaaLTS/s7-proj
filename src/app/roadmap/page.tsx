'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { BookOpen, CheckCircle2, Clock, Flame, ExternalLink } from 'lucide-react';

export default function RoadmapPage() {
  const [user, setUser] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/roadmap');
      const data = await res.json();
      if (data.success) setRoadmap(data.data.roadmap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      console.error(err);
    }
  };

  const progressPct = roadmap?.totalTasks > 0 ? Math.round((roadmap.completedTasks / roadmap.totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Customized Bridge Training Plan
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Personalized Learning Roadmap
            </h1>
            <p className="text-xs text-slate-400">
              Structured day-by-day curriculum targeting missing company requirements. Complete tasks to increase your overall readiness score.
            </p>
          </div>

          {/* Progress Banner */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white">{roadmap?.title || 'Bridge Learning Curriculum'}</h2>
                <p className="text-xs text-slate-400">
                  {roadmap?.completedTasks || 0} of {roadmap?.totalTasks || 0} tasks completed ({progressPct}%)
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold">{roadmap?.streakDays || 0} Day Streak</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Weekly Tasks List */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Curriculum Modules & Practical Tasks
            </h2>

            <div className="space-y-3">
              {roadmap?.tasks?.map((task: any) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    task.isCompleted
                      ? 'bg-slate-950/60 border-slate-800/60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        task.isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : 'border border-slate-600 hover:border-blue-400 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">
                          Week {task.weekNumber} • Day {task.dayNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {task.skill.name}
                        </span>
                      </div>
                      <h3 className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-400">{task.description}</p>

                      {task.practiceTask && (
                        <p className="text-[11px] text-amber-300/90 pt-1 font-mono">
                          🛠️ Practice: {task.practiceTask}
                        </p>
                      )}
                    </div>
                  </div>

                  {task.resourceUrl && (
                    <a
                      href={task.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center space-x-1.5 shrink-0 transition-colors"
                    >
                      <span>Study Resource</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
