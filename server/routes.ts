import express, { Request, Response } from 'express';
import { db, seedDatabase } from './db';
import { processAdminCommand } from './commandProcessor';
import {
  BedItem,
  DoctorItem,
  DiagnosticUnitItem,
  AppointmentItem,
  AlertItem,
  AIRecommendation,
  SimulationParams,
  SimulationResult,
} from '../src/types';

export const router = express.Router();

// GET /api/health
router.get('/health', (req: Request, res: Response) => {
  const surgeRow = db.prepare('SELECT value FROM system_config WHERE key = "surge_mode"').get() as { value?: string } | undefined;
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.4.0',
    surgeMode: surgeRow?.value === 'true',
    database: 'connected (node:sqlite)',
    hospitalNode: 'HOSP-IN-DEL-409',
  });
});

// GET /api/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const metrics = db.prepare('SELECT * FROM metrics').all();
    const resourcePressure = db.prepare('SELECT * FROM resource_pressure').all();
    const departments = db.prepare('SELECT * FROM department_demand').all();
    const protectedCapacity = db.prepare('SELECT * FROM protected_capacity').all();
    const activeAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE acknowledged = 0').get() as { count: number };
    const surgeRow = db.prepare('SELECT value FROM system_config WHERE key = "surge_mode"').get() as { value?: string } | undefined;

    res.json({
      metrics,
      resourcePressure,
      departments,
      protectedCapacity,
      activeAlertsCount: activeAlerts.count,
      systemStatus: surgeRow?.value === 'true' ? 'Surge Protocol' : 'Operational',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/demand/forecast
router.get('/demand/forecast', (req: Request, res: Response) => {
  const horizon = (req.query.horizon as string) || '24H';
  const points = db.prepare('SELECT time, actual, predicted, lowerBound, upperBound, surgeReason FROM forecast_points WHERE horizon = ?').all(horizon);

  let modelType = 'DeepAR Probabilistic Recurrent Engine';
  let confidenceInterval = '98%';
  let surgeWindow = '18:00 - 22:00 (Evening Trauma & Acute)';

  if (horizon === '7D') {
    modelType = 'Temporal Convolutional Net + ARIMA Ensemble';
    confidenceInterval = '95%';
    surgeWindow = 'Friday 16:00 - 23:00';
  } else if (horizon === '30D') {
    modelType = 'Multi-Horizon Transformer Forecaster';
    confidenceInterval = '90%';
    surgeWindow = 'Week 4 Monsoon Wave';
  }

  res.json({
    horizon,
    data: points,
    confidenceInterval,
    modelType,
    surgeWindow,
  });
});

// GET /api/resources/pressure
router.get('/resources/pressure', (req: Request, res: Response) => {
  const pressure = db.prepare('SELECT * FROM resource_pressure').all();
  res.json(pressure);
});

// BEDS CRUD
// GET /api/resources/beds
router.get('/resources/beds', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM beds').all() as any[];
  const beds: BedItem[] = rows.map((b) => ({
    id: b.id,
    bedNumber: b.bedNumber,
    ward: b.ward,
    floor: b.floor,
    status: b.status,
    patientId: b.patientId || undefined,
    patientName: b.patientName || undefined,
    admittedAt: b.admittedAt || undefined,
    projectedDischarge: b.projectedDischarge || undefined,
    oxygenEquipped: Boolean(b.oxygenEquipped),
    ventilatorActive: Boolean(b.ventilatorActive),
  }));
  res.json(beds);
});

// POST /api/resources/beds
router.post('/resources/beds', (req: Request, res: Response) => {
  const bed: BedItem = req.body;
  const id = bed.id || `bed-${Date.now()}`;
  db.prepare(`
    INSERT INTO beds (id, bedNumber, ward, floor, status, patientId, patientName, admittedAt, projectedDischarge, oxygenEquipped, ventilatorActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    bed.bedNumber,
    bed.ward,
    bed.floor,
    bed.status,
    bed.patientId || null,
    bed.patientName || null,
    bed.admittedAt || null,
    bed.projectedDischarge || null,
    bed.oxygenEquipped ? 1 : 0,
    bed.ventilatorActive ? 1 : 0
  );

  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)').run(
    `log-${Date.now()}`,
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    'System Administrator',
    'BED_PROVISIONED',
    'Resource Census',
    `Provisioned new bed ${bed.bedNumber} in ${bed.ward}.`
  );

  res.status(201).json({ ...bed, id });
});

// PATCH /api/resources/beds/:id
router.patch('/resources/beds/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const current = db.prepare('SELECT * FROM beds WHERE id = ?').get(id) as any;
  if (!current) {
    return res.status(404).json({ error: 'Bed not found' });
  }

  const updatedStatus = updates.status ?? current.status;
  const updatedPtName = updates.patientName !== undefined ? updates.patientName : current.patientName;
  const updatedPtId = updates.patientId !== undefined ? updates.patientId : current.patientId;
  const updatedO2 = updates.oxygenEquipped !== undefined ? (updates.oxygenEquipped ? 1 : 0) : current.oxygenEquipped;
  const updatedVent = updates.ventilatorActive !== undefined ? (updates.ventilatorActive ? 1 : 0) : current.ventilatorActive;

  db.prepare(`
    UPDATE beds
    SET status = ?, patientName = ?, patientId = ?, oxygenEquipped = ?, ventilatorActive = ?
    WHERE id = ?
  `).run(updatedStatus, updatedPtName, updatedPtId, updatedO2, updatedVent, id);

  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)').run(
    `log-${Date.now()}`,
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    'Triage Administrator',
    'BED_STATUS_CHANGED',
    'Bed Census',
    `Bed ${id} status updated to ${updatedStatus}.`
  );

  res.json({ success: true, id, status: updatedStatus });
});

// DOCTORS CRUD
// GET /api/resources/doctors
router.get('/resources/doctors', (req: Request, res: Response) => {
  const doctors = db.prepare('SELECT * FROM doctors').all();
  res.json(doctors);
});

// POST /api/resources/doctors
router.post('/resources/doctors', (req: Request, res: Response) => {
  const doc: DoctorItem = req.body;
  const id = doc.id || `doc-${Date.now()}`;
  db.prepare(`
    INSERT INTO doctors (id, name, specialty, department, status, activePatients, shiftHoursRemaining, fatigueIndex, phoneExtension)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    doc.name,
    doc.specialty,
    doc.department,
    doc.status,
    doc.activePatients,
    doc.shiftHoursRemaining,
    doc.fatigueIndex,
    doc.phoneExtension
  );
  res.status(201).json({ ...doc, id });
});

// PATCH /api/resources/doctors/:id
router.patch('/resources/doctors/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const current = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as any;
  if (!current) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const newStatus = updates.status ?? current.status;
  const newActivePts = updates.activePatients ?? current.activePatients;
  const newFatigue = updates.fatigueIndex ?? current.fatigueIndex;

  db.prepare(`
    UPDATE doctors
    SET status = ?, activePatients = ?, fatigueIndex = ?
    WHERE id = ?
  `).run(newStatus, newActivePts, newFatigue, id);

  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)').run(
    `log-${Date.now()}`,
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    'Staff Supervisor',
    'DOCTOR_ROSTER_UPDATED',
    'Staff Management',
    `Physician ${current.name} status updated to ${newStatus}.`
  );

  res.json({ success: true, id, status: newStatus });
});

// DIAGNOSTICS
// GET /api/resources/diagnostics
router.get('/resources/diagnostics', (req: Request, res: Response) => {
  const diag = db.prepare('SELECT * FROM diagnostics').all();
  res.json(diag);
});

// PATCH /api/resources/diagnostics/:id
router.patch('/resources/diagnostics/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const current = db.prepare('SELECT * FROM diagnostics WHERE id = ?').get(id) as any;
  if (!current) return res.status(404).json({ error: 'Diagnostic unit not found' });

  const newUtil = updates.utilization ?? current.utilization;
  const newQueue = updates.queueCount ?? current.queueCount;
  const newMaint = updates.maintenanceStatus ?? current.maintenanceStatus;

  db.prepare('UPDATE diagnostics SET utilization = ?, queueCount = ?, maintenanceStatus = ? WHERE id = ?')
    .run(newUtil, newQueue, newMaint, id);

  res.json({ success: true, id });
});

// APPOINTMENTS CRUD
// GET /api/appointments
router.get('/api/appointments', (req: Request, res: Response) => {
  const apts = db.prepare('SELECT * FROM appointments ORDER BY time ASC').all();
  res.json(apts);
});
router.get('/appointments', (req: Request, res: Response) => {
  const apts = db.prepare('SELECT * FROM appointments ORDER BY time ASC').all();
  res.json(apts);
});

// POST /api/appointments
router.post('/appointments', (req: Request, res: Response) => {
  const apt: AppointmentItem = req.body;
  const id = apt.id || `apt-${Date.now()}`;
  db.prepare(`
    INSERT INTO appointments (id, time, patientName, patientAge, department, doctor, status, delayMinutes, triagePriority, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    apt.time,
    apt.patientName,
    apt.patientAge,
    apt.department,
    apt.doctor,
    apt.status,
    apt.delayMinutes ?? 0,
    apt.triagePriority,
    apt.notes
  );

  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)').run(
    `log-${Date.now()}`,
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    'Triage Nurse',
    'APPOINTMENT_SCHEDULED',
    'Outpatient Queue',
    `Patient ${apt.patientName} scheduled for ${apt.department} with priority ${apt.triagePriority}.`
  );

  res.status(201).json({ ...apt, id });
});

// PATCH /api/appointments/:id
router.patch('/appointments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const current = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
  if (!current) return res.status(404).json({ error: 'Appointment not found' });

  const newStatus = updates.status ?? current.status;
  const newPriority = updates.triagePriority ?? current.triagePriority;
  const newDelay = updates.delayMinutes !== undefined ? updates.delayMinutes : current.delayMinutes;

  db.prepare('UPDATE appointments SET status = ?, triagePriority = ?, delayMinutes = ? WHERE id = ?')
    .run(newStatus, newPriority, newDelay, id);

  res.json({ success: true, id, status: newStatus, triagePriority: newPriority });
});

// ALERTS
// GET /api/alerts
router.get('/alerts', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC').all() as any[];
  const alerts: AlertItem[] = rows.map((a) => ({
    id: a.id,
    level: a.level,
    title: a.title,
    description: a.description,
    sourceDepartment: a.sourceDepartment,
    timestamp: a.timestamp,
    projectedTimeToExceed: a.projectedTimeToExceed || undefined,
    relatedRecommendationId: a.relatedRecommendationId || undefined,
    acknowledged: Boolean(a.acknowledged),
  }));
  res.json(alerts);
});

// POST /api/alerts/:id/acknowledge
router.post('/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const { id } = req.params;
  const resUpdate = db.prepare('UPDATE alerts SET acknowledged = 1 WHERE id = ?').run(id);
  if (resUpdate.changes === 0) return res.status(404).json({ error: 'Alert not found' });

  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)').run(
    `log-${Date.now()}`,
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    'Duty Officer',
    'ALERT_ACKNOWLEDGED',
    'Clinical Operations',
    `Alert ${id} acknowledged and flagged as addressed.`
  );

  res.json({ success: true, id, acknowledged: true });
});

// RECOMMENDATIONS
// GET /api/optimization/recommendations
router.get('/optimization/recommendations', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM recommendations').all() as any[];
  const recs: AIRecommendation[] = rows.map((r) => ({
    id: r.id,
    priority: r.priority,
    title: r.title,
    predictedIncrease: r.predictedIncrease,
    actionSummary: r.actionSummary,
    impactMetrics: JSON.parse(r.impactMetrics),
    explanations: JSON.parse(r.explanations),
    status: r.status,
    timestamp: r.timestamp,
    suggestedAllocations: JSON.parse(r.suggestedAllocations),
    approvedAt: r.approvedAt || undefined,
    approvedBy: r.approvedBy || undefined,
  }));
  res.json(recs);
});

// POST /api/optimization/recommendations/:id/action
router.post('/optimization/recommendations/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, actorName = 'Chief Medical Officer', modifiedAllocations } = req.body;

  const current = db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id) as any;
  if (!current) return res.status(404).json({ error: 'Recommendation not found' });

  const status = action === 'APPROVE' ? 'APPROVED' : action === 'MODIFY' ? 'MODIFIED' : 'REJECTED';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let updatedAllocations = current.suggestedAllocations;
  if (modifiedAllocations) {
    updatedAllocations = JSON.stringify(modifiedAllocations);
  }

  db.prepare(`
    UPDATE recommendations
    SET status = ?, approvedAt = ?, approvedBy = ?, suggestedAllocations = ?
    WHERE id = ?
  `).run(status, status === 'APPROVED' ? time : null, status === 'APPROVED' ? actorName : null, updatedAllocations, id);

  const logId = `log-${Date.now()}`;
  const details = `${action} decision on recommendation "${current.title}" (${id}) by ${actorName}.`;
  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)')
    .run(logId, time, actorName, `${action}_RECOMMENDATION`, 'Optimization Engine', details);

  // If approved, update ICU metrics
  if (action === 'APPROVE' && id === 'rec-icu-01') {
    db.prepare('UPDATE metrics SET value = "346 / 400", subvalue = "86.5% occupied (Flex active)" WHERE id = "beds"').run();
    db.prepare('UPDATE resource_pressure SET utilization = 84, available = 7, status = "NORMAL", trend = "+4 flex beds active" WHERE id = "icu-beds"').run();
  }

  const updatedRow = db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id) as any;
  const updatedRec: AIRecommendation = {
    ...updatedRow,
    impactMetrics: JSON.parse(updatedRow.impactMetrics),
    explanations: JSON.parse(updatedRow.explanations),
    suggestedAllocations: JSON.parse(updatedRow.suggestedAllocations),
  };

  res.json({
    success: true,
    updatedRecommendation: updatedRec,
    auditLog: { id: logId, timestamp: time, user: actorName, action: `${action}_RECOMMENDATION`, category: 'Optimization Engine', details },
  });
});

// GET /api/optimization/allocations
router.get('/optimization/allocations', (req: Request, res: Response) => {
  const allocations = db.prepare('SELECT * FROM resource_allocations').all();
  res.json({
    currentSituation: {
      predictedDemand: '+18% Peak Ingress',
      availableCapacity: '82% Total Ready',
      resourcePressure: 'HIGH (ICU 92%)',
    },
    allocations,
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
  });
});

// POST /api/optimization/apply
router.post('/optimization/apply', (req: Request, res: Response) => {
  const { user = 'Operations Director' } = req.body;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const logId = `log-${Date.now()}`;

  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)')
    .run(logId, time, user, 'OPTIMIZATION_BATCH_APPLIED', 'Resource Operations', 'Dispatched recommended allocations across ICU, Emergency Triage, Nursing Pool, and CT slots.');

  res.json({ success: true, message: 'Optimization batch deployed successfully', logId });
});

// SCENARIO SIMULATION
// POST /api/scenarios/run
router.post('/scenarios/run', (req: Request, res: Response) => {
  const params: SimulationParams = req.body;
  const demandMultiplier = (params.patientDemandPercent || 125) / 100;
  const emergencyFactor = (params.emergencyAdmissions || 28) / 20;
  const doctorFactor = 50 / Math.max(params.availableDoctors || 42, 15);
  const bedFactor = 300 / Math.max(params.availableBeds || 280, 100);
  const massCasualtyPenalty = params.massCasualtyActive ? 1.45 : 1.0;
  const fluSurgePenalty = params.fluSurgeActive ? 1.2 : 1.0;
  const absenceFactor = 1 + (params.staffAbsencePercent || 8) / 100;

  const rawWait = Math.round(38 * demandMultiplier * emergencyFactor * doctorFactor * massCasualtyPenalty * fluSurgePenalty * absenceFactor);
  const simulatedWait = Math.max(12, Math.min(180, rawWait));

  const rawBedUtil = Math.round(85 * demandMultiplier * (1 / ((params.availableBeds || 280) / 340)) * fluSurgePenalty);
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

  const result: SimulationResult = {
    waitingTime: { current: 38, simulated: simulatedWait, unit: 'min' },
    bedUtilization: { current: 85, simulated: simulatedBedUtil, unit: '%' },
    doctorWorkload: { current: 78, simulated: simulatedDocWorkload, unit: '%' },
    diagnosticUtilization: { current: 76, simulated: simulatedDiagUtil, unit: '%' },
    emergencyCapacity: { current: 'Protected (5 Beds)', simulated: emgText, status: emgStatus },
    triageBottlenecks: bottlenecks,
    recommendedMitigations: mitigations,
  };

  res.json(result);
});

// FEEDBACK & ACCURACY
// GET /api/feedback
router.get('/feedback', (req: Request, res: Response) => {
  const historical = db.prepare('SELECT date, predictedDemand, actualDemand, mape, acceptanceRate, avgWaitTimeMinutes FROM feedback_metrics').all();
  res.json({
    historical,
    overallMape: 3.4,
    acceptanceRate: 94.7,
    avgWaitReduction: '↓ 22.8%',
    totalDecisionsApproved: 342,
  });
});

// AUDIT LOGS
// GET /api/audit-logs
router.get('/audit-logs', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '50', 10);
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?').all(limit);
  res.json(logs);
});

// POST /api/audit-logs
router.post('/audit-logs', (req: Request, res: Response) => {
  const { user, action, category, details } = req.body;
  const id = `log-${Date.now()}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  db.prepare('INSERT INTO audit_logs (id, timestamp, user, action, category, details) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, timestamp, user || 'Anonymous', action || 'GENERAL_ACTION', category || 'General', details || '');
  res.status(201).json({ id, timestamp, user, action, category, details });
});

// ADMIN TERMINAL & DATABASE INSPECTOR
// POST /api/admin/terminal/execute
router.post('/admin/terminal/execute', (req: Request, res: Response) => {
  const { command, actor = 'Terminal Admin' } = req.body;
  const result = processAdminCommand(command || '', actor);
  res.json(result);
});

// GET /api/admin/db/tables
router.get('/admin/db/tables', (req: Request, res: Response) => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
  const tableData = tables.map((t) => {
    const count = (db.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get() as { c: number }).c;
    const columns = db.prepare(`PRAGMA table_info(${t.name})`).all() as { name: string; type: string }[];
    return { name: t.name, rowCount: count, columns };
  });
  res.json({ tables: tableData, databasePath: 'server/data/caresetu.db' });
});

// GET /api/admin/db/table/:name
router.get('/admin/db/table/:name', (req: Request, res: Response) => {
  const tableName = req.params.name;
  // Verify table exists to prevent SQL injection
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
  if (!tableExists) return res.status(404).json({ error: `Table ${tableName} does not exist.` });

  const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT 200`).all();
  res.json({ table: tableName, rows });
});

// POST /api/admin/db/query
router.post('/admin/db/query', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'SQL query required' });
  if (!/^select\s/i.test(query.trim()) && !/^pragma\s/i.test(query.trim())) {
    return res.status(403).json({ error: 'Only SELECT/PRAGMA queries allowed via API query endpoint.' });
  }

  try {
    const results = db.prepare(query).all();
    res.json({ success: true, count: results.length, data: results });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/admin/db/seed
router.post('/admin/db/seed', (req: Request, res: Response) => {
  seedDatabase();
  res.json({ success: true, message: 'Database reset and re-seeded to initial clinical reference state.' });
});

// POST /api/admin/surge
router.post('/admin/surge', (req: Request, res: Response) => {
  const { active } = req.body;
  if (active) {
    db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES ('surge_mode', 'true')").run();
    db.prepare("UPDATE metrics SET value = '98%', status = 'CRITICAL' WHERE id = 'beds'").run();
    db.prepare("UPDATE metrics SET value = '05', status = 'CRITICAL', subvalue = 'Surge Protocol Active' WHERE id = 'alerts'").run();
    db.prepare("UPDATE resource_pressure SET utilization = 98, status = 'CRITICAL' WHERE id = 'icu-beds'").run();
  } else {
    db.prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES ('surge_mode', 'false')").run();
    db.prepare("UPDATE metrics SET value = '342 / 400', status = 'NORMAL', subvalue = '85.5% occupied' WHERE id = 'beds'").run();
    db.prepare("UPDATE metrics SET value = '03', status = 'NORMAL', subvalue = 'All addressed' WHERE id = 'alerts'").run();
    db.prepare("UPDATE resource_pressure SET utilization = 92.5, status = 'CRITICAL' WHERE id = 'icu-beds'").run();
  }
  res.json({ success: true, surgeActive: Boolean(active) });
});
