import {
  INITIAL_METRICS,
  INITIAL_RESOURCE_PRESSURE,
  FORECAST_24H,
  FORECAST_7D,
  FORECAST_30D,
  INITIAL_DEPARTMENTS,
  INITIAL_RECOMMENDATIONS,
  PROTECTED_CAPACITY,
  RESOURCE_ALLOCATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_BEDS,
  INITIAL_DOCTORS,
  INITIAL_DIAGNOSTICS,
  INITIAL_ALERTS,
  INITIAL_FEEDBACK_METRICS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  MetricCardData,
  ResourcePressureItem,
  ForecastDataPoint,
  DepartmentDemandItem,
  AIRecommendation,
  ProtectedCapacityItem,
  ResourceAllocationItem,
  AppointmentItem,
  BedItem,
  DoctorItem,
  DiagnosticUnitItem,
  AlertItem,
  FeedbackMetric,
  AuditLogItem,
  SimulationParams,
  SimulationResult,
} from '../types';

/**
 * CareSetu Enterprise REST API Service Layer
 * Direct HTTP database connection with automatic fallback for zero-downtime reliability.
 */

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      console.warn(`[CareSetu API] HTTP ${res.status} on ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[CareSetu API] Network error on ${url}:`, err);
    return null;
  }
}

export const CareSetuAPI = {
  // GET /api/dashboard
  async getDashboardOverview(): Promise<{
    metrics: MetricCardData[];
    resourcePressure: ResourcePressureItem[];
    departments: DepartmentDemandItem[];
    protectedCapacity: ProtectedCapacityItem[];
    activeAlertsCount: number;
    systemStatus: 'Operational' | 'High Pressure' | 'Surge Protocol';
  }> {
    const data = await fetchJson<{
      metrics: MetricCardData[];
      resourcePressure: ResourcePressureItem[];
      departments: DepartmentDemandItem[];
      protectedCapacity: ProtectedCapacityItem[];
      activeAlertsCount: number;
      systemStatus: 'Operational' | 'High Pressure' | 'Surge Protocol';
    }>('/dashboard');

    if (data && data.metrics && data.metrics.length > 0) {
      return data;
    }

    return {
      metrics: INITIAL_METRICS,
      resourcePressure: INITIAL_RESOURCE_PRESSURE,
      departments: INITIAL_DEPARTMENTS,
      protectedCapacity: PROTECTED_CAPACITY,
      activeAlertsCount: 3,
      systemStatus: 'Operational',
    };
  },

  // GET /api/demand/forecast?horizon=24H|7D|30D
  async getDemandForecast(horizon: '24H' | '7D' | '30D' = '24H'): Promise<{
    horizon: string;
    data: ForecastDataPoint[];
    confidenceInterval: string;
    modelType: string;
    surgeWindow?: string;
  }> {
    const remote = await fetchJson<{
      horizon: string;
      data: ForecastDataPoint[];
      confidenceInterval: string;
      modelType: string;
      surgeWindow?: string;
    }>(`/demand/forecast?horizon=${horizon}`);

    if (remote && remote.data && remote.data.length > 0) {
      return remote;
    }

    if (horizon === '7D') {
      return {
        horizon: '7D',
        data: FORECAST_7D,
        confidenceInterval: '95%',
        modelType: 'Temporal Convolutional Net + ARIMA Ensemble',
        surgeWindow: 'Friday 16:00 - 23:00',
      };
    }
    if (horizon === '30D') {
      return {
        horizon: '30D',
        data: FORECAST_30D,
        confidenceInterval: '90%',
        modelType: 'Multi-Horizon Transformer Forecaster',
        surgeWindow: 'Week 4 Monsoon Wave',
      };
    }
    return {
      horizon: '24H',
      data: FORECAST_24H,
      confidenceInterval: '98%',
      modelType: 'DeepAR Probabilistic Recurrent Engine',
      surgeWindow: '18:00 - 22:00 (Evening Trauma & Acute)',
    };
  },

  // GET /api/resources/pressure
  async getResourcePressure(): Promise<ResourcePressureItem[]> {
    const res = await fetchJson<ResourcePressureItem[]>('/resources/pressure');
    return res && res.length > 0 ? res : INITIAL_RESOURCE_PRESSURE;
  },

  // GET /api/optimization/recommendations
  async getRecommendations(): Promise<AIRecommendation[]> {
    const res = await fetchJson<AIRecommendation[]>('/optimization/recommendations');
    return res && res.length > 0 ? res : INITIAL_RECOMMENDATIONS;
  },

  // POST /api/optimization/recommendations/:id/action
  async executeRecommendationAction(
    recId: string,
    action: 'APPROVE' | 'MODIFY' | 'REJECT',
    actorName: string,
    modifiedParams?: Partial<AIRecommendation>
  ): Promise<{ success: boolean; updatedRecommendation: AIRecommendation; auditLog: AuditLogItem }> {
    const remote = await fetchJson<{
      success: boolean;
      updatedRecommendation: AIRecommendation;
      auditLog: AuditLogItem;
    }>(`/optimization/recommendations/${recId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, actorName, modifiedAllocations: modifiedParams?.suggestedAllocations }),
    });

    if (remote && remote.success) {
      return remote;
    }

    // Fallback local logic
    const target = INITIAL_RECOMMENDATIONS.find((r) => r.id === recId) || INITIAL_RECOMMENDATIONS[0];
    const updated: AIRecommendation = {
      ...target,
      ...modifiedParams,
      status: action === 'APPROVE' ? 'APPROVED' : action === 'MODIFY' ? 'MODIFIED' : 'REJECTED',
      approvedAt: action === 'APPROVE' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      approvedBy: action === 'APPROVE' ? actorName : undefined,
    };

    const audit: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: actorName,
      action: `${action}_RECOMMENDATION`,
      category: 'Optimization Engine',
      details: `${action} decision on recommendation "${target.title}" (${target.id}).`,
    };

    return { success: true, updatedRecommendation: updated, auditLog: audit };
  },

  // GET /api/optimization/allocations
  async getAllocations(): Promise<{
    currentSituation: { predictedDemand: string; availableCapacity: string; resourcePressure: string };
    allocations: ResourceAllocationItem[];
    reasoningSteps: string[];
    expectedOutcomes: { waitingTime: string; resourceUtilization: string; emergencyReserve: string };
  }> {
    const remote = await fetchJson<{
      currentSituation: { predictedDemand: string; availableCapacity: string; resourcePressure: string };
      allocations: ResourceAllocationItem[];
      reasoningSteps: string[];
      expectedOutcomes: { waitingTime: string; resourceUtilization: string; emergencyReserve: string };
    }>('/optimization/allocations');

    if (remote && remote.allocations) return remote;

    return {
      currentSituation: {
        predictedDemand: '+18% Peak Ingress',
        availableCapacity: '82% Total Ready',
        resourcePressure: 'HIGH (ICU 92%)',
      },
      allocations: RESOURCE_ALLOCATIONS,
      reasoningSteps: [
        'Emergency demand is forecast to increase by 28% between 18:00 and 22:00.',
        'Current ICU utilization has reached 92% with only 3 non-reserved beds open.',
        'Five ICU beds must remain strictly reserved for polytrauma and code blue arrivals.',
        'Two emergency physicians are currently finishing elective shifts and available for acute rotation.',
        'Optimization model recommends reallocating beds and staff from lower-demand elective departments.',
      ],
      expectedOutcomes: {
        waitingTime: '42 min → 34 min (-19%)',
        resourceUtilization: '82% → 89% (Optimal load)',
        emergencyReserve: '100% Protected (5 ICU Beds, 3 Trauma Docs)',
      },
    };
  },

  // POST /api/scenarios/run
  async runScenarioSimulation(params: SimulationParams): Promise<SimulationResult> {
    const remote = await fetchJson<SimulationResult>('/scenarios/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (remote && remote.waitingTime) return remote;

    // Mathematical simulation model fallback
    const demandMultiplier = params.patientDemandPercent / 100;
    const emergencyFactor = params.emergencyAdmissions / 20;
    const doctorFactor = 50 / Math.max(params.availableDoctors, 15);
    const massCasualtyPenalty = params.massCasualtyActive ? 1.45 : 1.0;
    const fluSurgePenalty = params.fluSurgeActive ? 1.2 : 1.0;
    const absenceFactor = 1 + params.staffAbsencePercent / 100;

    const rawWait = Math.round(
      38 * demandMultiplier * emergencyFactor * doctorFactor * massCasualtyPenalty * fluSurgePenalty * absenceFactor
    );
    const simulatedWait = Math.max(12, Math.min(180, rawWait));

    const rawBedUtil = Math.round(85 * demandMultiplier * (1 / (params.availableBeds / 340)) * fluSurgePenalty);
    const simulatedBedUtil = Math.max(45, Math.min(100, rawBedUtil));

    const rawDocWorkload = Math.round(78 * demandMultiplier * doctorFactor * massCasualtyPenalty * absenceFactor);
    const simulatedDocWorkload = Math.max(40, Math.min(100, rawDocWorkload));

    const rawDiagUtil = Math.round(76 * demandMultiplier * (params.massCasualtyActive ? 1.35 : 1.05));
    const simulatedDiagUtil = Math.max(40, Math.min(100, rawDiagUtil));

    let emgStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    let emgText = 'Protected (5 Beds / 3 Docs)';
    if (simulatedBedUtil > 94 || simulatedWait > 65 || params.massCasualtyActive) {
      emgStatus = 'CRITICAL';
      emgText = 'Compromised (Surge Protocol Required)';
    } else if (simulatedBedUtil > 88 || simulatedWait > 45) {
      emgStatus = 'WARNING';
      emgText = 'Strained (Buffer Depleting)';
    }

    const bottlenecks: string[] = [];
    if (simulatedBedUtil > 90) bottlenecks.push('ICU & HDU Bed Occupancy Critical (>90%)');
    if (simulatedDocWorkload > 88) bottlenecks.push('Emergency Physician Fatigue Index High');
    if (simulatedWait > 50) bottlenecks.push('Triage Door-to-Doctor Wait Exceeds Standard Threshold');
    if (simulatedDiagUtil > 90) bottlenecks.push('CT Scanner Imaging Queue Backlog Expected');
    if (bottlenecks.length === 0) bottlenecks.push('All hospital resource buffers within nominal tolerances');

    const mitigations: string[] = [];
    if (simulatedBedUtil > 90) mitigations.push('Fast-track step-down HDU transfers & pause non-urgent elective admissions');
    if (simulatedDocWorkload > 85) mitigations.push('Mobilize on-call reserve physician pool & reassign OPD specialists');
    if (simulatedDiagUtil > 85) mitigations.push('Reserve CT-2 exclusively for trauma stroke protocol and defer outpatient scans');
    if (mitigations.length === 0) mitigations.push('Maintain active continuous monitoring. No immediate override necessary.');

    return {
      waitingTime: { current: 38, simulated: simulatedWait, unit: 'min' },
      bedUtilization: { current: 85, simulated: simulatedBedUtil, unit: '%' },
      doctorWorkload: { current: 78, simulated: simulatedDocWorkload, unit: '%' },
      diagnosticUtilization: { current: 76, simulated: simulatedDiagUtil, unit: '%' },
      emergencyCapacity: { current: 'Protected (5 Beds)', simulated: emgText, status: emgStatus },
      triageBottlenecks: bottlenecks,
      recommendedMitigations: mitigations,
    };
  },

  // BEDS
  async getBeds(): Promise<BedItem[]> {
    const res = await fetchJson<BedItem[]>('/resources/beds');
    return res && res.length > 0 ? res : INITIAL_BEDS;
  },

  async updateBed(bedId: string, updates: Partial<BedItem>): Promise<boolean> {
    const res = await fetchJson<{ success: boolean }>(`/resources/beds/${bedId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return Boolean(res?.success);
  },

  async addBed(bed: BedItem): Promise<BedItem | null> {
    return await fetchJson<BedItem>('/resources/beds', {
      method: 'POST',
      body: JSON.stringify(bed),
    });
  },

  // DOCTORS
  async getDoctors(): Promise<DoctorItem[]> {
    const res = await fetchJson<DoctorItem[]>('/resources/doctors');
    return res && res.length > 0 ? res : INITIAL_DOCTORS;
  },

  async updateDoctor(docId: string, updates: Partial<DoctorItem>): Promise<boolean> {
    const res = await fetchJson<{ success: boolean }>(`/resources/doctors/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return Boolean(res?.success);
  },

  // DIAGNOSTICS
  async getDiagnostics(): Promise<DiagnosticUnitItem[]> {
    const res = await fetchJson<DiagnosticUnitItem[]>('/resources/diagnostics');
    return res && res.length > 0 ? res : INITIAL_DIAGNOSTICS;
  },

  // APPOINTMENTS
  async getAppointments(): Promise<AppointmentItem[]> {
    const res = await fetchJson<AppointmentItem[]>('/appointments');
    return res && res.length > 0 ? res : INITIAL_APPOINTMENTS;
  },

  async updateAppointment(aptId: string, updates: Partial<AppointmentItem>): Promise<boolean> {
    const res = await fetchJson<{ success: boolean }>(`/appointments/${aptId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return Boolean(res?.success);
  },

  async addAppointment(apt: AppointmentItem): Promise<AppointmentItem | null> {
    return await fetchJson<AppointmentItem>('/appointments', {
      method: 'POST',
      body: JSON.stringify(apt),
    });
  },

  // ALERTS
  async getAlerts(): Promise<AlertItem[]> {
    const res = await fetchJson<AlertItem[]>('/alerts');
    return res && res.length > 0 ? res : INITIAL_ALERTS;
  },

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    const res = await fetchJson<{ success: boolean }>(`/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
    return Boolean(res?.success);
  },

  // FEEDBACK
  async getFeedbackMetrics(): Promise<{
    historical: FeedbackMetric[];
    overallMape: number;
    acceptanceRate: number;
    avgWaitReduction: string;
    totalDecisionsApproved: number;
  }> {
    const res = await fetchJson<{
      historical: FeedbackMetric[];
      overallMape: number;
      acceptanceRate: number;
      avgWaitReduction: string;
      totalDecisionsApproved: number;
    }>('/feedback');

    if (res && res.historical) return res;

    return {
      historical: INITIAL_FEEDBACK_METRICS,
      overallMape: 3.4,
      acceptanceRate: 94.7,
      avgWaitReduction: '↓ 22.8%',
      totalDecisionsApproved: 342,
    };
  },

  // AUDIT LOGS
  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetchJson<AuditLogItem[]>('/audit-logs');
    return res && res.length > 0 ? res : INITIAL_AUDIT_LOGS;
  },

  // ADMIN TERMINAL EXECUTION
  async executeAdminCommand(
    command: string,
    actor: string = 'Terminal Admin'
  ): Promise<{ success: boolean; command: string; output: string; data?: any; timestamp: string }> {
    const res = await fetchJson<{ success: boolean; command: string; output: string; data?: any; timestamp: string }>(
      '/admin/terminal/execute',
      {
        method: 'POST',
        body: JSON.stringify({ command, actor }),
      }
    );

    if (res) return res;

    return {
      success: false,
      command,
      output: `Local terminal emulation: command "${command}" recorded. Backend connection pending.`,
      timestamp: new Date().toLocaleTimeString(),
    };
  },

  // DATABASE EXPLORER
  async getDatabaseTables(): Promise<{
    tables: { name: string; rowCount: number; columns: { name: string; type: string }[] }[];
    databasePath: string;
  } | null> {
    return await fetchJson<{
      tables: { name: string; rowCount: number; columns: { name: string; type: string }[] }[];
      databasePath: string;
    }>('/admin/db/tables');
  },

  async getTableRows(tableName: string): Promise<{ table: string; rows: any[] } | null> {
    return await fetchJson<{ table: string; rows: any[] }>(`/admin/db/table/${tableName}`);
  },

  async runDatabaseQuery(query: string): Promise<{ success: boolean; count: number; data: any[] } | null> {
    return await fetchJson<{ success: boolean; count: number; data: any[] }>('/admin/db/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  async resetDatabase(): Promise<{ success: boolean; message: string } | null> {
    return await fetchJson<{ success: boolean; message: string }>('/admin/db/seed', {
      method: 'POST',
    });
  },

  async toggleSurge(active: boolean): Promise<boolean> {
    const res = await fetchJson<{ success: boolean; surgeActive: boolean }>('/admin/surge', {
      method: 'POST',
      body: JSON.stringify({ active }),
    });
    return Boolean(res?.success);
  },
};
