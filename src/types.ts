export type StatusLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INFO';

export type UserRole = 'Chief Medical Officer' | 'Operations Director' | 'ICU Lead' | 'Triage Administrator';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  avatarInitials: string;
  hospitalId: string;
  hospitalName: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  subvalue: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status: StatusLevel;
  iconName: string;
}

export interface ResourcePressureItem {
  id: string;
  name: string;
  utilization: number; // 0-100
  status: StatusLevel;
  total: number;
  occupied: number;
  available: number;
  reserved: number;
  trend: string;
}

export interface ForecastDataPoint {
  time: string;
  actual: number | null;
  predicted: number;
  lowerBound?: number;
  upperBound?: number;
  surgeReason?: string;
}

export interface DepartmentDemandItem {
  id: string;
  name: string;
  utilization: number;
  currentLoad: number;
  maxCapacity: number;
  status: StatusLevel;
  trend: string;
  activeDoctors: number;
  waitingPatients: number;
}

export interface AIRecommendation {
  id: string;
  priority: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'ROUTINE';
  title: string;
  predictedIncrease: string;
  actionSummary: string;
  impactMetrics: {
    label: string;
    value: string;
    changeType: 'positive' | 'negative' | 'neutral';
  }[];
  explanations: string[];
  status: 'PENDING' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  timestamp: string;
  suggestedAllocations: {
    resource: string;
    current: number;
    recommended: number;
    delta: number;
  }[];
  approvedAt?: string;
  approvedBy?: string;
}

export interface ProtectedCapacityItem {
  id: string;
  resource: string;
  reservedCount: number;
  unit: string;
  statusText: string;
  complianceRate: string;
  description: string;
}

export interface ResourceAllocationItem {
  id: string;
  resource: string;
  category: 'Beds' | 'Personnel' | 'Diagnostics' | 'OT';
  current: number;
  recommended: number;
  change: number;
  unit: string;
  rationale: string;
  utilizationCurrent: number;
  utilizationOptimized: number;
}

export interface SimulationParams {
  patientDemandPercent: number; // e.g. 100 - 200
  emergencyAdmissions: number; // e.g. 10 - 50
  availableDoctors: number; // e.g. 20 - 100
  availableBeds: number; // e.g. 100 - 400
  massCasualtyActive: boolean;
  fluSurgeActive: boolean;
  staffAbsencePercent: number;
}

export interface SimulationResult {
  waitingTime: { current: number; simulated: number; unit: string };
  bedUtilization: { current: number; simulated: number; unit: string };
  doctorWorkload: { current: number; simulated: number; unit: string };
  diagnosticUtilization: { current: number; simulated: number; unit: string };
  emergencyCapacity: { current: string; simulated: string; status: StatusLevel };
  triageBottlenecks: string[];
  recommendedMitigations: string[];
}

export interface AppointmentItem {
  id: string;
  time: string;
  patientName: string;
  patientAge: number;
  department: string;
  doctor: string;
  status: 'COMPLETED' | 'CONFIRMED' | 'WAITING' | 'DELAYED';
  delayMinutes?: number;
  triagePriority: 'P1' | 'P2' | 'P3' | 'P4';
  notes: string;
}

export interface BedItem {
  id: string;
  bedNumber: string;
  ward: 'ICU' | 'HDU' | 'General Medical' | 'Surgical' | 'Emergency Triage' | 'Isolation / Negative Pressure';
  floor: string;
  status: 'Occupied' | 'Available' | 'Reserved' | 'Sanitizing' | 'Maintenance';
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
  projectedDischarge?: string;
  oxygenEquipped: boolean;
  ventilatorActive: boolean;
}

export interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  department: string;
  status: 'Available' | 'In Surgery' | 'On Round' | 'On Call' | 'Off Duty';
  activePatients: number;
  shiftHoursRemaining: number;
  fatigueIndex: 'Optimal' | 'Moderate' | 'Elevated';
  phoneExtension: string;
}

export interface DiagnosticUnitItem {
  id: string;
  name: string;
  type: 'CT' | 'MRI' | 'Ultrasound' | 'X-Ray' | 'Cath Lab' | 'Blood Bank / Lab';
  utilization: number;
  queueCount: number;
  estimatedWaitMinutes: number;
  scheduledToday: number;
  emergencyReservedSlots: number;
  status: StatusLevel;
  maintenanceStatus: 'Operational' | 'Scheduled Maintenance' | 'Calibration Required';
}

export interface AlertItem {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'NORMAL';
  title: string;
  description: string;
  sourceDepartment: string;
  timestamp: string;
  projectedTimeToExceed?: string;
  relatedRecommendationId?: string;
  acknowledged: boolean;
}

export interface FeedbackMetric {
  date: string;
  predictedDemand: number;
  actualDemand: number;
  mape: number; // Mean Absolute Percentage Error
  acceptanceRate: number;
  avgWaitTimeMinutes: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: string;
  details: string;
}
