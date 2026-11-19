import React, { useState } from 'react';
import { Brain, Check, Edit3, X, Sparkles, ChevronDown, ChevronUp, Clock, UserCheck, Shield } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';

export const RecommendationsView: React.FC = () => {
  const { recommendations, approveRecommendation, rejectRecommendation, currentUser, auditLogs } = useHospital();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'MODIFIED' | 'REJECTED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('rec-icu-01');

  const filteredRecs = recommendations.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="editorial-page space-y-10 pb-12">
      {/* Header Banner */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-5">
            <span className="eyebrow flex items-center gap-1.5">
              <Brain className="w-3 h-3" />
              EXPLAINABLE CLINICAL INTERVENTIONS
            </span>
          </div>
          <h2 className="display-heading">
            AI Optimization<br />Recommendations
          </h2>
        </div>

        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-sm md:text-base text-[#667085] leading-7">Human Approval Enforced</p>
          <p className="text-xs text-[#667085]">
            Transparent algorithmic proposals for bed reallocation, physician shift extensions, and scanner buffering.
          </p>

          {/* Filter Tabs */}
          <div className="mt-7 segmented-control">
            {(['ALL', 'PENDING', 'APPROVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-subtle ${
                  filter === f
                    ? 'bg-[#243B80] text-white font-semibold shadow-sm'
                    : 'text-[#667085] hover:text-[#1C1C1E]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isPending = rec.status === 'PENDING';
          const isApproved = rec.status === 'APPROVED';

          return (
            <div
              key={rec.id}
              className={`section-panel p-5 lg:p-6 transition-subtle ${
                isPending
                  ? 'border-[#243B80]/40 hover:border-[#243B80]/60 hover:-translate-y-0.5'
                  : 'border-subtle hover:-translate-y-0.5'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-subtle">
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={rec.priority} size="sm" />
                  <span className="text-xs font-mono text-[#8B95A5] font-semibold">{rec.id}</span>
                  <span className="text-xs text-[#8B95A5]">· {rec.timestamp}</span>
                </div>
                <StatusBadge status={rec.status} size="sm" />
              </div>

              <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 8 cols: Title, Action, and Expected Impact */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#1C1C1E] font-heading">
                      {rec.title}
                    </h3>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#A14D45]/10 border border-[#A14D45]/25 text-[#A14D45]">
                      {rec.predictedIncrease}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F7F7F3] border border-subtle text-xs text-[#1C1C1E] leading-relaxed">
                    <span className="text-[#243B80] font-semibold block mb-0.5">Proposed Action:</span>
                    {rec.actionSummary}
                  </div>

                  {/* Impact metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {rec.impactMetrics.map((imp, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#FFFFFF] border border-subtle text-center shadow-surface">
                        <div className="text-[10px] text-[#667085] truncate font-medium">{imp.label}</div>
                        <div className="text-xs font-bold text-[#1C1C1E] font-mono mt-0.5">{imp.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Explainable accordion */}
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                      className="text-xs text-[#243B80] hover:text-[#101827] flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{expandedId === rec.id ? 'Hide Rationale' : 'View Explainable Rationale (5 Steps)'}</span>
                      {expandedId === rec.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedId === rec.id && (
                      <div className="mt-2 p-3.5 rounded-xl bg-[#FFFFFF] border border-subtle space-y-2 text-xs text-[#667085] animate-in fade-in shadow-surface">
                        {rec.explanations.map((exp, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-[#243B80] font-mono text-[10px] mt-0.5 font-bold">0{idx + 1}.</span>
                            <span className="text-[#1C1C1E]">{exp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 4 cols: Suggested Allocations & Actions */}
                <div className="lg:col-span-4 bg-[#F7F7F3] p-3.5 rounded-xl border border-subtle flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-2">
                      Suggested Reallocations
                    </span>
                    <div className="space-y-1.5 text-xs font-mono">
                      {rec.suggestedAllocations.map((alloc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-white/80 shadow-surface">
                          <span className="text-[#1C1C1E] font-sans text-[11px] truncate max-w-[130px] font-medium">
                            {alloc.resource}
                          </span>
                          <span className="text-[#4F7A5F] font-bold">
                            {alloc.delta > 0 ? `+${alloc.delta}` : alloc.delta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approve / Reject Buttons */}
                  <div className="pt-3 border-t border-subtle">
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveRecommendation(rec.id)}
                          className="flex-1 py-2 px-3 bg-[#243B80] hover:bg-[#101827] text-white font-semibold text-xs rounded-lg transition-subtle flex items-center justify-center gap-1.5 shadow-elevated hover:-translate-y-0.5 active:translate-y-0 font-bold"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectRecommendation(rec.id)}
                          className="py-2 px-3 bg-white/90 hover:bg-[#FFFFFF] border border-white text-[#667085] hover:text-[#A14D45] text-xs rounded-lg transition-subtle font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-1.5 text-xs text-[#4F7A5F] font-medium bg-[#4F7A5F]/10 rounded border border-[#4F7A5F]/20">
                        ✓ Approved by {rec.approvedBy || currentUser.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
