import React from 'react';
import {
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Activity,
  Sliders,
  TrendingUp,
  Clock,
  Users,
  Bed,
  FileSpreadsheet,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StatusBadge } from '../common/StatusBadge';

export const ScenarioSimulationView: React.FC = () => {
  const {
    simulationParams,
    setSimulationParams,
    simulationResult,
    runSimulation,
    isSimulating,
    addToast,
  } = useHospital();

  const handleSliderChange = (key: keyof typeof simulationParams, value: any) => {
    const updated = { ...simulationParams, [key]: value };
    setSimulationParams(updated);
    runSimulation(updated);
  };

  const handleReset = () => {
    const defaultParams = {
      patientDemandPercent: 100,
      emergencyAdmissions: 20,
      availableDoctors: 45,
      availableBeds: 340,
      massCasualtyActive: false,
      fluSurgeActive: false,
      staffAbsencePercent: 5,
    };
    setSimulationParams(defaultParams);
    runSimulation(defaultParams);
    addToast('Simulation Reset', 'Parameters restored to nominal baseline values.', 'info');
  };

  const res = simulationResult;

  return (
    <div className="editorial-page space-y-8 pb-12">
      {/* Header Banner */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-4">Operational Sandbox</div>
          <h2 className="display-heading-compact">Scenario Simulation &<br />"What-If" Sandbox</h2>
        </div>

        <div className="lg:col-span-5 lg:pb-2">
          <p className="text-xs text-[#667085]">
            Test operational shockwaves, mass casualty surges, and staffing shortages without risking real clinical wards.
          </p>

        <div className="mt-7 flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-[#FBFBF8] border border-subtle text-xs text-[#667085] hover:text-[#1C1C1E] hover:bg-[#D9DDE5] flex items-center gap-1.5 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={() => runSimulation()}
            disabled={isSimulating}
            className="px-4 py-1.5 rounded-lg bg-[#243B80] hover:bg-[#101827] text-white font-semibold text-xs transition-subtle flex items-center gap-1.5 shadow-surface hover:-translate-y-0.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
        </div>
      </section>

      {/* Main Grid: Controls on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 cols: Interactive Simulation Sliders & Stress Toggles */}
        <div className="lg:col-span-5 section-panel p-5 space-y-5">
          <div className="flex items-center justify-between pb-2.5 border-b border-subtle">
            <h3 className="text-sm font-semibold text-[#1C1C1E] font-heading flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#243B80]" />
              Simulation Stress Controls
            </h3>
            <span className="text-[10px] font-mono text-[#8B95A5]">Live Recalculation</span>
          </div>

          {/* Slider 1: Patient Demand % */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#667085] font-medium">Patient Demand Scale</span>
              <span className="font-mono font-semibold text-[#1C1C1E]">
                {simulationParams.patientDemandPercent}%
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="200"
              step="5"
              value={simulationParams.patientDemandPercent}
              onChange={(e) => handleSliderChange('patientDemandPercent', parseInt(e.target.value))}
              className="w-full accent-[#243B80] bg-[#FBFBF8] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8B95A5] font-mono">
              <span>80% (Low)</span>
              <span>100% (Normal)</span>
              <span>200% (Extreme)</span>
            </div>
          </div>

          {/* Slider 2: Emergency Admissions / hr */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#667085] font-medium">Emergency Influx / Hour</span>
              <span className="font-mono font-semibold text-[#1C1C1E]">
                {simulationParams.emergencyAdmissions} patients
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="2"
              value={simulationParams.emergencyAdmissions}
              onChange={(e) => handleSliderChange('emergencyAdmissions', parseInt(e.target.value))}
              className="w-full accent-[#243B80] bg-[#FBFBF8] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8B95A5] font-mono">
              <span>10 / hr</span>
              <span>25 / hr (Avg)</span>
              <span>60 / hr (Surge)</span>
            </div>
          </div>

          {/* Slider 3: Available Doctors */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#667085] font-medium">Active Doctors on Duty</span>
              <span className="font-mono font-semibold text-[#1C1C1E]">
                {simulationParams.availableDoctors} physicians
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="80"
              step="1"
              value={simulationParams.availableDoctors}
              onChange={(e) => handleSliderChange('availableDoctors', parseInt(e.target.value))}
              className="w-full accent-[#243B80] bg-[#FBFBF8] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8B95A5] font-mono">
              <span>15 (Shortage)</span>
              <span>45 (Nominal)</span>
              <span>80 (Full Reserve)</span>
            </div>
          </div>

          {/* Slider 4: Available Beds */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#667085] font-medium">Available Open Beds</span>
              <span className="font-mono font-semibold text-[#1C1C1E]">
                {simulationParams.availableBeds} beds
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="400"
              step="10"
              value={simulationParams.availableBeds}
              onChange={(e) => handleSliderChange('availableBeds', parseInt(e.target.value))}
              className="w-full accent-[#243B80] bg-[#FBFBF8] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8B95A5] font-mono">
              <span>100 (Constrained)</span>
              <span>300 (Standard)</span>
              <span>400 (Max Capacity)</span>
            </div>
          </div>

          {/* Disaster / Shock Scenario Toggles */}
          <div className="pt-2 border-t border-subtle space-y-2">
            <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block">
              Crisis Scenario Presets
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  simulationParams.massCasualtyActive
                    ? 'bg-[#A14D45]/10 border-[#A14D45]/30 text-[#A14D45] font-semibold'
                    : 'bg-[#FBFBF8] border-subtle text-[#667085] hover:text-[#1C1C1E]'
                }`}
              >
                <div>
                  <span className="font-medium block">Mass Casualty Event</span>
                  <span className="text-[10px] text-[#8B95A5]">Poly-trauma Code Red</span>
                </div>
                <input
                  type="checkbox"
                  checked={simulationParams.massCasualtyActive}
                  onChange={(e) => handleSliderChange('massCasualtyActive', e.target.checked)}
                  className="accent-[#A14D45]"
                />
              </label>

              <label
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  simulationParams.fluSurgeActive
                    ? 'bg-[#A16207]/10 border-[#A16207]/30 text-[#A16207] font-semibold'
                    : 'bg-[#FBFBF8] border-subtle text-[#667085] hover:text-[#1C1C1E]'
                }`}
              >
                <div>
                  <span className="font-medium block">Epidemic Outbreak</span>
                  <span className="text-[10px] text-[#8B95A5]">+40% Respiratory Ingress</span>
                </div>
                <input
                  type="checkbox"
                  checked={simulationParams.fluSurgeActive}
                  onChange={(e) => handleSliderChange('fluSurgeActive', e.target.checked)}
                  className="accent-[#A16207]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right 7 cols: Comparative Simulation Results */}
        <div className="lg:col-span-7 space-y-5">
          {/* Comparative Metrics Grid */}
          <div className="section-panel p-5">
            <div className="flex items-center justify-between pb-3 border-b border-subtle mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#1C1C1E] font-heading">
                  Scenario Result: Current vs. Simulated
                </h3>
                <p className="text-xs text-[#667085]">
                  Predicted operational response under selected crisis parameters
                </p>
              </div>
              {res && <StatusBadge status={res.emergencyCapacity.status} label={res.emergencyCapacity.status} />}
            </div>

            {res ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1: Waiting Time */}
                <div className="p-3 rounded-lg bg-[#FBFBF8] border border-subtle space-y-1">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#243B80]" />
                    Avg Wait Time
                  </span>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-xs text-[#8B95A5]">{res.waitingTime.current} min</span>
                    <span className="text-[#8B95A5]/40">→</span>
                    <span
                      className={`text-base font-bold ${
                        res.waitingTime.simulated > 60
                          ? 'text-[#A14D45]'
                          : res.waitingTime.simulated > 40
                          ? 'text-[#A16207]'
                          : 'text-[#4F7A5F]'
                      }`}
                    >
                      {res.waitingTime.simulated} min
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8B95A5]">
                    {res.waitingTime.simulated > res.waitingTime.current ? '↑ Triage strain' : '↓ Improved'}
                  </div>
                </div>

                {/* Metric 2: Bed Utilization */}
                <div className="p-3 rounded-lg bg-[#FBFBF8] border border-subtle space-y-1">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1 font-medium">
                    <Bed className="w-3.5 h-3.5 text-[#243B80]" />
                    Bed Occupancy
                  </span>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-xs text-[#8B95A5]">{res.bedUtilization.current}%</span>
                    <span className="text-[#8B95A5]/40">→</span>
                    <span
                      className={`text-base font-bold ${
                        res.bedUtilization.simulated > 92
                          ? 'text-[#A14D45]'
                          : res.bedUtilization.simulated > 85
                          ? 'text-[#A16207]'
                          : 'text-[#4F7A5F]'
                      }`}
                    >
                      {res.bedUtilization.simulated}%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8B95A5]">
                    {res.bedUtilization.simulated > 90 ? 'Critical threshold' : 'Nominal range'}
                  </div>
                </div>

                {/* Metric 3: Doctor Workload */}
                <div className="p-3 rounded-lg bg-[#FBFBF8] border border-subtle space-y-1">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-[#243B80]" />
                    Doctor Workload
                  </span>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-xs text-[#8B95A5]">{res.doctorWorkload.current}%</span>
                    <span className="text-[#8B95A5]/40">→</span>
                    <span
                      className={`text-base font-bold ${
                        res.doctorWorkload.simulated > 88
                          ? 'text-[#A14D45]'
                          : res.doctorWorkload.simulated > 75
                          ? 'text-[#A16207]'
                          : 'text-[#4F7A5F]'
                      }`}
                    >
                      {res.doctorWorkload.simulated}%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8B95A5]">
                    {res.doctorWorkload.simulated > 85 ? 'Fatigue warning' : 'Safe shift limits'}
                  </div>
                </div>

                {/* Metric 4: Diagnostic Utilization */}
                <div className="p-3 rounded-lg bg-[#FBFBF8] border border-subtle space-y-1">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1 font-medium">
                    <Activity className="w-3.5 h-3.5 text-[#243B80]" />
                    Diagnostics Load
                  </span>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-xs text-[#8B95A5]">{res.diagnosticUtilization.current}%</span>
                    <span className="text-[#8B95A5]/40">→</span>
                    <span
                      className={`text-base font-bold ${
                        res.diagnosticUtilization.simulated > 90
                          ? 'text-[#A14D45]'
                          : res.diagnosticUtilization.simulated > 80
                          ? 'text-[#A16207]'
                          : 'text-[#4F7A5F]'
                      }`}
                    >
                      {res.diagnosticUtilization.simulated}%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8B95A5]">CT & MRI imaging bay</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Identified Bottlenecks & Prescriptive Mitigations */}
          {res && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bottlenecks Card */}
              <div className="bg-white rounded-xl p-4 border border-subtle shadow-surface space-y-2.5">
                <span className="text-xs font-semibold text-[#A14D45] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Identified Triage Bottlenecks
                </span>
                <ul className="space-y-1.5 text-xs text-[#667085]">
                  {res.triageBottlenecks.map((bot, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#A14D45] font-mono text-[10px]">•</span>
                      <span>{bot}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mitigations Card */}
              <div className="bg-white rounded-xl p-4 border border-subtle shadow-surface space-y-2.5">
                <span className="text-xs font-semibold text-[#4F7A5F] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Recommended Operational Mitigations
                </span>
                <ul className="space-y-1.5 text-xs text-[#667085]">
                  {res.recommendedMitigations.map((mit, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#4F7A5F] font-mono text-[10px]">•</span>
                      <span>{mit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
