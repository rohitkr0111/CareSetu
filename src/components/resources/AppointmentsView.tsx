import React, { useState } from 'react';
import { Calendar, Clock, Filter, AlertCircle, CheckCircle2, User, Search } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';
import { AppointmentItem } from '../../types';

export const AppointmentsView: React.FC = () => {
  const { appointments, updateAppointmentStatus, globalSearch } = useHospital();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const departments = ['ALL', 'Cardiology', 'Neurology', 'Orthopedics', 'Pulmonology', 'Nephrology', 'Emergency & Triage', 'Gastroenterology', 'Endocrinology'];

  const filteredAppointments = appointments.filter((apt) => {
    const matchesDept = selectedDept === 'ALL' || apt.department === selectedDept;
    const matchesSearch =
      !globalSearch ||
      apt.patientName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(globalSearch.toLowerCase()) ||
      apt.department.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const waitingCount = appointments.filter((a) => a.status === 'WAITING').length;
  const delayedCount = appointments.filter((a) => a.status === 'DELAYED').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header & Top 4 Metrics */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
            <div className="eyebrow mb-4">Outpatient Flow</div>
            <h2 className="display-heading-compact">Outpatient & Clinical<br />Appointment Triage</h2>
        </div>

        <div className="lg:col-span-5 lg:pb-2">
            <p className="text-xs text-[#667085]">
              Live outpatient schedule tracking, triage priority routing, and doctor queue synchronization.
            </p>
          <div className="mt-5 text-xs text-[#667085] font-mono bg-white/60 px-3 py-1.5 border-y border-subtle font-medium inline-block">
            Thursday, 20 August 2026
          </div>
        </div>

        {/* 4 Metrics */}
        <div className="lg:col-span-12 metric-strip grid grid-cols-2 sm:grid-cols-4">
          <div className="p-4">
            <span className="text-[11px] text-[#667085] font-medium">Active Appointments</span>
            <div className="text-2xl font-bold font-mono text-[#1C1C1E] mt-0.5">{appointments.length}</div>
          </div>
          <div className="p-4">
            <span className="text-[11px] text-[#667085] font-medium">Waiting in Queue</span>
            <div className="text-2xl font-bold font-mono text-[#243B80] mt-0.5">{waitingCount}</div>
          </div>
          <div className="p-4">
            <span className="text-[11px] text-[#667085] font-medium">Delayed Schedule</span>
            <div className="text-2xl font-bold font-mono text-[#A14D45] mt-0.5">{delayedCount}</div>
          </div>
          <div className="p-4">
            <span className="text-[11px] text-[#667085] font-medium">Confirmed / In-Triage</span>
            <div className="text-2xl font-bold font-mono text-[#4F7A5F] mt-0.5">{confirmedCount}</div>
          </div>
        </div>
      </section>

      {/* Department Filter Tabs */}
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

      {/* Clean Appointments Table */}
      <div className="open-table-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-subtle bg-[#FBFBF8]/60 text-[#8B95A5] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle font-mono">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-[#FBFBF8]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1C1C1E]">
                    {apt.time}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-medium text-[#1C1C1E]">{apt.patientName}</div>
                    <div className="text-[10px] text-[#8B95A5]">{apt.patientAge} yrs · {apt.notes}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#667085] font-sans">
                    {apt.department}
                  </td>
                  <td className="py-3.5 px-4 text-[#1C1C1E] font-medium font-sans">
                    {apt.doctor}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        apt.triagePriority === 'P1'
                          ? 'bg-[#A14D45]/10 text-[#A14D45] border border-[#A14D45]/25'
                          : apt.triagePriority === 'P2'
                          ? 'bg-[#A16207]/10 text-[#A16207] border border-[#A16207]/25'
                          : 'bg-[#FBFBF8] text-[#667085]'
                      }`}
                    >
                      {apt.triagePriority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <StatusBadge status={apt.status} size="sm" />
                    {apt.delayMinutes && (
                      <span className="block text-[10px] text-[#A14D45] font-mono mt-0.5">
                        +{apt.delayMinutes}m delay
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans">
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        updateAppointmentStatus(apt.id, e.target.value as AppointmentItem['status'])
                      }
                      className="bg-[#FBFBF8] border border-subtle text-xs text-[#1C1C1E] rounded px-2 py-1 focus:outline-none font-medium"
                    >
                      <option value="WAITING">Waiting</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="DELAYED">Delayed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
