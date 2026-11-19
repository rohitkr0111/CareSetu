import React, { useState } from 'react';
import {
  TrendingUp,
  CloudRain,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
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
  BarChart,
  Bar,
} from 'recharts';
import { FORECAST_24H, FORECAST_7D, FORECAST_30D } from '../../data/mockData';
import { useHospital } from '../../context/HospitalContext';

export const DemandForecastView: React.FC = () => {
  const { departments, setActiveNav } = useHospital();
  const [horizon, setHorizon] = useState<'24H' | '7D' | '30D'>('24H');

  const forecastData =
    horizon === '7D' ? FORECAST_7D : horizon === '30D' ? FORECAST_30D : FORECAST_24H;

  return (
    <div className="editorial-page space-y-10 pb-12">
      {/* Header & Forecast Horizon Filter */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-5">
            <span className="eyebrow flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              TEMPORAL FORECAST MODEL
            </span>
          </div>
          <h2 className="display-heading">
            Patient Ingress<br />& Surge Forecasting
          </h2>
        </div>

        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-sm md:text-base text-[#667085] leading-7">
            Multi-Horizon Probabilistic Recurrent Network
          </p>
          <p className="text-xs text-[#667085]">
            Continuous 24-hour neural forecast with weather, monsoon epidemiological, and urban traffic inputs.
          </p>

          {/* Horizon Toggle */}
          <div className="mt-7 segmented-control">
            {(['24H', '7D', '30D'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-subtle ${
                  horizon === h
                    ? 'bg-[#243B80] text-white font-semibold shadow-sm'
                    : 'text-[#667085] hover:text-[#1C1C1E]'
                }`}
              >
                {h === '24H' ? '24 Hours' : h === '7D' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Big Chart */}
      <section className="space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-subtle">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-[#1C1C1E] font-heading">
              {horizon === '24H' ? 'Hourly Demand Ingress (24H Horizon)' : horizon === '7D' ? 'Weekly Daily Demand Trend (7D)' : 'Monthly Ingress Cycle (30D)'}
            </h3>
            <p className="text-xs text-[#667085]">
              Predicted patient volume vs actual recorded admission arrivals with 95% confidence intervals
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#243B80] flex items-center gap-1 font-semibold">
              <span className="w-3 h-0.5 bg-[#243B80]" /> Predicted
            </span>
            <span className="text-[#8B95A5] flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#8B95A5]" /> Actual
            </span>
          </div>
        </div>

        <div className="data-canvas h-[24rem] w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42, 36, 33, 0.08)" vertical={false} />
              <XAxis dataKey="time" stroke="#8B95A5" fontSize={11} tickLine={false} />
              <YAxis stroke="#8B95A5" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const surge = (payload[0]?.payload as any)?.surgeReason;
                    return (
                      <div className="bg-white border border-subtle rounded-lg p-3 shadow-modal text-xs font-mono max-w-xs">
                        <div className="text-[#1C1C1E] font-bold mb-1">{label}</div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex justify-between gap-4 text-[11px]">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-semibold text-[#1C1C1E]">
                              {entry.value !== null && entry.value !== undefined ? `${entry.value} pts` : 'Pending'}
                            </span>
                          </div>
                        ))}
                        {surge && (
                          <div className="mt-2 pt-1.5 border-t border-subtle text-[10px] text-[#A14D45] font-sans font-medium">
                            ⚠️ {surge}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="predicted" fill="#FBFBF8" stroke="none" />
              <Line type="monotone" dataKey="predicted" name="Predicted Demand" stroke="#243B80" strokeWidth={2.2} dot={{ fill: '#243B80', r: 3 }} />
              <Line type="monotone" dataKey="actual" name="Actual Demand" stroke="#8B95A5" strokeWidth={2} dot={{ fill: '#8B95A5', r: 3 }} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Surge Factors & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Environmental & Surge Contributing Factors */}
        <div className="lg:col-span-6 quiet-panel rounded-2xl p-5 lg:p-6 space-y-3">
          <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading">
            Surge Contributing Factors (External Telemetry)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-[#FBFBF8] border border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CloudRain className="w-4 h-4 text-[#243B80]" />
                <div>
                  <div className="text-[#1C1C1E] font-medium">Monsoon Respiratory Wave</div>
                  <div className="text-[11px] text-[#667085]">High relative humidity (84%) triggering bronchospasm cases</div>
                </div>
              </div>
              <span className="font-mono text-[#A14D45] font-semibold">+14% Impact</span>
            </div>

            <div className="p-3 rounded-lg bg-[#FBFBF8] border border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#A16207]" />
                <div>
                  <div className="text-[#1C1C1E] font-medium">Evening Commute Arterial Congestion</div>
                  <div className="text-[11px] text-[#667085]">Peak poly-trauma risk window 18:00 - 21:30</div>
                </div>
              </div>
              <span className="font-mono text-[#A16207] font-semibold">+18% Trauma</span>
            </div>
          </div>
        </div>

        {/* Action link to Optimization */}
        <div className="lg:col-span-6 section-panel p-5 lg:p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#243B80] uppercase tracking-wider block font-bold">
              PRESCRIPTIVE ACTION LINK
            </span>
            <h4 className="text-base font-semibold text-[#1C1C1E] font-heading">
              Ready to counter predicted surges with optimal bed/staff reallocation?
            </h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              CareSetu's optimization solver has already generated clinical allocation proposals to protect the hospital's emergency reserve buffer.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-subtle">
            <button
              onClick={() => setActiveNav('optimization')}
              className="w-full py-2 bg-[#243B80] hover:bg-[#101827] text-white text-xs font-bold rounded-lg transition-subtle flex items-center justify-center gap-2 shadow-surface hover:-translate-y-0.5"
            >
              <span>Open Optimization Engine</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
