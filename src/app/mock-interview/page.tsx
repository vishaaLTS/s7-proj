'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MessageSquareCode, Sparkles, Send, Award, CheckCircle2, RefreshCw } from 'lucide-react';

export default function MockInterviewPage() {
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [mode, setMode] = useState('TECHNICAL');

  const [activeInterview, setActiveInterview] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswerText, setUserAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const compRes = await fetch('/api/companies');
      const compData = await compRes.json();
      if (compData.success && compData.data.companies.length > 0) {
        setCompanies(compData.data.companies);
        setSelectedCompanyId(compData.data.companies[0].id);
      }

      const rolesRes = await fetch('/api/roles');
      const rolesData = await rolesRes.json();
      if (rolesData.success && rolesData.data.roles.length > 0) {
        setRoles(rolesData.data.roles);
        setSelectedRoleId(rolesData.data.roles[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !selectedRoleId) return;

    setStarting(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompanyId, jobRoleId: selectedRoleId, mode }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveInterview(data.data.interview);
        setCurrentQuestionIdx(0);
        setUserAnswerText('');
        setEvaluation(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswerText.trim() || !activeInterview) return;

    const question = activeInterview.questions[currentQuestionIdx];
    setEvaluating(true);

    try {
      const res = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, userAnswer: userAnswerText }),
      });

      const data = await res.json();
      if (data.success) {
        setEvaluation(data.data.evaluation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setUserAnswerText('');
    setCurrentQuestionIdx((prev) => prev + 1);
  };

  const currentQuestion = activeInterview?.questions[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar userRole={user?.role} />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <MessageSquareCode className="w-3.5 h-3.5" />
              AI Interactive Technical Simulator
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              AI Mock Interview Simulator
            </h1>
            <p className="text-xs text-slate-400">
              Practice company-specific Technical, HR, and Behavioral rounds. Receive real-time AI scorecard evaluation on clarity, relevance, and correctness.
            </p>
          </div>

          {!activeInterview ? (
            /* Setup Form */
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Configure Interview Session
              </h2>

              <form onSubmit={handleStartInterview} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Target Company</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Job Position</label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Interview Round</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="TECHNICAL">TECHNICAL ROUND</option>
                    <option value="HR">HR / BEHAVIORAL ROUND</option>
                    <option value="MIXED">MIXED ROUND</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={starting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20"
                >
                  {starting ? 'Initializing Session...' : 'Start AI Mock Interview Session'}
                </button>
              </form>
            </div>
          ) : (
            /* Active Interview Interface */
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-blue-400 font-mono">
                  Question {currentQuestionIdx + 1} of {activeInterview.questions.length}
                </span>
                <button
                  onClick={() => setActiveInterview(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  End Session
                </button>
              </div>

              {currentQuestion ? (
                <div className="space-y-4">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                      {currentQuestion.category}
                    </span>
                    <p className="text-sm font-bold text-white pt-1">{currentQuestion.questionText}</p>
                  </div>

                  {!evaluation ? (
                    <form onSubmit={handleSubmitAnswer} className="space-y-3">
                      <textarea
                        value={userAnswerText}
                        onChange={(e) => setUserAnswerText(e.target.value)}
                        rows={5}
                        required
                        placeholder="Type your response here using the STAR method (Situation, Task, Action, Result)..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={evaluating || !userAnswerText.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
                        <span>{evaluating ? 'Evaluating Answer...' : 'Submit Answer for AI Evaluation'}</span>
                      </button>
                    </form>
                  ) : (
                    /* AI Evaluation Scorecard */
                    <div className="space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">AI Evaluation Scorecard</span>
                        <span className="text-xl font-extrabold text-blue-400">{evaluation.score}/100</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <p className="font-bold text-white">{evaluation.clarityScore}%</p>
                          <p className="text-[10px] text-slate-400">Clarity</p>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <p className="font-bold text-white">{evaluation.relevanceScore}%</p>
                          <p className="text-[10px] text-slate-400">Relevance</p>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <p className="font-bold text-white">{evaluation.technicalScore}%</p>
                          <p className="text-[10px] text-slate-400">Technical</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{evaluation.feedback}</p>

                      {currentQuestionIdx < activeInterview.questions.length - 1 ? (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl"
                        >
                          Next Question &rarr;
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveInterview(null)}
                          className="w-full py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
                        >
                          Finish Session & Save Scorecard
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">Session Completed!</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
