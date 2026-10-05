'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ArrowRight,
  Clock
} from 'lucide-react';

export default function AssessmentPage() {
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.success) setUser(meData.data.user);

      const res = await fetch('/api/assessment');
      const data = await res.json();
      if (data.success) setAssessments(data.data.assessments || []);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (ass: any) => {
    setActiveAssessment(ass);
    setUserAnswers({});
    setSubmissionResult(null);
  };

  const handleOptionSelect = (questionId: string, optionText: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const handleSubmit = async () => {
    if (!activeAssessment) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: activeAssessment.id,
          answers: userAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionResult(data.data);
        fetchAssessments();
      }
    } catch (err) {
      console.error('Assessment submit error:', err);
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" />
              Technical & Aptitude Evaluation
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Skill Assessments
            </h1>
            <p className="text-xs text-slate-400">
              Verify your technical competencies and quantitative reasoning through automated tests. Performance directly feeds into your readiness score.
            </p>
          </div>

          {!activeAssessment ? (
            /* Assessment Catalog */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessments.map((ass) => {
                const latestResult = ass.results && ass.results.length > 0 ? ass.results[0] : null;

                return (
                  <div
                    key={ass.id}
                    className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold uppercase">
                          {ass.category}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ass.durationMinutes} mins
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-white">{ass.title}</h2>
                      <p className="text-xs text-slate-400">{ass.questions.length} Questions • Pass mark: {ass.passPercentage}%</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      {latestResult ? (
                        <div className="flex items-center space-x-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300">Score: {latestResult.percentage}% ({latestResult.passed ? 'PASSED' : 'RETRY'})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Not Attempted</span>
                      )}

                      <button
                        onClick={() => handleStartAssessment(ass)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20"
                      >
                        {latestResult ? 'Retake Test' : 'Start Assessment'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Active Test Interface */
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">{activeAssessment.title}</h2>
                  <p className="text-xs text-slate-400">{activeAssessment.questions.length} Questions</p>
                </div>
                <button
                  onClick={() => setActiveAssessment(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:text-white"
                >
                  Back to List
                </button>
              </div>

              {submissionResult ? (
                /* Result Screen */
                <div className="text-center py-8 space-y-4">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                    submissionResult.passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    <Award className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Assessment {submissionResult.passed ? 'Passed!' : 'Completed'}
                  </h3>

                  <p className="text-3xl font-extrabold text-blue-400">
                    {submissionResult.percentage}%
                  </p>

                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your assessment score has been recorded and updated in your Readiness Score breakdown.
                  </p>

                  <button
                    onClick={() => setActiveAssessment(null)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              ) : (
                /* Questions Form */
                <div className="space-y-6">
                  {activeAssessment.questions.map((q: any, idx: number) => {
                    let options: string[] = [];
                    try {
                      options = JSON.parse(q.optionsJson);
                    } catch {}

                    return (
                      <div key={q.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-xs">
                        <p className="font-bold text-slate-200">
                          Q{idx + 1}. {q.questionText}
                        </p>

                        <div className="space-y-2">
                          {options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                userAnswers[q.id] === opt
                                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={userAnswers[q.id] === opt}
                                onChange={() => handleOptionSelect(q.id, opt)}
                                className="hidden"
                              />
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                userAnswers[q.id] === opt ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                              }`}>
                                {userAnswers[q.id] === opt && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                              </div>
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-blue-600/20"
                  >
                    {submitting ? 'Evaluating Test...' : 'Submit Assessment Answers'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
