import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ExternalLink,
  Shield,
  Clock,
  Flame,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useHospital } from '../../context/HospitalContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { FORECAST_24H, FORECAST_7D, FORECAST_30D } from '../../data/mockData';

export const OverviewDashboard: React.FC = () => {
  const {
    metrics,
    resourcePressure,
    recommendations,
    alerts,
    auditLogs,
    departments,
    protectedCapacity,
    approveRecommendation,
    rejectRecommendation,
    currentUser,
    lastUpdated,
    isLiveUpdating,
    setActiveNav,
  } = useHospital();

  const [forecastHorizon, setForecastHorizon] = useState<'24H' | '7D' | '30D'>('24H');
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const forecastData =
    forecastHorizon === '7D'
      ? FORECAST_7D
      : forecastHorizon === '30D'
      ? FORECAST_30D
      : FORECAST_24H;

  const topRecommendation = recommendations.find((r) => r.status === 'PENDING') || recommendations[0];
  const criticalAlerts = alerts.filter((a) => a.level === 'CRITICAL');
  const timelineItems = auditLogs.slice(0, 3);
  const highestPressure = [...resourcePressure].sort((a, b) => b.utilization - a.utilization)[0];

  const handleApprove = async (recId: string) => {
    setIsApproving(recId);
    try {
      await approveRecommendation(recId);
    } finally {
      setIsApproving(null);
    }
  };

  const handleReject = async (recId: string) => {
    await rejectRecommendation(recId);
  };

  return (
    <div className="editorial-page space-y-10 pb-12">
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">CareSetu Command Center</div>
          <h2 className="display-heading">
            Hospital<br />Overview
          </h2>
        </div>
        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-sm md:text-base text-[#667085] leading-7 max-w-xl">
            Live resource intelligence and operational command center
          </p>

          <div className="command-status mt-7 p-5">
            <div className="relative z-10 flex items-start justify-between gap-5">
              <div>
                <div className="eyebrow mb-3">Realtime Hospital State</div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${isLiveUpdating ? 'bg-[#4F7A5F]' : 'bg-[#A16207]'}`} />
                  <span className="text-sm font-semibold text-[#101827]">
                    {isLiveUpdating ? 'System Operational' : 'Telemetry Paused'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#667085]">
                  {currentUser.hospitalName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#8B95A5] font-semibold">
                  Updated
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-[#243B80]">{lastUpdated}</div>
              </div>
            </div>
            <div className="relative z-10 mt-5 grid grid-cols-3 gap-px border-y border-[#D9DDE5]/80 bg-[#D9DDE5]/80 text-xs">
              <div className="bg-white/72 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#8B95A5]">Pressure</div>
                <div className="mt-1 font-mono font-semibold text-[#101827]">{highestPressure?.utilization ?? 0}%</div>
              </div>
              <div className="bg-white/72 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#8B95A5]">Critical</div>
                <div className="mt-1 font-mono font-semibold text-[#A14D45]">{criticalAlerts.length}</div>
              </div>
              <div className="bg-white/72 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#8B95A5]">AI Queue</div>
                <div className="mt-1 font-mono font-semibold text-[#243B80]">
                  {recommendations.filter((r) => r.status === 'PENDING').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Top Metric Cards */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Critical Operational Metrics</div>
            <h3 className="text-2xl font-semibold text-[#101827] font-heading">Hospital Resource State</h3>
          </div>
          <button
            onClick={() => setActiveNav('alerts')}
            className="hidden sm:inline-flex text-[10px] uppercase tracking-[0.14em] font-semibold text-[#243B80] hover:text-[#101827] transition-colors"
          >
            Review pressure signals
          </button>
        </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-[#D9DDE5]/80 border-y border-[#D9DDE5]/80">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            data={metric}
            onClick={() => {
              if (metric.id === 'beds') setActiveNav('beds');
              if (metric.id === 'doctors') setActiveNav('doctors');
              if (metric.id === 'diagnostics') setActiveNav('diagnostics');
              if (metric.id === 'appointments') setActiveNav('appointments');
              if (metric.id === 'alerts') setActiveNav('alerts');
            }}
          />
        ))}
      </div>
      </section>

      {/* Row 2: Resource Pressure Panel & AI Recommendation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 7 cols: Resource Pressure Panel */}
        <div className="lg:col-span-7 quiet-panel rounded-none lg:rounded-2xl p-5 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-subtle mb-6">
              <div>
                <div className="eyebrow mb-2">Resource Intelligence</div>
                <h3 className="text-2xl font-semibold text-[#101827] font-heading">
                  Resource Pressure
                </h3>
                <p className="text-xs text-[#667085]">
                  Current utilization across critical resources
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-[#667085] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#243B80]"></span>
                  Utilized
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A16207]"></span>
                  Reserved
                </span>
              </div>
            </div>

            {/* 4 Horizontal Resource Rows */}
            <div className="space-y-6">
              {resourcePressure.map((res) => {
                const isCritical = res.status === 'CRITICAL';
                const isWarning = res.status === 'WARNING';

                const statusColor = isCritical
                  ? 'text-[#A14D45]'
                  : isWarning
                  ? 'text-[#A16207]'
                  : 'text-[#4F7A5F]';

                const reservedPercent = Math.round((res.reserved / res.total) * 100);
                const utilizedPercent = Math.max(0, res.utilization - reservedPercent);

                return (
                  <div key={res.id} className="space-y-2.5 rounded-lg hover:bg-[#FFFFFF] transition-subtle">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1C1C1E] font-semibold">{res.name}</span>
                      <span className={`${statusColor} font-semibold font-mono tabular-nums`}>
                        {res.utilization}%
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-2.5 progress-track rounded-full overflow-hidden flex p-[1px]">
                      <div
                        className="h-full progress-fill-accent rounded-l-full transition-all duration-700"
                        style={{ width: `${utilizedPercent}%` }}
                      />
                      <div
                        className="h-full progress-fill-reserved rounded-r-full transition-all duration-700"
                        style={{ width: `${reservedPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#8B95A5] tracking-wide">
                      <span>{res.available} available</span>
                      <span>{res.reserved} reserved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick summary note */}
          <div className="mt-6 pt-4 border-t border-subtle flex items-center justify-between text-[10px] text-[#8B95A5]">
            <span className="italic">
              Optimization model is preserving emergency margin for unplanned surge.
            </span>
            <button
              onClick={() => setActiveNav('simulation')}
              className="text-[#243B80] hover:text-[#101827] transition-colors uppercase tracking-[0.16em] font-semibold"
            >
              Simulate Surge →
            </button>
          </div>
        </div>

        {/* Right 5 cols: AI Recommendation Engine Panel */}
        <div className="lg:col-span-5 section-panel p-5 lg:p-8 relative overflow-hidden flex flex-col justify-between">
          {/* Top Right AI Insight Badge */}
          <div className="absolute top-0 right-0 p-4">
            <span className="text-[9px] font-bold ai-badge px-2.5 py-1 rounded-full tracking-widest uppercase font-mono">
              AI Insight
            </span>
          </div>

          <div>
            <div className="eyebrow mb-2">Operational Intelligence</div>
            <h3 className="text-2xl font-semibold text-[#101827] font-heading mb-1">
              AI Optimization
            </h3>
            <p className="text-xs text-[#667085] mb-5">
              Forecast indicates high pressure in ICU within the next 4 hours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#8B95A5] uppercase tracking-[0.16em] font-semibold">
                    Predicted Increase
                  </p>
                  <p className="text-xl font-semibold text-[#243B80] tracking-tight mt-0.5">
                    {topRecommendation.predictedIncrease} Demand
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8B95A5] uppercase tracking-[0.16em] font-semibold">
                    Recommended Action
                  </p>
                  <p className="text-xs text-[#1C1C1E] leading-relaxed mt-1 font-medium">
                    {topRecommendation.actionSummary}
                  </p>
                </div>
              </div>

              {/* Expected Impact Box */}
              <div className="bg-[#F7F7F3] p-4 rounded-xl border border-subtle space-y-2.5 flex flex-col justify-center">
                <p className="text-[10px] text-[#8B95A5] uppercase tracking-[0.16em] font-semibold">
                  Expected Impact
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#667085]">Wait Time</span>
                  <span className="text-[#4F7A5F] font-mono font-semibold">↓ 18%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#667085]">Utilization</span>
                  <span className="text-[#4F7A5F] font-mono font-semibold">↑ 11%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#667085]">ICU Reserve</span>
                  <span className="text-[#243B80] font-mono font-semibold">Protected</span>
                </div>
              </div>
            </div>

            {/* Expandable Explainable AI Rationale */}
            <div className="pt-2 border-t border-[#243B80]/20">
              <button
                onClick={() =>
                  setExpandedExplanationId(
                    expandedExplanationId === topRecommendation.id ? null : topRecommendation.id
                  )
                }
                className="w-full flex items-center justify-between text-xs text-[#243B80] font-semibold hover:text-[#101827] transition-colors py-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Why this recommendation? (Explainable Logic)
                </span>
                {expandedExplanationId === topRecommendation.id ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {expandedExplanationId === topRecommendation.id && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-[#F7F7F3] border border-subtle space-y-2 text-xs text-[#667085] animate-in fade-in">
                  {topRecommendation.explanations.map((exp, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#243B80] font-mono text-[10px] mt-0.5 font-bold">0{idx + 1}.</span>
                      <span className="leading-relaxed text-[11px] text-[#1C1C1E]">{exp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Approval Bar */}
          <div className="mt-6 pt-4 border-t border-[#243B80]/20 flex items-center gap-3">
            {topRecommendation.status === 'PENDING' ? (
              <>
                <button
                  id="btn-approve-rec"
                  disabled={isApproving !== null}
                  onClick={() => handleApprove(topRecommendation.id)}
                  className="flex-1 bg-[#243B80] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#101827] transition-subtle uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 shadow-elevated hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isApproving ? 'Executing...' : 'Approve Allocation'}</span>
                </button>

                <button
                  id="btn-modify-rec"
                  onClick={() => setActiveNav('optimization')}
                  className="px-6 bg-white border border-subtle text-xs py-2.5 rounded-lg hover:bg-[#F7F7F3] hover:border-[#C9CED8] transition-subtle uppercase tracking-[0.14em] text-[#1C1C1E] font-semibold"
                >
                  Modify
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#4F7A5F]/10 border border-[#4F7A5F]/25 text-xs text-[#4F7A5F]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4" />
                  Allocation Approved by {topRecommendation.approvedBy || currentUser.name}
                </span>
                <button
                  onClick={() => setActiveNav('recommendations')}
                  className="text-[11px] text-[#243B80] hover:underline uppercase tracking-wider font-semibold"
                >
                  View All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Demand Forecast Chart & Department Demand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Patient Demand Forecast Chart */}
        <div className="lg:col-span-8 bg-transparent rounded-none p-0 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-subtle mb-6">
              <div>
                <h3 className="text-sm font-medium text-[#1C1C1E]">
                  Patient Demand Forecast
                </h3>
                <p className="text-xs text-[#667085]">
                  Predicted demand ingress based on historical admission seasonality & weather inputs
                </p>
              </div>

              {/* Forecast Horizon Filters (24H, 7D, 30D) */}
              <div className="segmented-control">
                {(['24H', '7D', '30D'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setForecastHorizon(h)}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition-subtle ${
                      forecastHorizon === h
                        ? 'bg-[#243B80] text-white font-semibold shadow-sm'
                        : 'text-[#667085] hover:text-[#1C1C1E]'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Forecast Graph */}
            <div className="data-canvas h-80 w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42, 36, 33, 0.08)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#8B95A5"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(42, 36, 33, 0.15)' }}
                  />
                  <YAxis
                    stroke="#8B95A5"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-subtle rounded-lg p-2.5 shadow-modal text-xs font-mono">
                            <div className="text-[#1C1C1E] font-semibold mb-1">{label}</div>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-semibold text-[#1C1C1E]">
                                  {entry.value !== null && entry.value !== undefined ? `${entry.value} patients` : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Predicted area envelope */}
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    fill="#FBFBF8"
                    stroke="none"
                  />
                  {/* Predicted Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted Demand"
                    stroke="#243B80"
                    strokeWidth={2.2}
                    dot={{ fill: '#243B80', r: 3 }}
                    activeDot={{ r: 5, fill: '#101827' }}
                  />
                  {/* Actual Demand Line */}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Demand"
                    stroke="#8B95A5"
                    strokeWidth={2}
                    dot={{ fill: '#8B95A5', r: 3 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend & Confidence Footnote */}
          <div className="mt-3 pt-3 border-t border-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#243B80]" />
                <span className="text-[#667085] text-[11px] font-medium">Predicted Demand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#8B95A5]" />
                <span className="text-[#667085] text-[11px] font-medium">Actual Demand</span>
              </div>
            </div>
            <span className="text-[11px] text-[#8B95A5] font-mono">
              Model: DeepAR Neural Ensemble · 98% Confidence
            </span>
          </div>
        </div>

        {/* Right 4 cols: Demand by Department */}
        <div className="lg:col-span-4 section-panel p-5 lg:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-subtle mb-5">
              <div>
                <h3 className="text-sm font-medium text-[#1C1C1E]">
                  Demand by Department
                </h3>
                <p className="text-xs text-[#667085]">Active patient load across core wings</p>
              </div>
            </div>

            <div className="space-y-4">
              {departments.map((dept) => {
                let barFill = 'bg-[#243B80]';
                if (dept.status === 'CRITICAL') barFill = 'bg-[#A14D45]';
                else if (dept.status === 'WARNING') barFill = 'bg-[#A16207]';

                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#667085] font-medium">{dept.name}</span>
                      <span className="font-mono text-xs font-semibold text-[#1C1C1E]">
                        {dept.utilization}%
                      </span>
                    </div>

                    <div className="h-2 w-full progress-track rounded-full overflow-hidden p-[1px]">
                      <div
                        className={`h-full rounded-full ${barFill} transition-all duration-700`}
                        style={{ width: `${dept.utilization}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#8B95A5]">
                      <span>{dept.activeDoctors} doctors active</span>
                      <span>{dept.waitingPatients} in queue</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-subtle">
            <button
              onClick={() => setActiveNav('forecast')}
              className="w-full py-1.5 text-center text-xs text-[#243B80] hover:text-[#101827] transition-colors uppercase tracking-wider font-semibold"
            >
              View Detailed Forecast →
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Alerts and operational activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 quiet-panel p-5 lg:p-8">
          <div className="flex items-end justify-between gap-4 pb-5 border-b border-subtle">
            <div>
              <div className="eyebrow mb-2">Operational Risk</div>
              <h3 className="text-2xl font-semibold text-[#101827] font-heading">Critical Alerts</h3>
            </div>
            <div className="editorial-number text-[#A14D45]">{criticalAlerts.length}</div>
          </div>

          <div className="mt-5 space-y-4">
            {criticalAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="grid grid-cols-[5rem_1fr_auto] gap-4 border-b border-[#D9DDE5]/70 pb-4 last:border-b-0 last:pb-0">
                <div className="font-mono text-xs font-semibold text-[#A14D45]">{alert.timestamp}</div>
                <div>
                  <div className="text-sm font-semibold text-[#101827]">{alert.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-[#667085]">{alert.description}</p>
                </div>
                <button
                  onClick={() => setActiveNav('alerts')}
                  className="self-start text-[10px] uppercase tracking-[0.14em] font-semibold text-[#243B80] hover:text-[#101827] transition-colors"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 section-panel p-5 lg:p-8">
          <div className="eyebrow mb-2">Activity Timeline</div>
          <h3 className="text-2xl font-semibold text-[#101827] font-heading">Operational Events</h3>
          <div className="timeline-line mt-6 space-y-5">
            {timelineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[4.6rem_1fr] gap-4">
                <div className="font-mono text-xs font-semibold text-[#243B80]">{item.timestamp}</div>
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-[#8B95A5] font-semibold">{item.category}</div>
                  <p className="mt-1 text-sm leading-relaxed text-[#101827]">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Row 4: Emergency Capacity Section */}
      <div className="quiet-panel rounded-2xl p-5 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-subtle mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#A14D45]/10 border border-[#A14D45]/25 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#A14D45]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#1C1C1E]">
                Emergency Capacity & Protected Reserves
              </h3>
              <p className="text-xs text-[#667085]">
                Reserved capacity is strictly protected from normal optimization to guarantee sudden emergency and mass-casualty resilience.
              </p>
            </div>
          </div>
          <StatusBadge status="PROTECTED" label="Protected Capacity Active" size="md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {protectedCapacity.map((prot) => (
            <div
              key={prot.id}
              className="p-4 rounded-xl bg-[#FFFFFF] border border-subtle space-y-2 hover:border-[#243B80]/40 hover:-translate-y-0.5 transition-subtle shadow-surface"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1C1C1E]">{prot.resource}</span>
                <span className="text-[10px] font-mono text-[#4F7A5F] bg-[#4F7A5F]/10 px-1.5 py-0.5 rounded border border-[#4F7A5F]/20 font-medium">
                  {prot.complianceRate}
                </span>
              </div>

              <div className="text-2xl font-medium font-mono text-[#243B80]">
                {prot.reservedCount}{' '}
                <span className="text-xs font-normal text-[#8B95A5]">{prot.unit}</span>
              </div>

              <p className="text-[11px] text-[#667085] leading-relaxed">
                {prot.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
