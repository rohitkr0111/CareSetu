import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, PlaySquare, Brain } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';

export const AlertsCenterView: React.FC = () => {
  const { alerts, acknowledgeAlert, setActiveNav } = useHospital();

  const criticalAlerts = alerts.filter((a) => a.level === 'CRITICAL');
  const warningAlerts = alerts.filter((a) => a.level === 'WARNING');
  const normalAlerts = alerts.filter((a) => a.level === 'NORMAL');

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header Summary */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">Operational Pressure</div>
          <h2 className="display-heading-compact">Alerts & Resource<br />Pressure Early-Warning Center</h2>
        </div>

        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-xs text-[#667085]">
            Proactive threshold monitoring designed to alert clinical leads before bottlenecks cause emergency diversions.
          </p>

        <div className="mt-6 metric-strip text-xs font-mono">
          <span className="px-3 py-2 bg-[#A14D45]/10 text-[#A14D45] font-semibold">
            {criticalAlerts.length} Critical
          </span>
          <span className="px-3 py-2 bg-[#A16207]/10 text-[#A16207] font-semibold">
            {warningAlerts.length} Warning
          </span>
        </div>
        </div>
      </section>

      {/* Critical Alerts Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#A14D45] uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Critical Alerts ({criticalAlerts.length})
        </h3>

        <div className="space-y-3">
          {criticalAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl p-5 border border-[#A14D45]/30 shadow-surface space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <StatusBadge status="CRITICAL" size="sm" />
                  <span className="text-xs font-mono text-[#8B95A5] font-semibold">{alert.sourceDepartment}</span>
                  <span className="text-[11px] text-[#8B95A5]">· {alert.timestamp}</span>
                </div>
                <h4 className="text-sm font-semibold text-[#1C1C1E]">{alert.title}</h4>
                <p className="text-xs text-[#667085] leading-relaxed">{alert.description}</p>
                {alert.projectedTimeToExceed && (
                  <div className="text-[11px] font-mono text-[#A14D45] font-medium">
                    ⏱ Projected to exceed safe threshold in: <strong>{alert.projectedTimeToExceed}</strong>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setActiveNav('optimization')}
                  className="px-3 py-1.5 rounded-lg bg-[#243B80] hover:bg-[#101827] text-white font-semibold text-xs transition-subtle flex items-center gap-1.5 shadow-surface"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>View Recommendation</span>
                </button>
                <button
                  onClick={() => setActiveNav('simulation')}
                  className="px-3 py-1.5 rounded-lg bg-[#FBFBF8] hover:bg-[#D9DDE5] border border-subtle text-xs text-[#1C1C1E] transition-colors flex items-center gap-1.5 font-medium"
                >
                  <PlaySquare className="w-3.5 h-3.5 text-[#243B80]" />
                  <span>Simulate</span>
                </button>
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="p-1.5 text-[#8B95A5] hover:text-[#4F7A5F] transition-colors"
                    title="Acknowledge alert"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning & Normal Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* Warning Alerts */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#A16207] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Warning Threshold Alerts
          </h3>
          <div className="space-y-3">
            {warningAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-xl p-4 border border-[#A16207]/30 shadow-surface space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <StatusBadge status="WARNING" size="sm" />
                  <span className="text-[10px] text-[#8B95A5] font-mono">{alert.timestamp}</span>
                </div>
                <h4 className="text-xs font-semibold text-[#1C1C1E]">{alert.title}</h4>
                <p className="text-[11px] text-[#667085] leading-relaxed">{alert.description}</p>
                <div className="pt-2 border-t border-subtle flex items-center justify-between">
                  <button
                    onClick={() => setActiveNav('simulation')}
                    className="text-xs text-[#243B80] hover:text-[#101827] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Test Mitigation Scenario</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-[11px] text-[#8B95A5] hover:text-[#4F7A5F] font-medium"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Nominal Telemetries */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#4F7A5F] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Nominal Systems & Verified Telemetries
          </h3>
          <div className="space-y-3">
            {normalAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-xl p-4 border border-subtle shadow-surface space-y-2"
              >
                <div className="flex items-center justify-between">
                  <StatusBadge status="NORMAL" size="sm" />
                  <span className="text-[10px] text-[#8B95A5] font-mono">{alert.timestamp}</span>
                </div>
                <h4 className="text-xs font-semibold text-[#1C1C1E]">{alert.title}</h4>
                <p className="text-[11px] text-[#667085] leading-relaxed">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
