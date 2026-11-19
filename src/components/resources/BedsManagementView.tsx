import React, { useState } from 'react';
import { Bed, Shield, AlertTriangle, Check, RefreshCw, Filter, Wind } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';
import { BedItem } from '../../types';

export const BedsManagementView: React.FC = () => {
  const { beds, updateBedStatus, globalSearch } = useHospital();
  const [selectedWard, setSelectedWard] = useState<string>('ALL');

  const wards = ['ALL', 'ICU', 'HDU', 'General Medical', 'Emergency Triage', 'Isolation / Negative Pressure'];

  const filteredBeds = beds.filter((b) => {
    const matchesWard = selectedWard === 'ALL' || b.ward === selectedWard;
    const matchesSearch =
      !globalSearch ||
      b.bedNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (b.patientName && b.patientName.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchesWard && matchesSearch;
  });

  const occupiedCount = beds.filter((b) => b.status === 'Occupied').length;
  const availableCount = beds.filter((b) => b.status === 'Available').length;
  const reservedCount = beds.filter((b) => b.status === 'Reserved').length;

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header & Metric Highlights */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">Resource Control</div>
          <h2 className="display-heading-compact">Bed Census &<br />Triage Ward Management</h2>
        </div>
        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-xs text-[#667085]">
            Real-time census tracking with oxygen, ventilator, and emergency reservation controls.
          </p>

        {/* Dynamic Status Summaries */}
        <div className="mt-6 metric-strip text-xs font-mono">
          <div className="px-3 py-2">
            <span className="text-[#667085]">Occupied: </span>
            <span className="text-[#1C1C1E] font-bold">
              {occupiedCount} ({Math.round((occupiedCount / Math.max(beds.length, 1)) * 100)}%)
            </span>
          </div>
          <div className="px-3 py-2">
            <span className="text-[#667085]">Available: </span>
            <span className="text-[#4F7A5F] font-bold">{availableCount}</span>
          </div>
          <div className="px-3 py-2">
            <span className="text-[#667085]">Reserved: </span>
            <span className="text-[#243B80] font-bold">{reservedCount}</span>
          </div>
        </div>
        </div>
      </section>

      {/* Ward Filter Tabs */}
      <div className="filter-rail">
        {wards.map((ward) => (
          <button
            key={ward}
            onClick={() => setSelectedWard(ward)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-subtle ${
              selectedWard === ward
                ? 'bg-[#243B80] text-white font-semibold shadow-surface'
                : 'bg-white text-[#667085] hover:text-[#1C1C1E] border border-subtle'
            }`}
          >
            {ward === 'ALL' ? 'All Wards' : ward}
          </button>
        ))}
      </div>

      {/* Bed Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredBeds.map((bed) => {
          let statusStyle = 'border-[#4F7A5F]/30';
          let statusDot = 'bg-[#4F7A5F]';

          if (bed.status === 'Occupied') {
            statusStyle = 'border-subtle';
            statusDot = 'bg-[#8B95A5]';
          } else if (bed.status === 'Reserved') {
            statusStyle = 'border-[#243B80]/40';
            statusDot = 'bg-[#243B80]';
          } else if (bed.status === 'Sanitizing' || bed.status === 'Maintenance') {
            statusStyle = 'border-[#A16207]/30';
            statusDot = 'bg-[#A16207]';
          }

          return (
            <div
              key={bed.id}
              className={`bg-white rounded-xl p-4 border ${statusStyle} shadow-surface space-y-3 flex flex-col justify-between hover:-translate-y-0.5 transition-subtle`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#1C1C1E]">
                      {bed.bedNumber}
                    </span>
                    <span className="text-[10px] text-[#667085] px-1.5 py-0.2 bg-[#FBFBF8] rounded font-medium">
                      {bed.ward}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                    <span className="text-[11px] font-medium text-[#1C1C1E]">{bed.status}</span>
                  </div>
                </div>

                <div className="mt-2.5 space-y-1 text-xs">
                  {bed.patientName ? (
                    <div>
                      <div className="text-[10px] text-[#8B95A5]">Patient ID: {bed.patientId}</div>
                      <div className="font-medium text-[#1C1C1E] truncate">{bed.patientName}</div>
                      <div className="text-[10px] text-[#667085] mt-0.5 font-mono">
                        Discharge: {bed.projectedDischarge || 'TBD'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#8B95A5] italic py-2">
                      {bed.status === 'Reserved'
                        ? 'Protected for Emergency Admission'
                        : 'Bed ready for immediate intake'}
                    </div>
                  )}

                  {/* Capabilities Tags */}
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    {bed.oxygenEquipped && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FBFBF8] text-[#243B80] border border-[#243B80]/25 flex items-center gap-1 font-medium">
                        <Wind className="w-2.5 h-2.5" /> O₂ Line
                      </span>
                    )}
                    {bed.ventilatorActive && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#A14D45]/10 text-[#A14D45] border border-[#A14D45]/25 font-semibold">
                        Ventilator Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Action Switcher */}
              <div className="pt-2 border-t border-subtle flex items-center justify-between text-[11px]">
                <span className="text-[#667085]">Change Status:</span>
                <select
                  value={bed.status}
                  onChange={(e) => updateBedStatus(bed.id, e.target.value as BedItem['status'])}
                  className="bg-[#FBFBF8] border border-subtle text-xs text-[#1C1C1E] rounded px-1.5 py-0.5 focus:outline-none font-medium"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sanitizing">Sanitizing</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
