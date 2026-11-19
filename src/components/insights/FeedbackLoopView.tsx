import React, { useState } from 'react';
import {
  Repeat,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Send,
  BarChart3,
  Award,
  Layers,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { INITIAL_FEEDBACK_METRICS } from '../../data/mockData';
import { useHospital } from '../../context/HospitalContext';

export const FeedbackLoopView: React.FC = () => {
  const { currentUser, addToast } = useHospital();
  const [feedbackCategory, setFeedbackCategory] = useState('ICU Bed Allocation');
  const [feedbackRating, setFeedbackRating] = useState<'Accurate & Helpful' | 'Slightly Overallocated' | 'Underallocated'>('Accurate & Helpful');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Feedback Submitted', 'Clinical validation note incorporated into nightly model retraining weight updates.', 'success');
    setTimeout(() => {
      setFeedbackNote('');
      setSubmitted(false);
    }, 3000);
  };

  const FEEDBACK_PIPELINE_STEPS = [
    { title: 'Predicted Demand', desc: 'DeepAR Ingress Time-Series', color: 'text-[#243B80]' },
    { title: 'Actual Outcome', desc: 'Real Hospital Census Telemetry', color: 'text-[#1C1C1E]' },
    { title: 'Compare & Triage', desc: 'Hourly Residual Calculus', color: 'text-[#667085]' },
    { title: 'Measure Error', desc: 'MAPE & Divergence Index (3.1%)', color: 'text-[#A16207]' },
    { title: 'Model Feedback', desc: 'Loss Penalty Gradient', color: 'text-[#4F7A5F]' },
    { title: 'Improved Prediction', desc: 'Continuous Neural Calibration', color: 'text-[#243B80]' },
  ];

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Top Header Summary */}
      <div className="section-panel p-6 lg:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#243B80]/10 border border-[#243B80]/25 text-[#243B80] uppercase tracking-wider flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3" />
              CLOSED-LOOP MACHINE LEARNING
            </span>
            <span className="text-xs text-[#8B95A5]">Continuous Model Retraining</span>
          </div>
          <h2 className="display-heading-compact">
            Prediction & Performance Feedback Loop
          </h2>
          <p className="text-xs text-[#667085]">
            How CareSetu continuously benchmarks prediction residuals against real clinical outcomes to refine future recommendations.
          </p>
        </div>

        {/* 3 Core Performance Scorecards */}
        <div className="metric-strip text-xs font-mono">
          <div className="px-3 py-2 text-center">
            <span className="text-[10px] text-[#8B95A5] block font-medium">Model MAPE</span>
            <span className="text-sm font-bold text-[#4F7A5F]">3.1%</span>
          </div>
          <div className="px-3 py-2 text-center">
            <span className="text-[10px] text-[#8B95A5] block font-medium">Clinician Acceptance</span>
            <span className="text-sm font-bold text-[#243B80]">94.7%</span>
          </div>
          <div className="px-3 py-2 text-center">
            <span className="text-[10px] text-[#8B95A5] block font-medium">Wait Time Delta</span>
            <span className="text-sm font-bold text-[#4F7A5F]">↓ 22.8%</span>
          </div>
        </div>
      </div>

      {/* Section Visual Pipeline: Continuous Learning Workflow */}
      <div className="quiet-panel p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading flex items-center gap-2">
          <Repeat className="w-4 h-4 text-[#243B80]" />
          Continuous Learning Architecture
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {FEEDBACK_PIPELINE_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#FBFBF8] border border-subtle space-y-1 relative group hover:border-[#243B80]/40 transition-colors"
            >
              <div className="text-[10px] font-mono text-[#8B95A5] flex items-center justify-between font-medium">
                <span>STAGE 0{idx + 1}</span>
                {idx < 5 && <ArrowRight className="w-3 h-3 text-[#8B95A5]/40 hidden lg:block" />}
              </div>
              <div className={`text-xs font-bold ${step.color} mt-1`}>{step.title}</div>
              <p className="text-[11px] text-[#667085] leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Accuracy Chart & Clinician Feedback Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: Historical MAPE & Accuracy Chart */}
        <div className="lg:col-span-7 data-canvas p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-subtle">
            <div>
              <h3 className="text-base font-semibold text-[#1C1C1E] font-heading">
                7-Day Ingress Residuals & Accuracy
              </h3>
              <p className="text-xs text-[#667085]">Daily predicted volume vs recorded HIS admissions</p>
            </div>
            <span className="text-xs font-mono text-[#4F7A5F] bg-[#4F7A5F]/10 px-2 py-0.5 rounded border border-[#4F7A5F]/20 font-semibold">
              Low Divergence
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INITIAL_FEEDBACK_METRICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(42, 36, 33, 0.08)" vertical={false} />
                <XAxis dataKey="date" stroke="#8B95A5" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B95A5" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-subtle rounded-lg p-2.5 shadow-modal text-xs font-mono">
                          <div className="text-[#1C1C1E] font-bold mb-1">{label}</div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex justify-between gap-4 text-[11px]">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-semibold text-[#1C1C1E]">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="predictedDemand" name="Predicted Demand" stroke="#243B80" strokeWidth={2.2} dot={{ r: 3, fill: '#243B80' }} />
                <Line type="monotone" dataKey="actualDemand" name="Actual Ingress" stroke="#8B95A5" strokeWidth={2} dot={{ r: 3, fill: '#8B95A5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 cols: Human-in-the-Loop Clinician Feedback Input */}
        <div className="lg:col-span-5 section-panel p-5 flex flex-col justify-between">
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#1C1C1E] font-heading">
                Clinician Feedback Gate
              </h3>
              <p className="text-xs text-[#667085]">
                Provide clinical evaluations on AI recommendations to tune model loss weights.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#667085] font-medium">Recommendation Domain</label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full bg-[#FBFBF8] border border-subtle rounded-lg px-3 py-2 text-xs text-[#1C1C1E] focus:outline-none font-medium"
              >
                <option value="ICU Bed Allocation">ICU Bed Allocation</option>
                <option value="Emergency Physician Roster">Emergency Physician Roster</option>
                <option value="CT Scanner Throughput">CT Scanner Throughput</option>
                <option value="Outpatient Triage Pacing">Outpatient Triage Pacing</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#667085] font-medium">Clinical Accuracy Assessment</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Accurate & Helpful', 'Slightly Overallocated', 'Underallocated'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFeedbackRating(r)}
                    className={`p-2 rounded-lg text-center border text-[10px] transition-colors ${
                      feedbackRating === r
                        ? 'bg-[#243B80]/15 border-[#243B80]/40 text-[#243B80] font-semibold'
                        : 'bg-[#FBFBF8] border-subtle text-[#667085] hover:text-[#1C1C1E]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#667085] font-medium">Physician Clinical Notes</label>
              <textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="E.g., Friday evening monsoon rain required 2 extra trauma beds rather than 1..."
                className="w-full bg-[#FBFBF8] border border-subtle rounded-lg p-2.5 text-xs text-[#1C1C1E] focus:outline-none focus:border-[#243B80]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#243B80] hover:bg-[#101827] text-white font-semibold text-xs rounded-lg transition-subtle flex items-center justify-center gap-2 shadow-surface hover:-translate-y-0.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Model Feedback</span>
            </button>
          </form>

          {submitted && (
            <div className="mt-3 p-2.5 rounded-lg bg-[#4F7A5F]/10 border border-[#4F7A5F]/30 text-xs text-[#4F7A5F] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Feedback logged in hospital reinforcement tuning pool.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
