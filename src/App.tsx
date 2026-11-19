import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginScreen } from './components/auth/LoginScreen';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { DemandForecastView } from './components/forecast/DemandForecastView';
import { OptimizationView } from './components/optimization/OptimizationView';
import { ScenarioSimulationView } from './components/simulation/ScenarioSimulationView';
import { BedsManagementView } from './components/resources/BedsManagementView';
import { StaffRosterView } from './components/resources/StaffRosterView';
import { DiagnosticsView } from './components/resources/DiagnosticsView';
import { AppointmentsView } from './components/resources/AppointmentsView';
import { AlertsCenterView } from './components/alerts/AlertsCenterView';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { FeedbackLoopView } from './components/insights/FeedbackLoopView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminTerminalView } from './components/admin/AdminTerminalView';
import { Menu, X } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { isAuthenticated, activeNav } = useHospital();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    switch (activeNav) {
      case 'dashboard':
      case 'emergency':
        return <OverviewDashboard />;
      case 'forecast':
        return <DemandForecastView />;
      case 'optimization':
        return <OptimizationView />;
      case 'simulation':
        return <ScenarioSimulationView />;
      case 'beds':
        return <BedsManagementView />;
      case 'doctors':
        return <StaffRosterView />;
      case 'diagnostics':
        return <DiagnosticsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'alerts':
        return <AlertsCenterView />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'feedback':
      case 'analytics':
      case 'reports':
        return <FeedbackLoopView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminTerminalView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen premium-shell text-[#1C1C1E] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 bg-white h-full shadow-modal flex flex-col">
            <div className="p-3 flex justify-end border-b border-subtle bg-[#FFFFFF]">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#1C1C1E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileSidebarOpen(false)}>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Navigation Header Bar */}
        <div className="lg:hidden h-14 glass-header px-4 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg control-surface text-[#1C1C1E] transition-subtle active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading font-semibold text-sm text-[#1C1C1E]">
            Care<span className="text-[#243B80]">Setu</span>
          </span>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <Header />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-12 lg:py-10 max-w-[1520px] w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainAppLayout />
    </HospitalProvider>
  );
}
