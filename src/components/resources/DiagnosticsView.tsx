import React from 'react';
import { Activity, Clock, Shield, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';

export const DiagnosticsView: React.FC = () => {
  const { diagnostics, setActiveNav } = useHospital();

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header Summary */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">Throughput Control</div>
          <h2 className="display-heading-compact">Diagnostics, Imaging<br />Suites & Cath Labs</h2>
        </div>

        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-xs text-[#667085]">
            CT scanner throughput, emergency stroke buffer queues, and scheduled maintenance buffers.
          </p>

        <div className="mt-6 metric-strip text-xs font-mono">
          <div className="px-3 py-2">
            <span className="text-[#667085]">Overall Utilization: </span>
            <span className="text-[#A16207] font-bold">78%</span>
          </div>
          <div className="px-3 py-2">
            <span className="text-[#667085]">Emergency Slots: </span>
            <span className="text-[#243B80] font-bold">12 Slots / hr</span>
          </div>
        </div>
        </div>
      </section>

      {/* Diagnostic Suites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diagnostics.map((unit) => {
          let utilColor = 'bg-[#243B80]';
          if (unit.utilization > 90) utilColor = 'bg-[#A14D45]';
          else if (unit.utilization > 80) utilColor = 'bg-[#A16207]';

          return (
            <div
              key={unit.id}
              className="bg-white rounded-xl p-5 border border-subtle shadow-surface space-y-4 flex flex-col justify-between hover:border-[#243B80]/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-subtle">
                  <div>
                    <h4 className="text-xs font-semibold text-[#1C1C1E]">{unit.name}</h4>
                    <span className="text-[10px] text-[#243B80] font-mono font-medium">{unit.type} Suite</span>
                  </div>
                  <StatusBadge status={unit.status} size="sm" />
                </div>

                <div className="mt-3 space-y-3">
                  {/* Utilization Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#667085] font-sans font-medium">Utilization:</span>
                      <span className="font-semibold text-[#1C1C1E]">{unit.utilization}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#FBFBF8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${utilColor}`}
                        style={{ width: `${unit.utilization}%` }}
                      />
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded bg-[#FBFBF8] border border-subtle space-y-0.5">
                      <span className="text-[10px] text-[#667085]">Active Queue</span>
                      <div className="font-mono font-semibold text-[#1C1C1E]">
                        {unit.queueCount} patients
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#FBFBF8] border border-subtle space-y-0.5">
                      <span className="text-[10px] text-[#667085]">Est. Wait</span>
                      <div className="font-mono font-semibold text-[#1C1C1E]">
                        {unit.estimatedWaitMinutes} mins
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#FBFBF8] border border-subtle space-y-0.5">
                      <span className="text-[10px] text-[#667085]">Scheduled Today</span>
                      <div className="font-mono font-semibold text-[#1C1C1E]">
                        {unit.scheduledToday} scans
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#FBFBF8] border border-subtle space-y-0.5">
                      <span className="text-[10px] text-[#4F7A5F] font-medium">Emergency Reserved</span>
                      <div className="font-mono font-semibold text-[#4F7A5F]">
                        {unit.emergencyReservedSlots} slots / hr
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-subtle flex items-center justify-between text-[11px] text-[#667085]">
                <span className="flex items-center gap-1 font-medium text-[#4F7A5F]">
                  <CheckCircle2 className="w-3 h-3 text-[#4F7A5F]" />
                  {unit.maintenanceStatus}
                </span>
                <button
                  onClick={() => setActiveNav('optimization')}
                  className="text-[#243B80] hover:text-[#101827] hover:underline font-semibold uppercase tracking-wider text-[10px]"
                >
                  Rebalance Queue
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
