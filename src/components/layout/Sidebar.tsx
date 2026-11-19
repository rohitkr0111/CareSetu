import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Sliders,
  PlaySquare,
  Bed,
  Stethoscope,
  Activity,
  Calendar,
  AlertTriangle,
  Brain,
  Shield,
  BarChart3,
  FileText,
  Repeat,
  Settings,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import { CareSetuLogo } from '../common/CareSetuLogo';
import { useHospital } from '../../context/HospitalContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'sand' | 'critical' | 'normal';
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, alerts, recommendations } = useHospital();

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const pendingRecsCount = recommendations.filter((r) => r.status === 'PENDING').length;

  const NAV_GROUPS: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      groupTitle: 'INTELLIGENCE',
      items: [
        { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
        { id: 'optimization', label: 'Optimization', icon: Sliders, badge: 'AI Engine', badgeType: 'sand' },
        { id: 'simulation', label: 'Scenario Simulation', icon: PlaySquare },
      ],
    },
    {
      groupTitle: 'RESOURCES',
      items: [
        { id: 'beds', label: 'Beds & Census', icon: Bed },
        { id: 'doctors', label: 'Doctors & Staff', icon: Stethoscope },
        { id: 'diagnostics', label: 'Diagnostics & OT', icon: Activity },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
      ],
    },
    {
      groupTitle: 'OPERATIONS',
      items: [
        {
          id: 'alerts',
          label: 'Alerts',
          icon: AlertTriangle,
          badge: unreadAlertsCount > 0 ? `0${unreadAlertsCount}` : undefined,
          badgeType: 'critical',
        },
        {
          id: 'recommendations',
          label: 'AI Recommendations',
          icon: Brain,
          badge: pendingRecsCount > 0 ? `${pendingRecsCount} Action` : undefined,
          badgeType: 'sand',
        },
        { id: 'emergency', label: 'Emergency Capacity', icon: Shield, badge: 'Active', badgeType: 'normal' },
      ],
    },
    {
      groupTitle: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
        { id: 'feedback', label: 'Feedback Loop', icon: Repeat, badge: 'ML 94.7%', badgeType: 'sand' },
        { id: 'reports', label: 'Operational Reports', icon: FileText },
      ],
    },
    {
      groupTitle: 'CORE SYSTEM',
      items: [
        { id: 'admin', label: 'Admin Terminal', icon: Terminal, badge: 'SQLite DB', badgeType: 'normal' },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white/72 backdrop-blur-xl border-r border-[#D9DDE5]/70 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 overflow-hidden select-none shadow-[18px_0_56px_-52px_rgba(28,28,30,0.28)]">
      {/* Top Header & Brand */}
      <div className="px-5 py-7 border-b border-[#D9DDE5]/70 bg-transparent">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-[#101827] flex items-center justify-center rounded-md shadow-[0_10px_22px_-14px_rgba(28,28,30,0.42)]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 10" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-[#1C1C1E]">CareSetu</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8B95A5] ml-11 font-medium">Intelligent Operations</p>
      </div>

      {/* Navigation Links with Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupTitle} className="space-y-1.5">
            <div className="text-[9px] font-bold text-[#8B95A5] uppercase tracking-[0.22em] px-3.5 mb-2 mt-1">
              {group.groupTitle}
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => setActiveNav(item.id)}
                    className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-md transition-subtle group text-left ${
                      isActive
                        ? 'bg-white/82 border border-[#D9DDE5]/80 text-[#1C1C1E] font-semibold shadow-[0_12px_26px_-24px_rgba(28,28,30,0.28)]'
                        : 'text-[#667085] hover:bg-white/54 hover:text-[#1C1C1E]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-[#243B80]" />
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center transition-subtle ${
                        isActive ? 'bg-[#F7F7F3]' : 'bg-transparent group-hover:bg-white/80'
                      }`}>
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-subtle ${
                          isActive
                            ? 'text-[#243B80]'
                            : 'text-[#8B95A5] group-hover:text-[#1C1C1E]'
                        }`}
                      />
                      </span>
                      <span className="text-sm truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${
                          item.badgeType === 'critical'
                            ? 'bg-[#A14D45]/10 border-[#A14D45]/25 text-[#A14D45]'
                            : item.badgeType === 'normal'
                            ? 'bg-[#4F7A5F]/10 border-[#4F7A5F]/25 text-[#4F7A5F]'
                            : 'bg-[#FBFBF8] border-[#D9DDE5] text-[#667085]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Utilities & System Info */}
      <div className="p-4 border-t border-[#D9DDE5]/70 space-y-2 bg-transparent">
        <button
          onClick={() => setActiveNav('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-subtle ${
            activeNav === 'settings'
              ? 'bg-white/80 text-[#1C1C1E] border border-[#D9DDE5]/80 font-semibold'
              : 'text-[#667085] hover:text-[#1C1C1E] hover:bg-white/60'
          }`}
        >
          <Settings className="w-4 h-4 text-[#8B95A5]" />
          <span>System Settings</span>
        </button>

        <button
          id="btn-admin-terminal-bottom"
          onClick={() => setActiveNav('admin')}
          className={`w-full px-3.5 py-2.5 rounded-xl control-surface flex items-center justify-between text-xs transition-subtle cursor-pointer text-left ${
            activeNav === 'admin'
              ? 'bg-[#101827] text-white border-[#101827] shadow-sm'
              : 'hover:border-[#243B80]/40 hover:-translate-y-0.5'
          }`}
          title="Open Admin Terminal & Database Console"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-semibold ${
              activeNav === 'admin'
                ? 'bg-white/20 text-[#38BDF8]'
                : 'bg-[#FBFBF8] border border-subtle text-[#243B80]'
            }`}>
              AD
            </div>
            <div>
              <p className={`text-xs font-medium leading-none ${activeNav === 'admin' ? 'text-white' : 'text-[#1C1C1E]'}`}>
                Admin Terminal
              </p>
              <p className={`text-[10px] leading-none mt-1 ${activeNav === 'admin' ? 'text-[#94A3B8]' : 'text-[#8B95A5]'}`}>
                System Manager
              </p>
            </div>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7A5F] shadow-[0_0_6px_#4F7A5F]"></span>
        </button>
      </div>
    </aside>
  );
};
