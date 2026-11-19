import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  RefreshCw,
  Info,
  Shield,
  Layers,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';

export const OptimizationView: React.FC = () => {
  const {
    allocations,
    applyOptimizedAllocations,
    currentUser,
    auditLogs,
  } = useHospital();

  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyOptimizedAllocations();
      setHasApplied(true);
    } finally {
      setIsApplying(false);
    }
  };

  const REASONING_STEPS = [
    {
      num: '01',
      title: 'Temporal Surge Forecast',
      desc: 'Emergency admissions are forecast to increase by +28% between 18:00 and 22:00 due to evening traffic and acute referrals.',
    },
    {
      num: '02',
      title: 'Critical Occupancy Ceiling',
      desc: 'Current ICU utilization has reached 92.5% with only 3 non-reserved beds available. Unmitigated ingress would trigger diversion protocol.',
    },
    {
      num: '03',
      title: 'Protected Reserve Constraint',
      desc: 'Five ICU beds and three trauma physicians must remain strictly protected for sudden code-blue and Level-1 poly-trauma.',
    },
    {
      num: '04',
      title: 'Staff Availability Balancing',
      desc: 'Two emergency physicians and five critical care nurses are finishing elective rosters and can be safely redeployed without compromising outpatient safety.',
    },
    {
      num: '05',
      title: 'Prescriptive Rebalancing',
      desc: 'Optimization algorithm rebalances beds from HDU flex wing and adjusts OPD physician distribution to keep door-to-doctor time under 34 mins.',
    },
  ];

  return (
    <div className="editorial-page space-y-10 pb-12">
      {/* Top Banner & Current Situation Summary */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2">
              <span className="eyebrow flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                MILP OPTIMIZATION ENGINE v4.2
              </span>
            </div>
            <h2 className="display-heading mt-5">
              Resource<br />Optimization Engine
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pb-2">
            <p className="text-sm md:text-base text-[#667085] leading-7">Mixed-Integer Linear Programming</p>
            <p className="text-xs text-[#667085]">
              Match predicted patient demand with available hospital physical capacity and staffing constraints.
            </p>

          {/* Current Situation 3 Metrics */}
          <div className="mt-7 metric-strip text-xs font-mono">
            <div className="px-3 py-2">
              <span className="text-[10px] text-[#8B95A5] uppercase block font-medium">Predicted Demand</span>
              <span className="text-sm font-semibold font-mono text-[#A14D45]">+18% Peak Ingress</span>
            </div>
            <div className="px-3 py-2">
              <span className="text-[10px] text-[#8B95A5] uppercase block font-medium">Available Capacity</span>
              <span className="text-sm font-semibold font-mono text-[#4F7A5F]">82% Total Ready</span>
            </div>
            <div className="px-3 py-2">
              <span className="text-[10px] text-[#8B95A5] uppercase block font-medium">Resource Pressure</span>
              <span className="text-sm font-semibold font-mono text-[#A16207]">HIGH (ICU 92%)</span>
            </div>
          </div>
        </div>
        </section>

        {/* Quick Action Trigger */}
        <section className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#667085]">
            <Shield className="w-4 h-4 text-[#4F7A5F]" />
            <span>All proposed reallocations honor minimum nurse-patient ratio (1:2) and physician shift limits.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              disabled={isApplying || hasApplied}
              className={`py-2 px-4 rounded-lg font-semibold text-xs transition-subtle flex items-center gap-2 shadow-surface ${
                hasApplied
                  ? 'bg-[#4F7A5F]/10 text-[#4F7A5F] border border-[#4F7A5F]/25'
                  : 'bg-[#243B80] hover:bg-[#101827] text-white hover:-translate-y-0.5 active:translate-y-0 font-bold shadow-elevated'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApplying ? 'Deploying...' : hasApplied ? 'Allocations Active' : 'Apply Optimal Allocation'}</span>
            </button>
          </div>
        </section>

      {/* Main Grid: Allocation Table + Explainable Decision Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Recommended Allocation Table */}
        <div className="lg:col-span-7 bg-transparent rounded-none p-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-subtle mb-3">
              <div>
                <h3 className="text-base font-semibold text-[#1C1C1E] font-heading">
                  Recommended Resource Allocation
                </h3>
                <p className="text-xs text-[#667085]">
                  Comparative breakdown of baseline vs algorithmically optimized allocation
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#8B95A5]">6 Asset Adjustments</span>
            </div>

            {/* Clean Enterprise Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-subtle text-[#8B95A5] font-semibold text-[11px] uppercase tracking-wider bg-[#FBFBF8]/50">
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-2 text-center">Category</th>
                    <th className="py-2.5 px-2 text-right">Current</th>
                    <th className="py-2.5 px-2 text-right">Recommended</th>
                    <th className="py-2.5 px-2 text-right">Change</th>
                    <th className="py-2.5 px-3 text-center">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle font-mono">
                  {allocations.map((item) => {
                    const isPositive = item.change > 0;
                    const isNegative = item.change < 0;

                    return (
                      <tr
                        key={item.id}
                    className="hover:bg-[#FFFFFF] transition-colors group"
                      >
                        <td className="py-3 px-3">
                          <span className="text-[#1C1C1E] font-medium font-sans block">
                            {item.resource}
                          </span>
                          <span className="text-[10px] text-[#8B95A5] font-sans truncate max-w-xs block">
                            {item.rationale}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FBFBF8] text-[#1C1C1E] border border-subtle font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-[#667085] font-medium">
                          {item.current}
                        </td>
                        <td className="py-3 px-2 text-right text-[#1C1C1E] font-bold">
                          {item.recommended}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                              isPositive
                                ? 'bg-[#4F7A5F]/10 text-[#4F7A5F]'
                                : isNegative
                                ? 'bg-[#A16207]/10 text-[#A16207]'
                                : 'text-[#8B95A5]'
                            }`}
                          >
                            {isPositive ? `+${item.change}` : item.change}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-[11px]">
                          <span className="text-[#8B95A5]">{item.utilizationCurrent}%</span>
                          <span className="mx-1 text-[#8B95A5]/40">→</span>
                          <span className="text-[#4F7A5F] font-bold">{item.utilizationOptimized}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expected Outcome Metrics Comparison */}
          <div className="mt-5 pt-4 border-t border-subtle">
            <h4 className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider mb-2.5">
              Projected System Outcome Diff
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#FFFFFF] border border-subtle space-y-1 shadow-surface">
                <span className="text-[11px] text-[#667085]">Avg Triage Waiting Time</span>
                <div className="text-sm font-semibold font-mono text-[#4F7A5F] flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4 text-[#4F7A5F]" />
                  42 min → 34 min (-19%)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FFFFFF] border border-subtle space-y-1 shadow-surface">
                <span className="text-[11px] text-[#667085]">Hospital Resource Utilization</span>
                <div className="text-sm font-semibold font-mono text-[#243B80] flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-[#243B80]" />
                  82% → 89% (Optimal)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FFFFFF] border border-subtle space-y-1 shadow-surface">
                <span className="text-[11px] text-[#667085]">Emergency Reserve Protocol</span>
                <div className="text-sm font-semibold font-mono text-[#4F7A5F] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#4F7A5F]" />
                  100% Protected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Explainable Decision Panel (01 to 05) */}
        <div className="lg:col-span-5 section-panel p-5 lg:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-subtle mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#1C1C1E] font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#243B80]" />
                  Why this allocation?
                </h3>
                <p className="text-xs text-[#667085]">
                  Stepwise transparent reasoning generated by the clinical constraints solver
                </p>
              </div>
            </div>

            {/* 01 - 05 Step Sequence */}
            <div className="space-y-3.5">
              {REASONING_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="p-3 rounded-xl bg-white/90 border border-white/80 space-y-1 hover:border-[#243B80]/40 hover:-translate-y-0.5 transition-subtle shadow-surface"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#243B80] bg-[#FBFBF8] px-1.5 py-0.5 rounded border border-[#243B80]/25">
                      {step.num}
                    </span>
                    <span className="text-xs font-semibold text-[#1C1C1E]">{step.title}</span>
                  </div>
                  <p className="text-[11px] text-[#667085] leading-relaxed pl-7">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-subtle text-xs text-[#667085] flex items-center justify-between">
            <span>Clinician Sign-off: Required</span>
            <span className="font-mono text-[11px] text-[#243B80] font-semibold">Human-in-the-Loop Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
