import React, { useState } from 'react';
import { Stethoscope, Users, Clock, Phone, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';
import { DoctorItem } from '../../types';

export const StaffRosterView: React.FC = () => {
  const { doctors, updateDoctorStatus, globalSearch } = useHospital();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const departments = ['ALL', 'ICU', 'Emergency', 'Cardiology', 'Orthopedics', 'Neurology', 'OPD', 'Operation Theatres'];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept;
    const matchesSearch =
      !globalSearch ||
      doc.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const activeCount = doctors.filter((d) => d.status === 'Available' || d.status === 'In Surgery' || d.status === 'On Round').length;
  const standbyCount = doctors.filter((d) => d.status === 'On Call').length;

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header Summary */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">Clinical Workforce</div>
          <h2 className="display-heading-compact">Doctors & Clinical<br />Staff Roster</h2>
        </div>

        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-xs text-[#667085]">
            Shift allocations, clinical fatigue monitoring, and active patient-to-physician ratios.
          </p>

        <div className="mt-6 metric-strip text-xs font-mono">
          <div className="px-3 py-2">
            <span className="text-[#667085]">Total Roster: </span>
            <span className="text-[#1C1C1E] font-bold">{doctors.length}</span>
          </div>
          <div className="px-3 py-2">
            <span className="text-[#667085]">Active On-Duty: </span>
            <span className="text-[#4F7A5F] font-bold">
              {activeCount} ({Math.round((activeCount / Math.max(doctors.length, 1)) * 100)}%)
            </span>
          </div>
          <div className="px-3 py-2">
            <span className="text-[#667085]">Trauma Standby: </span>
            <span className="text-[#243B80] font-bold">{standbyCount}</span>
          </div>
        </div>
        </div>
      </section>

      {/* Department Tabs */}
      <div className="filter-rail">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-subtle ${
              selectedDept === dept
                ? 'bg-[#243B80] text-white font-semibold shadow-surface'
                : 'bg-white text-[#667085] hover:text-[#1C1C1E] border border-subtle'
            }`}
          >
            {dept === 'ALL' ? 'All Departments' : dept}
          </button>
        ))}
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDoctors.map((doc) => {
          let fatigueColor = 'text-[#4F7A5F]';
          if (doc.fatigueIndex === 'Moderate') fatigueColor = 'text-[#A16207]';
          if (doc.fatigueIndex === 'Elevated') fatigueColor = 'text-[#A14D45]';

          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl p-4 border border-subtle shadow-surface space-y-3 flex flex-col justify-between hover:border-[#243B80]/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-subtle">
                  <div>
                    <h4 className="text-xs font-semibold text-[#1C1C1E] truncate">{doc.name}</h4>
                    <p className="text-[10px] text-[#243B80] font-medium">{doc.specialty}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FBFBF8] text-[#667085] font-mono font-medium">
                    {doc.department}
                  </span>
                </div>

                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span>Status:</span>
                    <span className="text-[#1C1C1E] font-medium">{doc.status}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#667085]">
                    <span>Active Patients:</span>
                    <span className="font-mono text-[#1C1C1E] font-semibold">{doc.activePatients} pts</span>
                  </div>

                  <div className="flex items-center justify-between text-[#667085]">
                    <span>Shift Remaining:</span>
                    <span className="font-mono text-[#667085]">{doc.shiftHoursRemaining} hrs</span>
                  </div>

                  <div className="flex items-center justify-between text-[#667085]">
                    <span>Fatigue Index:</span>
                    <span className={`font-mono text-xs font-semibold ${fatigueColor}`}>
                      {doc.fatigueIndex}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-subtle flex items-center justify-between text-[11px]">
                <span className="text-[#667085] font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#243B80]" />
                  {doc.phoneExtension}
                </span>
                <select
                  value={doc.status}
                  onChange={(e) => updateDoctorStatus(doc.id, e.target.value as DoctorItem['status'])}
                  className="bg-[#FBFBF8] border border-subtle text-xs text-[#1C1C1E] rounded px-1.5 py-0.5 focus:outline-none font-medium"
                >
                  <option value="Available">Available</option>
                  <option value="In Surgery">In Surgery</option>
                  <option value="On Round">On Round</option>
                  <option value="On Call">On Call</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
