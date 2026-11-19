import React, { useState } from 'react';
import { Settings, Shield, Server, Database, Key, CheckCircle2, Code2, Copy, RefreshCw } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const SettingsView: React.FC = () => {
  const { currentUser, isLiveUpdating, setIsLiveUpdating, addToast } = useHospital();
  const [activeApiTab, setActiveApiTab] = useState<'dashboard' | 'forecast' | 'optimization' | 'alerts'>('dashboard');

  const API_ENDPOINTS = [
    { id: 'dashboard', path: 'GET /api/dashboard', desc: 'Returns 6 KPI metric cards, resource pressure gauges, and active alert totals.' },
    { id: 'forecast', path: 'GET /api/demand/forecast?horizon=24H', desc: 'Returns DeepAR hourly predicted vs actual patient volume with 95% confidence intervals.' },
    { id: 'optimization', path: 'POST /api/optimization/recommendations/:id/action', desc: 'Dispatches clinical sign-off (APPROVE / MODIFY / REJECT) to rebalance hospital wards.' },
    { id: 'alerts', path: 'GET /api/alerts', desc: 'Retrieves early-warning pressure thresholds across ICU, CT suites, and staff rosters.' },
  ];

  const API_PAYLOADS = {
    dashboard: `{
  "status": "Operational",
  "totalBeds": 400,
  "occupiedBeds": 342,
  "icuOccupancyPercent": 92.5,
  "doctorsScheduled": 86,
  "staffUtilization": 72,
  "activeAlertsCount": 3
}`,
    forecast: `{
  "horizon": "24H",
  "modelType": "DeepAR Probabilistic Recurrent Engine",
  "confidence": 0.98,
  "surgeWindow": "18:00 - 22:00",
  "peakPredictedCount": 148
}`,
    optimization: `{
  "recommendationId": "rec-icu-01",
  "action": "APPROVE",
  "clinician": "Dr. Rajesh Sen (CMO)",
  "reallocations": [
    { "resource": "ICU Beds", "delta": 4 },
    { "resource": "Emergency Doctors", "delta": 2 }
  ]
}`,
    alerts: `{
  "critical": [
    {
      "id": "alt-01",
      "department": "Critical Care Unit",
      "timeToExceed": "3h 45m",
      "recommendedActionId": "rec-icu-01"
    }
  ]
}`,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    addToast('Payload Copied', 'Endpoint schema copied to clipboard', 'info');
  };

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header Banner */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">Enterprise Integration</div>
          <h2 className="display-heading-compact">System Configuration &<br />Enterprise Integration</h2>
        </div>
        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-xs text-[#667085]">
            Hospital telemetry parameters, Flask REST API specifications, and clinical compliance protocols.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 cols: Configuration & Compliance */}
        <div className="lg:col-span-6 space-y-4">
          <div className="section-panel p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading flex items-center gap-2">
              <Server className="w-4 h-4 text-[#243B80]" />
              Hospital Gateway Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBFBF8] border border-subtle">
                <div>
                  <div className="text-[#1C1C1E] font-medium">Hospital Node Identifier</div>
                  <div className="text-[11px] text-[#8B95A5] font-mono">{currentUser.hospitalId}</div>
                </div>
                <span className="text-[10px] text-[#4F7A5F] font-mono bg-[#4F7A5F]/10 border border-[#4F7A5F]/20 px-2 py-0.5 rounded font-medium">Connected</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBFBF8] border border-subtle">
                <div>
                  <div className="text-[#1C1C1E] font-medium">Live Telemetry WebSockets</div>
                  <div className="text-[11px] text-[#667085]">Automatic 6-second state pulses</div>
                </div>
                <button
                  onClick={() => setIsLiveUpdating(!isLiveUpdating)}
                  className={`px-3 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                    isLiveUpdating
                      ? 'bg-[#4F7A5F]/15 text-[#4F7A5F] border border-[#4F7A5F]/30'
                      : 'bg-[#A16207]/15 text-[#A16207] border border-[#A16207]/30'
                  }`}
                >
                  {isLiveUpdating ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FBFBF8] border border-subtle">
                <div>
                  <div className="text-[#1C1C1E] font-medium">Protected Reserve Compliance Rate</div>
                  <div className="text-[11px] text-[#667085]">Strict isolation of 5 ICU Beds & 3 Physicians</div>
                </div>
                <span className="text-xs font-mono font-bold text-[#243B80]">100% Locked</span>
              </div>
            </div>
          </div>

          <div className="quiet-panel p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4F7A5F]" />
              Data Privacy & Audit Logging
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              CareSetu complies with DISHA (Digital Information Security in Healthcare Act) and HIPAA standards. All AI prescriptive recommendations require authenticated clinician digital signatures before physical reallocations are deployed.
            </p>
          </div>
        </div>

        {/* Right 6 cols: Flask REST API Architecture Inspector */}
        <div className="lg:col-span-6 open-table-surface p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-subtle">
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#243B80]" />
                REST API Integration Blueprint
              </h3>
              <p className="text-xs text-[#667085]">
                Standardized Flask / Fast-API endpoints ready for hospital EHR connection
              </p>
            </div>
          </div>

          {/* Endpoints selector */}
          <div className="grid grid-cols-2 gap-1.5">
            {API_ENDPOINTS.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setActiveApiTab(ep.id as any)}
                className={`p-2 rounded-lg text-left border text-xs font-mono transition-colors ${
                  activeApiTab === ep.id
                    ? 'bg-[#FBFBF8] border-[#243B80]/40 text-[#243B80] font-semibold shadow-sm'
                    : 'bg-white border-subtle text-[#667085] hover:text-[#1C1C1E]'
                }`}
              >
                <span className="truncate block">{ep.path.split(' ')[0]} {ep.id}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#8B95A5]">
                {API_ENDPOINTS.find((e) => e.id === activeApiTab)?.path}
              </span>
              <button
                onClick={() => handleCopy(API_PAYLOADS[activeApiTab])}
                className="text-[11px] text-[#243B80] hover:text-[#101827] hover:underline flex items-center gap-1 font-medium"
              >
                <Copy className="w-3 h-3" />
                Copy JSON
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#FBFBF8] border border-subtle text-[11px] font-mono text-[#1C1C1E] overflow-x-auto max-h-56 leading-relaxed">
              {API_PAYLOADS[activeApiTab]}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
