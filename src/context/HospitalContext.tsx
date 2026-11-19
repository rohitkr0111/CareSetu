import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  MetricCardData,
  ResourcePressureItem,
  DepartmentDemandItem,
  AIRecommendation,
  ProtectedCapacityItem,
  ResourceAllocationItem,
  AppointmentItem,
  BedItem,
  DoctorItem,
  DiagnosticUnitItem,
  AlertItem,
  AuditLogItem,
  SimulationParams,
  SimulationResult,
} from '../types';
import {
  INITIAL_USER,
  DEMO_PROFILES,
  INITIAL_METRICS,
  INITIAL_RESOURCE_PRESSURE,
  INITIAL_DEPARTMENTS,
  INITIAL_RECOMMENDATIONS,
  PROTECTED_CAPACITY,
  RESOURCE_ALLOCATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_BEDS,
  INITIAL_DOCTORS,
  INITIAL_DIAGNOSTICS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { CareSetuAPI } from '../services/apiService';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  timestamp: string;
}

interface HospitalContextType {
  // Auth state
  isAuthenticated: boolean;
  currentUser: UserProfile;
  availableProfiles: UserProfile[];
  login: (user?: UserProfile) => void;
  logout: () => void;
  switchUser: (user: UserProfile) => void;

  // Navigation
  activeNav: string;
  setActiveNav: (nav: string) => void;

  // Real-time state
  lastUpdated: string;
  isLiveUpdating: boolean;
  setIsLiveUpdating: (val: boolean) => void;
  triggerEmergencySurge: () => void;
  isSurgeActive: boolean;

  // Core data
  metrics: MetricCardData[];
  resourcePressure: ResourcePressureItem[];
  departments: DepartmentDemandItem[];
  recommendations: AIRecommendation[];
  protectedCapacity: ProtectedCapacityItem[];
  allocations: ResourceAllocationItem[];
  appointments: AppointmentItem[];
  beds: BedItem[];
  doctors: DoctorItem[];
  diagnostics: DiagnosticUnitItem[];
  alerts: AlertItem[];
  auditLogs: AuditLogItem[];

  // Actions
  approveRecommendation: (id: string, notes?: string) => Promise<void>;
  rejectRecommendation: (id: string, reason?: string) => Promise<void>;
  modifyRecommendation: (id: string, modifiedAllocations: { resource: string; delta: number }[]) => Promise<void>;
  acknowledgeAlert: (id: string) => void;
  updateBedStatus: (bedId: string, newStatus: BedItem['status']) => void;
  updateDoctorStatus: (docId: string, newStatus: DoctorItem['status']) => void;
  updateAppointmentStatus: (aptId: string, newStatus: AppointmentItem['status']) => void;
  applyOptimizedAllocations: () => Promise<void>;

  // Simulation
  simulationParams: SimulationParams;
  setSimulationParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  simulationResult: SimulationResult | null;
  runSimulation: (params?: SimulationParams) => Promise<void>;
  isSimulating: boolean;

  // Database sync
  refreshData: () => Promise<void>;

  // Toasts & Search
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [lastUpdated, setLastUpdated] = useState<string>('10:42 PM');
  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(true);
  const [isSurgeActive, setIsSurgeActive] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Core Data States
  const [metrics, setMetrics] = useState<MetricCardData[]>(INITIAL_METRICS);
  const [resourcePressure, setResourcePressure] = useState<ResourcePressureItem[]>(INITIAL_RESOURCE_PRESSURE);
  const [departments, setDepartments] = useState<DepartmentDemandItem[]>(INITIAL_DEPARTMENTS);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [protectedCapacity] = useState<ProtectedCapacityItem[]>(PROTECTED_CAPACITY);
  const [allocations, setAllocations] = useState<ResourceAllocationItem[]>(RESOURCE_ALLOCATIONS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [beds, setBeds] = useState<BedItem[]>(INITIAL_BEDS);
  const [doctors, setDoctors] = useState<DoctorItem[]>(INITIAL_DOCTORS);
  const [diagnostics, setDiagnostics] = useState<DiagnosticUnitItem[]>(INITIAL_DIAGNOSTICS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 'toast-init',
      title: 'CareSetu Operational Engine',
      message: 'Real-time resource telemetries synchronized with hospital HIS.',
      type: 'info',
      timestamp: '10:42 PM',
    },
  ]);

  // Simulation state
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    patientDemandPercent: 125,
    emergencyAdmissions: 28,
    availableDoctors: 42,
    availableBeds: 280,
    massCasualtyActive: false,
    fluSurgeActive: false,
    staffAbsencePercent: 8,
  });
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const addToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = `toast-${Date.now()}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setToasts((prev) => [{ id, title, message, type, timestamp: time }, ...prev.slice(0, 4)]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync data with backend SQLite database
  const refreshData = async () => {
    try {
      const [
        dash,
        bedsData,
        docsData,
        diagData,
        aptsData,
        alertsData,
        recsData,
        logsData,
      ] = await Promise.all([
        CareSetuAPI.getDashboardOverview(),
        CareSetuAPI.getBeds(),
        CareSetuAPI.getDoctors(),
        CareSetuAPI.getDiagnostics(),
        CareSetuAPI.getAppointments(),
        CareSetuAPI.getAlerts(),
        CareSetuAPI.getRecommendations(),
        CareSetuAPI.getAuditLogs(),
      ]);

      if (dash?.metrics?.length) {
        setMetrics(dash.metrics);
        setResourcePressure(dash.resourcePressure);
        setDepartments(dash.departments);
      }
      if (bedsData?.length) setBeds(bedsData);
      if (docsData?.length) setDoctors(docsData);
      if (diagData?.length) setDiagnostics(diagData);
      if (aptsData?.length) setAppointments(aptsData);
      if (alertsData?.length) setAlerts(alertsData);
      if (recsData?.length) setRecommendations(recsData);
      if (logsData?.length) setAuditLogs(logsData);
    } catch (err) {
      console.warn('[CareSetu Sync] Fallback to cache:', err);
    }
  };

  // Initial load from backend database & simulation run
  useEffect(() => {
    refreshData();
    runSimulation(simulationParams);
  }, []);

  // Real-time live background telemetry pulse (simulated WebSocket)
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Subtle fluctuation in appointments and beds
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.id === 'appointments') {
            const num = parseInt(m.value.replace(',', '')) + (Math.random() > 0.6 ? 1 : 0);
            return { ...m, value: num.toLocaleString() };
          }
          return m;
        })
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [isLiveUpdating]);

  const login = (user?: UserProfile) => {
    if (user) setCurrentUser(user);
    setIsAuthenticated(true);
    addToast('Authenticated', `Welcome back, ${user ? user.name : currentUser.name}`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast('Logged Out', 'Signed out from CareSetu security portal', 'info');
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    addToast('Role Switched', `Active identity changed to ${user.name} (${user.role})`, 'info');
  };

  const approveRecommendation = async (id: string, notes?: string) => {
    const result = await CareSetuAPI.executeRecommendationAction(id, 'APPROVE', currentUser.name);
    if (result.success) {
      setRecommendations((prev) => prev.map((r) => (r.id === id ? result.updatedRecommendation : r)));
      setAuditLogs((prev) => [result.auditLog, ...prev]);

      // Apply dynamic allocation updates
      if (id === 'rec-icu-01') {
        setMetrics((prev) =>
          prev.map((m) => {
            if (m.id === 'beds') return { ...m, value: '346 / 400', subvalue: '86.5% occupied (Flex active)' };
            if (m.id === 'alerts') return { ...m, value: '02', subvalue: '1 resolved', status: 'WARNING' };
            return m;
          })
        );
        setResourcePressure((prev) =>
          prev.map((rp) => {
            if (rp.id === 'icu-beds') {
              return { ...rp, utilization: 84, available: 7, status: 'NORMAL', trend: '+4 flex beds active' };
            }
            return rp;
          })
        );
      }

      addToast('Recommendation Approved', `Action "${result.updatedRecommendation.title}" executed & logged in audit trail.`, 'success');
    }
  };

  const rejectRecommendation = async (id: string, reason?: string) => {
    const result = await CareSetuAPI.executeRecommendationAction(id, 'REJECT', currentUser.name);
    if (result.success) {
      setRecommendations((prev) => prev.map((r) => (r.id === id ? result.updatedRecommendation : r)));
      setAuditLogs((prev) => [result.auditLog, ...prev]);
      addToast('Recommendation Rejected', `Recommendation ${id} declined by ${currentUser.name}. Model logged feedback.`, 'warning');
    }
  };

  const modifyRecommendation = async (id: string, modifiedAllocations: { resource: string; delta: number }[]) => {
    const result = await CareSetuAPI.executeRecommendationAction(id, 'MODIFY', currentUser.name);
    if (result.success) {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...result.updatedRecommendation, status: 'MODIFIED' } : r))
      );
      setAuditLogs((prev) => [result.auditLog, ...prev]);
      addToast('Recommendation Modified', `Adjusted allocation parameters saved and dispatched to operations team.`, 'info');
    }
  };

  const acknowledgeAlert = (id: string) => {
    CareSetuAPI.acknowledgeAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    addToast('Alert Acknowledged', 'Alert status updated in central hospital dashboard & database', 'info');
  };

  const updateBedStatus = (bedId: string, newStatus: BedItem['status']) => {
    CareSetuAPI.updateBed(bedId, { status: newStatus });
    setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status: newStatus } : b)));
    addToast('Bed Status Updated', `Bed ${bedId} updated to ${newStatus} in database`, 'info');
  };

  const updateDoctorStatus = (docId: string, newStatus: DoctorItem['status']) => {
    CareSetuAPI.updateDoctor(docId, { status: newStatus });
    setDoctors((prev) => prev.map((d) => (d.id === docId ? { ...d, status: newStatus } : d)));
    addToast('Doctor Roster Updated', `Physician roster status changed to ${newStatus}`, 'info');
  };

  const updateAppointmentStatus = (aptId: string, newStatus: AppointmentItem['status']) => {
    CareSetuAPI.updateAppointment(aptId, { status: newStatus });
    setAppointments((prev) => prev.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a)));
    addToast('Appointment Updated', `Appointment ${aptId} status: ${newStatus}`, 'info');
  };

  const applyOptimizedAllocations = async () => {
    const log: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.name,
      action: 'OPTIMIZATION_BATCH_APPLIED',
      category: 'Resource Operations',
      details: 'Dispatched recommended allocations across ICU, Emergency Triage, Nursing Pool, and CT slots.',
    };
    setAuditLogs((prev) => [log, ...prev]);
    addToast('Allocations Deployed', 'Optimal resource distribution active across all departments.', 'success');
  };

  const runSimulation = async (params: SimulationParams = simulationParams) => {
    setIsSimulating(true);
    try {
      const res = await CareSetuAPI.runScenarioSimulation(params);
      setSimulationResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  const triggerEmergencySurge = () => {
    setIsSurgeActive((prev) => {
      const next = !prev;
      CareSetuAPI.toggleSurge(next);
      if (next) {
        addToast('Surge Protocol Injected', 'Simulating mass trauma event (+45% emergency influx). Check alerts & recommendations.', 'critical');
        setMetrics((prevMetrics) =>
          prevMetrics.map((m) => {
            if (m.id === 'alerts') return { ...m, value: '05', subvalue: 'Surge active', status: 'CRITICAL' };
            if (m.id === 'diagnostics') return { ...m, value: '92%', status: 'CRITICAL' };
            return m;
          })
        );
        setResourcePressure((prevPressure) =>
          prevPressure.map((rp) => {
            if (rp.id === 'icu-beds') return { ...rp, utilization: 98, status: 'CRITICAL' };
            return rp;
          })
        );
      } else {
        addToast('Surge Scenario Reset', 'Hospital resource indicators returned to nominal baseline telemetry.', 'success');
        setMetrics(INITIAL_METRICS);
        setResourcePressure(INITIAL_RESOURCE_PRESSURE);
      }
      return next;
    });
  };

  return (
    <HospitalContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        availableProfiles: DEMO_PROFILES,
        login,
        logout,
        switchUser,
        activeNav,
        setActiveNav,
        lastUpdated,
        isLiveUpdating,
        setIsLiveUpdating,
        triggerEmergencySurge,
        isSurgeActive,
        metrics,
        resourcePressure,
        departments,
        recommendations,
        protectedCapacity,
        allocations,
        appointments,
        beds,
        doctors,
        diagnostics,
        alerts,
        auditLogs,
        approveRecommendation,
        rejectRecommendation,
        modifyRecommendation,
        acknowledgeAlert,
        updateBedStatus,
        updateDoctorStatus,
        updateAppointmentStatus,
        applyOptimizedAllocations,
        simulationParams,
        setSimulationParams,
        simulationResult,
        runSimulation,
        isSimulating,
        refreshData,
        toasts,
        dismissToast,
        addToast,
        globalSearch,
        setGlobalSearch,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
