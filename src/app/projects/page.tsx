'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { FolderGit2, Clock, Sparkles, CheckCircle2, Play, ExternalLink } from 'lucide-react';

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/projects/recommended');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data.projects || []);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [progressNotes, setProgressNotes] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStartAndOpenWorkspace = async (project: any) => {
    setActionLoading(project.id);
    try {
      if (project.status === 'NOT_STARTED') {
        const res = await fetch(`/api/projects/${project.id}/start`, { method: 'POST' });
        await res.json();
      }
      setActiveProject(project);
      setProgressNotes(project.userProject?.progressNotes || '');
      setRepoUrl(project.userProject?.repoUrl || '');
      setLiveUrl(project.userProject?.liveUrl || '');
      try {
        setUploadedFiles(JSON.parse(project.userProject?.uploadedFilesJson || '[]'));
      } catch {
        setUploadedFiles([]);
      }
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data.file) {
        setUploadedFiles((prev) => [...prev, data.data.file]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeProject) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          liveUrl,
          progressNotes,
          uploadedFilesJson: JSON.stringify(uploadedFiles),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveProject(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
              <FolderGit2 className="w-3.5 h-3.5" />
              Hands-On Portfolio Building
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Recommended Practical Projects
            </h1>
            <p className="text-xs text-slate-400">
              Projects dynamically matched to your missing skills and target company rules. Open the project workspace to upload source files and submit completion logs.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading database recommendations...</div>
          ) : (
            <div className="space-y-6">
              {projects.map((p) => (
                <div key={p.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-white">{p.title}</h2>
                      <p className="text-[11px] text-slate-400 pt-0.5">{p.learningOutcomes}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                        {p.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.estimatedHours} Hours
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{p.description}</p>

                  {/* Explainable recommendation banner */}
                  <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl text-xs text-blue-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    <span><strong>Why am I seeing this?</strong> {p.why}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {p.techStack.map((tech: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {p.status === 'COMPLETED' ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed ✓
                          </span>
                          <button
                            onClick={() => handleStartAndOpenWorkspace(p)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            View Submissions
                          </button>
                        </div>
                      ) : p.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => handleStartAndOpenWorkspace(p)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow-md"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          Open Workspace & Submit
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartAndOpenWorkspace(p)}
                          disabled={actionLoading === p.id}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start Project
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROJECT WORKSPACE MODAL */}
          {activeProject && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      Interactive Project Workspace
                    </span>
                    <h2 className="text-xl font-bold text-white">{activeProject.title}</h2>
                    <p className="text-xs text-slate-400 pt-0.5">{activeProject.learningOutcomes}</p>
                  </div>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Overview */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <p className="font-semibold text-slate-300">Project Requirements & Suggested Tech</p>
                    <p className="text-slate-400">{activeProject.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {activeProject.techStack.map((tech: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[10px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress Notes */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Implementation Progress & Completion Notes</label>
                    <textarea
                      rows={4}
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      placeholder="Describe what components, API endpoints, or database features you completed..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Project File Upload */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-200">Upload Project Deliverable Files (ZIP, PDF, Code)</label>
                    <div className="border border-dashed border-slate-800 bg-slate-950 p-4 rounded-xl text-center space-y-2">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="workspace-file-input"
                      />
                      <label
                        htmlFor="workspace-file-input"
                        className="inline-block px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg cursor-pointer transition"
                      >
                        {uploadingFile ? 'Uploading file...' : 'Choose Project File'}
                      </label>
                      <p className="text-[10px] text-slate-500">Supports ZIP, PDF, DOCX, images, source code files (Max 25MB)</p>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-slate-400">Uploaded Workspace Files:</p>
                        <div className="space-y-1">
                          {uploadedFiles.map((f, i) => (
                            <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="font-mono text-slate-300 text-[11px]">{f.name}</span>
                              <span className="text-[9px] text-emerald-400 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">GitHub Repository URL (Optional)</label>
                      <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Live Demo URL (Optional)</label>
                      <input
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://my-app.vercel.app"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
                  <button
                    onClick={() => setActiveProject(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleMarkComplete}
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'Saving Progress...' : 'Mark Project Complete ✓'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
