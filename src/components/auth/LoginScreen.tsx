import React, { useState } from 'react';
import { Shield, ArrowRight, Lock, Building2, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { CareSetuLogo } from '../common/CareSetuLogo';
import { useHospital } from '../../context/HospitalContext';
import { UserProfile } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, availableProfiles } = useHospital();
  const [hospitalId, setHospitalId] = useState('HOSP-IN-DEL-409');
  const [email, setEmail] = useState('rajesh.sen@apexmetro.org');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(availableProfiles[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedProfile);
  };

  const handleSelectDemoUser = (prof: UserProfile) => {
    setSelectedProfile(prof);
    setEmail(`${prof.name.toLowerCase().replace(/[^a-z]/g, '.')}@apexmetro.org`);
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7F3] flex items-center justify-center p-4 lg:p-8 selection:bg-[#243B80]/20">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-white border border-subtle shadow-modal overflow-hidden">
        {/* Left Side: Hospital Command Center Narrative & Intelligence Workflow */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-[#FBFBF8]/50 border-b lg:border-b-0 lg:border-r border-subtle relative">
          <div className="space-y-6">
            <CareSetuLogo size="lg" showSubtitle={true} />

            <div className="space-y-3 pt-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-[#1C1C1E] font-heading leading-tight">
                Intelligent Resource Management for Smarter Hospitals
              </h2>
              <p className="text-sm text-[#667085] leading-relaxed max-w-lg">
                Predict patient surge demand. Mathematically balance beds, doctors, and diagnostic capacity. Ensure explainable human approval for clinical safety.
              </p>
            </div>

            {/* Core Intelligence Pipeline Visualization */}
            <div className="pt-4 space-y-2.5">
              <span className="text-[11px] uppercase font-mono tracking-wider text-[#243B80] flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3 h-3 text-[#243B80]" />
                Closed-Loop Decision Architecture
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-subtle space-y-1 shadow-sm">
                  <div className="text-[10px] text-[#243B80] font-mono font-bold">01 · FORECAST</div>
                  <div className="text-[#1C1C1E] font-medium">Temporal Ingress</div>
                  <div className="text-[11px] text-[#667085]">DeepAR + ARIMA</div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-subtle space-y-1 shadow-sm">
                  <div className="text-[10px] text-[#243B80] font-mono font-bold">02 · PRESSURE</div>
                  <div className="text-[#1C1C1E] font-medium">Resource Triage</div>
                  <div className="text-[11px] text-[#667085]">ICU / OT Bottlenecks</div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-subtle space-y-1 shadow-sm">
                  <div className="text-[10px] text-[#243B80] font-mono font-bold">03 · EXPLAINABLE AI</div>
                  <div className="text-[#1C1C1E] font-medium">Prescriptive Steps</div>
                  <div className="text-[11px] text-[#667085]">Human Approval Gate</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-subtle mt-8 flex items-center justify-between text-xs text-[#667085]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4F7A5F]" />
              <span>HIPAA & DISHA Compliant Gateway</span>
            </div>
            <span className="font-mono text-[11px] text-[#8B95A5]">Apex Metro General Hospital</span>
          </div>
        </div>

        {/* Right Side: Sign-In Credentials & Persona Quick Switch */}
        <div className="lg:col-span-5 p-8 lg:p-10 bg-white flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1C1E] font-heading">
                Operational Sign In
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                Authorized hospital personnel & clinical leads only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#667085] font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#8B95A5]" />
                  Hospital Code
                </label>
                <input
                  type="text"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="w-full bg-[#FBFBF8] border border-subtle rounded-lg px-3 py-2 text-xs text-[#1C1C1E] font-mono focus:outline-none focus:border-[#243B80]/50 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#667085] font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8B95A5]" />
                  Authorized ID / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FBFBF8] border border-subtle rounded-lg px-3 py-2 text-xs text-[#1C1C1E] focus:outline-none focus:border-[#243B80]/50 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#667085] font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8B95A5]" />
                  Access Token / Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FBFBF8] border border-subtle rounded-lg px-3 py-2 text-xs text-[#1C1C1E] font-mono focus:outline-none focus:border-[#243B80]/50 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                id="btn-sign-in"
                className="w-full py-2.5 px-4 bg-[#243B80] hover:bg-[#101827] text-white font-bold text-xs rounded-lg transition-subtle flex items-center justify-center gap-2 shadow-surface hover:-translate-y-0.5"
              >
                <span>Access Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Persona Selection */}
            <div className="pt-3 border-t border-subtle space-y-2">
              <span className="text-[11px] text-[#667085] font-semibold block">
                Quick Demo Access Roles:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {availableProfiles.map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(prof)}
                    className={`p-2 rounded-lg text-left border text-[11px] transition-colors ${
                      selectedProfile.id === prof.id
                        ? 'bg-[#FBFBF8] border-[#243B80]/50 text-[#243B80] shadow-sm'
                        : 'bg-white border-subtle text-[#667085] hover:text-[#1C1C1E]'
                    }`}
                  >
                    <p className="font-semibold truncate">{prof.name.split(',')[0]}</p>
                    <p className="text-[10px] text-[#8B95A5] truncate">{prof.role}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <span className="text-[11px] text-[#8B95A5]">
              CareSetu Enterprise Operations v2.4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
