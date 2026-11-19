import React, { useState } from 'react';
import { Settings, Shield, Server, Database, Key, CheckCircle2, Code2, Copy, RefreshCw, Terminal, Play } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const SettingsView: React.FC = () => {
  const { currentUser, isLiveUpdating, setIsLiveUpdating, setActiveNav, addToast } = useHospital();
  const [activeApiTab, setActiveApiTab] = useState<'dashboard' | 'forecast' | 'beds' | 'alerts' | 'tables'>('dashboard');
  const [liveResponse, setLiveResponse] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  const API_ENDPOINTS = [
    { id: 'dashboard', path: 'GET /api/dashboard', desc: 'Returns 6 KPI metric cards, resource pressure gauges, and active alert totals from SQLite.' },
    { id: 'forecast', path: 'GET /api/demand/forecast?horizon=24H', desc: 'Returns DeepAR hourly predicted vs actual patient volume with 95% confidence intervals.' },
    { id: 'beds', path: 'GET /api/resources/beds', desc: 'Returns live hospital bed census across ICU, HDU, General, and Isolation wings.' },
    { id: 'alerts', path: 'GET /api/alerts', desc: 'Retrieves early-warning pressure thresholds across ICU, CT suites, and staff rosters.' },
    { id: 'tables', path: 'GET /api/admin/db/tables', desc: 'Lists relational SQLite tables, active column schemas, and live record counts.' },
  ];

  const API_PAYLOADS: Record<string, string> = {
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
    beds: `[
  {
    "id": "bed-icu-01",
    "bedNumber": "ICU-01",
    "ward": "ICU",
    "floor": "3",
    "status": "Occupied",
    "patientName": "Sunil Verma",
    "oxygenEquipped": true,
    "ventilatorActive": true
  }
]`,
    alerts: `[
  {
    "id": "alt-01",
    "level": "CRITICAL",
    "title": "ICU Bed Capacity Exceeded (92%)",
    "sourceDepartment": "Critical Care Unit",
    "acknowledged": false
  }
]`,
    tables: `{
  "databasePath": "server/data/caresetu.db",
  "engine": "node:sqlite (WAL mode)",
  "tables": ["beds", "doctors", "appointments", "alerts", "recommendations"]
}`,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    addToast('Payload Copied', 'Endpoint schema copied to clipboard', 'info');
  };

  const testLiveEndpoint = async () => {
    const ep = API_ENDPOINTS.find((e) => e.id === activeApiTab);
    if (!ep) return;
    const url = ep.path.replace(/^GET\s+/, '');
    setIsLoadingLive(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setLiveResponse(JSON.stringify(data, null, 2));
      addToast('Live Database Queried', `${url} returned HTTP ${res.status}`, 'success');
    } catch (err: any) {
      setLiveResponse(`Error contacting live API: ${err.message}`);
    } finally {
      setIsLoadingLive(false);
    }
  };

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header Banner */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">Enterprise Infrastructure</div>
          <h2 className="display-heading-compact">System Configuration &<br />Database Architecture</h2>
        </div>
        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-xs text-[#667085]">
            Hospital telemetry parameters, Node.js + SQLite REST APIs, and clinical compliance protocols.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 cols: Configuration & Compliance */}
        <div className="lg:col-span-6 space-y-4">
          <div className="section-panel p-5 space-y-4 bg-white rounded-xl border border-subtle shadow-2xs">
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
                  <div className="text-[#1C1C1E] font-medium">Database Engine</div>
                  <div className="text-[11px] text-[#8B95A5] font-mono">SQLite 3 (node:sqlite WAL mode)</div>
                </div>
                <span className="text-[10px] text-[#243B80] font-mono bg-[#243B80]/10 border border-[#243B80]/20 px-2 py-0.5 rounded font-medium">server/data/caresetu.db</span>
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
                  <div className="text-[#1C1C1E] font-medium">Admin Terminal Command Engine</div>
                  <div className="text-[11px] text-[#667085]">CLI command orchestration & SQL inspector</div>
                </div>
                <button
                  onClick={() => setActiveNav('admin')}
                  className="px-2.5 py-1 rounded bg-[#101827] text-white text-[11px] font-mono flex items-center gap-1 hover:bg-[#1E293B]"
                >
                  <Terminal className="w-3 h-3 text-[#38BDF8]" />
                  Launch Terminal
                </button>
              </div>
            </div>
          </div>

          <div className="quiet-panel p-5 space-y-3 bg-white rounded-xl border border-subtle shadow-2xs">
            <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4F7A5F]" />
              Data Privacy & Audit Logging
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              CareSetu complies with DISHA (Digital Information Security in Healthcare Act) and HIPAA standards. All AI prescriptive recommendations require authenticated clinician digital signatures before physical reallocations are deployed. All mutations write directly to the persistent SQLite ledger with verified audit trail entries.
            </p>
          </div>
        </div>

        {/* Right 6 cols: REST API Architecture Inspector */}
        <div className="lg:col-span-6 open-table-surface p-5 space-y-4 bg-white rounded-xl border border-subtle shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-subtle">
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#243B80]" />
                Live REST API & Database Endpoint Tester
              </h3>
              <p className="text-xs text-[#667085]">
                Verify actual live response from the server and persistent SQLite database
              </p>
            </div>
          </div>

          {/* Endpoints selector */}
          <div className="grid grid-cols-2 gap-1.5">
            {API_ENDPOINTS.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  setActiveApiTab(ep.id as any);
                  setLiveResponse(null);
                }}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#8B95A5]">
                {API_ENDPOINTS.find((e) => e.id === activeApiTab)?.path}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={testLiveEndpoint}
                  disabled={isLoadingLive}
                  className="text-[11px] px-2.5 py-0.5 rounded bg-[#243B80] text-white hover:bg-[#1D2E68] flex items-center gap-1 font-mono font-medium disabled:opacity-50"
                >
                  {isLoadingLive ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 text-[#38BDF8]" />}
                  Test Live
                </button>
                <button
                  onClick={() => handleCopy(liveResponse || API_PAYLOADS[activeApiTab])}
                  className="text-[11px] text-[#243B80] hover:text-[#101827] hover:underline flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>
            <pre className="p-3 rounded-lg bg-[#0A0E17] border border-[#1E293B] text-[11px] font-mono text-[#38BDF8] overflow-x-auto max-h-56 leading-relaxed">
              {liveResponse || API_PAYLOADS[activeApiTab]}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
