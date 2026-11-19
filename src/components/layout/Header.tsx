import React, { useState } from 'react';
import {
  Bell,
  Search,
  Activity,
  Flame,
  UserCheck,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    activeNav,
    lastUpdated,
    isLiveUpdating,
    setIsLiveUpdating,
    triggerEmergencySurge,
    isSurgeActive,
    currentUser,
    availableProfiles,
    switchUser,
    logout,
    alerts,
    setActiveNav,
    globalSearch,
    setGlobalSearch,
  } = useHospital();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const getNavTitle = () => {
    switch (activeNav) {
      case 'dashboard':
        return { title: 'Hospital Overview', subtitle: 'Live resource intelligence and operational command center' };
      case 'forecast':
        return { title: 'Patient Demand Forecast', subtitle: 'Deep temporal forecasting & surge prediction models' };
      case 'optimization':
        return { title: 'Resource Optimization Engine', subtitle: 'Mathematical demand-capacity balancing & reallocations' };
      case 'simulation':
        return { title: 'Scenario Simulation', subtitle: 'Test operational decisions before applying them to physical wards' };
      case 'beds':
        return { title: 'Bed Management & Triage', subtitle: 'Real-time census across ICU, HDU, General and Isolation wings' };
      case 'doctors':
        return { title: 'Doctors & Clinical Staff', subtitle: 'Shift rosters, fatigue indices, and active patient-to-staff ratios' };
      case 'diagnostics':
        return { title: 'Diagnostics & Cath Lab', subtitle: 'Scanner utilization, imaging queues, and emergency reserved slots' };
      case 'appointments':
        return { title: 'Outpatient Triage & Schedule', subtitle: 'Live department queue tracking and delay mitigation' };
      case 'alerts':
        return { title: 'Alerts & Resource Pressure', subtitle: 'Early-warning thresholds and bottleneck prevention' };
      case 'recommendations':
        return { title: 'AI Recommendations', subtitle: 'Explainable prescriptive interventions requiring clinician review' };
      case 'emergency':
        return { title: 'Emergency Capacity Protection', subtitle: 'Guaranteed reserves for code blue and polytrauma ingress' };
      case 'feedback':
      case 'analytics':
        return { title: 'Prediction & Continuous Learning', subtitle: 'Model accuracy telemetry and closed-loop feedback pipeline' };
      case 'settings':
        return { title: 'System Configuration', subtitle: 'Hospital parameters, telemetry endpoints, and access credentials' };
      case 'admin':
        return { title: 'Admin Terminal & Database Console', subtitle: 'Direct SQLite clinical ledger control, command orchestration, and system diagnostics' };
      default:
        return { title: 'Hospital Overview', subtitle: 'Live Operations' };
    }
  };

  const { title, subtitle } = getNavTitle();
  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <header className="glass-header px-4 lg:px-10 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Left Title & Timestamp */}
      <div className="flex flex-col min-w-0 pr-4">
        <h1 className="text-xs lg:text-sm font-semibold text-[#1C1C1E] truncate">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-[#667085] tracking-[0.12em] uppercase mt-1 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7A5F] shadow-[0_0_0_4px_rgba(82,122,94,0.12)] flex-shrink-0"></span>
          <span>System Operational · Thursday, 20 Aug 2026 · {lastUpdated}</span>
        </div>
      </div>

      {/* Right Controls & Indicators */}
      <div className="flex items-center gap-2.5 lg:gap-4 flex-shrink-0">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-72">
          <Search className="w-3.5 h-3.5 text-[#8B95A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search bed, doc, alert..."
            className="w-full control-surface rounded-lg pl-8 pr-3 py-2 text-xs text-[#1C1C1E] placeholder-[#8B95A5] premium-focus transition-subtle"
          />
        </div>

        {/* Live Pulse Telemetry Indicator */}
        <div
          onClick={() => setIsLiveUpdating(!isLiveUpdating)}
          title={`Click to ${isLiveUpdating ? 'pause' : 'resume'} live telemetry stream`}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg control-surface cursor-pointer hover:border-[#243B80]/30 hover:-translate-y-0.5 transition-subtle"
        >
          <span className="relative flex h-2 w-2">
            {isLiveUpdating && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F7A5F] opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveUpdating ? 'bg-[#4F7A5F]' : 'bg-[#A16207]'
              }`}
            ></span>
          </span>
          <div className="flex flex-col text-[11px]">
            <span className="text-[#1C1C1E] font-medium leading-none">
              {isLiveUpdating ? 'System Operational' : 'Stream Paused'}
            </span>
            <span className="text-[10px] text-[#667085] leading-none mt-0.5">
              Updated {lastUpdated}
            </span>
          </div>
        </div>

        {/* Emergency Surge Simulation Toggle Button */}
        <button
          id="btn-surge-trigger"
          onClick={triggerEmergencySurge}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-subtle ${
            isSurgeActive
              ? 'bg-[#A14D45]/10 border-[#A14D45]/40 text-[#A14D45] shadow-sm font-semibold'
              : 'control-surface text-[#667085] hover:text-[#1C1C1E] hover:border-[#243B80]/30 hover:-translate-y-0.5'
          }`}
          title="Inject sudden emergency mass-casualty surge for testing system response"
        >
          <Flame className={`w-3.5 h-3.5 ${isSurgeActive ? 'text-[#A14D45] animate-pulse' : 'text-[#A16207]'}`} />
          <span className="hidden lg:inline">{isSurgeActive ? 'Surge Injected' : 'Simulate Surge'}</span>
        </button>

        {/* Alerts Bell with Dropdown */}
        <div className="relative">
          <button
            id="btn-alerts-bell"
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-lg control-surface text-[#667085] hover:text-[#1C1C1E] hover:border-[#243B80]/30 hover:-translate-y-0.5 transition-subtle"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A14D45] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 premium-surface rounded-xl shadow-elevated p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-subtle mb-2">
                <span className="text-xs font-semibold text-[#1C1C1E] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#243B80]" />
                  Active Operational Alerts
                </span>
                <button
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    setActiveNav('alerts');
                  }}
                  className="text-[11px] text-[#243B80] hover:underline font-medium"
                >
                  View All ({alerts.length})
                </button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-lg bg-[#FFFFFF] border border-subtle hover:border-[#243B80]/30 hover:shadow-surface transition-subtle"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                          alert.level === 'CRITICAL'
                            ? 'bg-[#A14D45]/10 text-[#A14D45] border border-[#A14D45]/20'
                            : alert.level === 'WARNING'
                            ? 'bg-[#A16207]/10 text-[#A16207] border border-[#A16207]/20'
                            : 'bg-[#4F7A5F]/10 text-[#4F7A5F] border border-[#4F7A5F]/20'
                        }`}
                      >
                        {alert.level}
                      </span>
                      <span className="text-[10px] text-[#8B95A5]">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium text-[#1C1C1E] truncate">{alert.title}</p>
                    <p className="text-[11px] text-[#667085] line-clamp-2 mt-0.5">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            id="btn-user-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg control-surface hover:border-[#243B80]/30 hover:-translate-y-0.5 transition-subtle"
          >
            <div className="w-7 h-7 rounded-md bg-[#243B80] text-white text-xs font-semibold flex items-center justify-center font-heading shadow-[0_8px_18px_-12px_rgba(28,28,30,0.42)]">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-[#1C1C1E] leading-none truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#243B80] font-medium leading-none mt-1 truncate max-w-[130px]">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8B95A5]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 premium-surface rounded-xl shadow-elevated p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2.5 py-2 border-b border-subtle mb-1.5">
                <p className="text-xs font-semibold text-[#1C1C1E]">{currentUser.name}</p>
                <p className="text-[11px] text-[#667085] truncate">{currentUser.department}</p>
                <div className="mt-1.5 text-[10px] text-[#243B80] font-mono bg-[#FBFBF8] px-2 py-0.5 rounded border border-subtle inline-block font-medium">
                  {currentUser.hospitalId}
                </div>
              </div>

              <div className="px-2 py-1">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8B95A5]">
                  Switch Demo Persona
                </span>
              </div>

              <div className="space-y-1 mb-2">
                {availableProfiles.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      switchUser(prof);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      prof.id === currentUser.id
                        ? 'bg-[#243B80]/10 text-[#243B80] font-medium border border-[#243B80]/30'
                        : 'text-[#667085] hover:bg-[#FBFBF8] hover:text-[#1C1C1E]'
                    }`}
                  >
                    <div>
                      <p className="truncate font-medium">{prof.name}</p>
                      <p className="text-[10px] text-[#8B95A5]">{prof.role}</p>
                    </div>
                    {prof.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-[#243B80]" />}
                  </button>
                ))}
              </div>

              <div className="pt-1.5 border-t border-subtle">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#A14D45] hover:bg-[#A14D45]/10 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out of CareSetu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
