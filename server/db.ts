import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_METRICS,
  INITIAL_RESOURCE_PRESSURE,
  INITIAL_DEPARTMENTS,
  INITIAL_RECOMMENDATIONS,
  PROTECTED_CAPACITY,
  RESOURCE_ALLOCATIONS,
  INITIAL_BEDS,
  INITIAL_DOCTORS,
  INITIAL_DIAGNOSTICS,
  INITIAL_APPOINTMENTS,
  INITIAL_ALERTS,
  INITIAL_FEEDBACK_METRICS,
  INITIAL_AUDIT_LOGS,
  FORECAST_24H,
  FORECAST_7D,
  FORECAST_30D,
} from '../src/data/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.resolve(DATA_DIR, 'caresetu.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrent performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      value TEXT NOT NULL,
      subvalue TEXT NOT NULL,
      trend TEXT,
      trendDirection TEXT,
      status TEXT NOT NULL,
      iconName TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resource_pressure (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      utilization REAL NOT NULL,
      status TEXT NOT NULL,
      total INTEGER NOT NULL,
      occupied INTEGER NOT NULL,
      available INTEGER NOT NULL,
      reserved INTEGER NOT NULL,
      trend TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS department_demand (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      utilization REAL NOT NULL,
      currentLoad INTEGER NOT NULL,
      maxCapacity INTEGER NOT NULL,
      status TEXT NOT NULL,
      trend TEXT NOT NULL,
      activeDoctors INTEGER NOT NULL,
      waitingPatients INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      priority TEXT NOT NULL,
      title TEXT NOT NULL,
      predictedIncrease TEXT NOT NULL,
      actionSummary TEXT NOT NULL,
      impactMetrics TEXT NOT NULL, -- JSON
      explanations TEXT NOT NULL,   -- JSON
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      suggestedAllocations TEXT NOT NULL, -- JSON
      approvedAt TEXT,
      approvedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS protected_capacity (
      id TEXT PRIMARY KEY,
      resource TEXT NOT NULL,
      reservedCount INTEGER NOT NULL,
      unit TEXT NOT NULL,
      statusText TEXT NOT NULL,
      complianceRate TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resource_allocations (
      id TEXT PRIMARY KEY,
      resource TEXT NOT NULL,
      category TEXT NOT NULL,
      current INTEGER NOT NULL,
      recommended INTEGER NOT NULL,
      change INTEGER NOT NULL,
      unit TEXT NOT NULL,
      rationale TEXT NOT NULL,
      utilizationCurrent REAL NOT NULL,
      utilizationOptimized REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS beds (
      id TEXT PRIMARY KEY,
      bedNumber TEXT NOT NULL,
      ward TEXT NOT NULL,
      floor TEXT NOT NULL,
      status TEXT NOT NULL,
      patientId TEXT,
      patientName TEXT,
      admittedAt TEXT,
      projectedDischarge TEXT,
      oxygenEquipped INTEGER NOT NULL, -- 0 or 1
      ventilatorActive INTEGER NOT NULL -- 0 or 1
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT NOT NULL,
      activePatients INTEGER NOT NULL,
      shiftHoursRemaining REAL NOT NULL,
      fatigueIndex TEXT NOT NULL,
      phoneExtension TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS diagnostics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      utilization REAL NOT NULL,
      queueCount INTEGER NOT NULL,
      estimatedWaitMinutes INTEGER NOT NULL,
      scheduledToday INTEGER NOT NULL,
      emergencyReservedSlots INTEGER NOT NULL,
      status TEXT NOT NULL,
      maintenanceStatus TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      patientName TEXT NOT NULL,
      patientAge INTEGER NOT NULL,
      department TEXT NOT NULL,
      doctor TEXT NOT NULL,
      status TEXT NOT NULL,
      delayMinutes INTEGER,
      triagePriority TEXT NOT NULL,
      notes TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      sourceDepartment TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      projectedTimeToExceed TEXT,
      relatedRecommendationId TEXT,
      acknowledged INTEGER NOT NULL -- 0 or 1
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      category TEXT NOT NULL,
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      predictedDemand INTEGER NOT NULL,
      actualDemand INTEGER NOT NULL,
      mape REAL NOT NULL,
      acceptanceRate REAL NOT NULL,
      avgWaitTimeMinutes INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS forecast_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      horizon TEXT NOT NULL, -- '24H' | '7D' | '30D'
      time TEXT NOT NULL,
      actual INTEGER,
      predicted INTEGER NOT NULL,
      lowerBound INTEGER,
      upperBound INTEGER,
      surgeReason TEXT
    );
  `);

  // Check if seeding is required
  const bedCount = db.prepare('SELECT COUNT(*) as count FROM beds').get() as { count: number };
  if (bedCount.count === 0) {
    seedDatabase();
  }
}

export function seedDatabase() {
  console.log('[CareSetu DB] Seeding database with initial clinical records...');

  // Clear existing
  db.exec(`
    DELETE FROM metrics;
    DELETE FROM resource_pressure;
    DELETE FROM department_demand;
    DELETE FROM recommendations;
    DELETE FROM protected_capacity;
    DELETE FROM resource_allocations;
    DELETE FROM beds;
    DELETE FROM doctors;
    DELETE FROM diagnostics;
    DELETE FROM appointments;
    DELETE FROM alerts;
    DELETE FROM audit_logs;
    DELETE FROM feedback_metrics;
    DELETE FROM forecast_points;
    DELETE FROM system_config;
  `);

  // Seed system_config
  const setConfig = db.prepare('INSERT INTO system_config (key, value) VALUES (?, ?)');
  setConfig.run('hospital_node_id', 'HOSP-IN-DEL-409');
  setConfig.run('hospital_name', 'Apex Metro General Hospital & Trauma Centre');
  setConfig.run('system_status', 'Operational');
  setConfig.run('surge_mode', 'false');
  setConfig.run('last_seeded', new Date().toISOString());

  // Metrics
  const insertMetric = db.prepare(`
    INSERT INTO metrics (id, title, value, subvalue, trend, trendDirection, status, iconName)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of INITIAL_METRICS) {
    insertMetric.run(m.id, m.title, m.value, m.subvalue, m.trend || '', m.trendDirection || 'neutral', m.status, m.iconName);
  }

  // Resource Pressure
  const insertPressure = db.prepare(`
    INSERT INTO resource_pressure (id, name, utilization, status, total, occupied, available, reserved, trend)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const rp of INITIAL_RESOURCE_PRESSURE) {
    insertPressure.run(rp.id, rp.name, rp.utilization, rp.status, rp.total, rp.occupied, rp.available, rp.reserved, rp.trend);
  }

  // Department Demand
  const insertDept = db.prepare(`
    INSERT INTO department_demand (id, name, utilization, currentLoad, maxCapacity, status, trend, activeDoctors, waitingPatients)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const dept of INITIAL_DEPARTMENTS) {
    insertDept.run(dept.id, dept.name, dept.utilization, dept.currentLoad, dept.maxCapacity, dept.status, dept.trend, dept.activeDoctors, dept.waitingPatients);
  }

  // Recommendations
  const insertRec = db.prepare(`
    INSERT INTO recommendations (id, priority, title, predictedIncrease, actionSummary, impactMetrics, explanations, status, timestamp, suggestedAllocations, approvedAt, approvedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const rec of INITIAL_RECOMMENDATIONS) {
    insertRec.run(
      rec.id,
      rec.priority,
      rec.title,
      rec.predictedIncrease,
      rec.actionSummary,
      JSON.stringify(rec.impactMetrics),
      JSON.stringify(rec.explanations),
      rec.status,
      rec.timestamp,
      JSON.stringify(rec.suggestedAllocations),
      rec.approvedAt || null,
      rec.approvedBy || null
    );
  }

  // Protected Capacity
  const insertProtected = db.prepare(`
    INSERT INTO protected_capacity (id, resource, reservedCount, unit, statusText, complianceRate, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const pc of PROTECTED_CAPACITY) {
    insertProtected.run(pc.id, pc.resource, pc.reservedCount, pc.unit, pc.statusText, pc.complianceRate, pc.description);
  }

  // Allocations
  const insertAlloc = db.prepare(`
    INSERT INTO resource_allocations (id, resource, category, current, recommended, change, unit, rationale, utilizationCurrent, utilizationOptimized)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const alloc of RESOURCE_ALLOCATIONS) {
    insertAlloc.run(
      alloc.id,
      alloc.resource,
      alloc.category,
      alloc.current,
      alloc.recommended,
      alloc.change,
      alloc.unit,
      alloc.rationale,
      alloc.utilizationCurrent,
      alloc.utilizationOptimized
    );
  }

  // Beds
  const insertBed = db.prepare(`
    INSERT INTO beds (id, bedNumber, ward, floor, status, patientId, patientName, admittedAt, projectedDischarge, oxygenEquipped, ventilatorActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const bed of INITIAL_BEDS) {
    insertBed.run(
      bed.id,
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
  }

  // Doctors
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (id, name, specialty, department, status, activePatients, shiftHoursRemaining, fatigueIndex, phoneExtension)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const doc of INITIAL_DOCTORS) {
    insertDoctor.run(
      doc.id,
      doc.name,
      doc.specialty,
      doc.department,
      doc.status,
      doc.activePatients,
      doc.shiftHoursRemaining,
      doc.fatigueIndex,
      doc.phoneExtension
    );
  }

  // Diagnostics
  const insertDiag = db.prepare(`
    INSERT INTO diagnostics (id, name, type, utilization, queueCount, estimatedWaitMinutes, scheduledToday, emergencyReservedSlots, status, maintenanceStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const diag of INITIAL_DIAGNOSTICS) {
    insertDiag.run(
      diag.id,
      diag.name,
      diag.type,
      diag.utilization,
      diag.queueCount,
      diag.estimatedWaitMinutes,
      diag.scheduledToday,
      diag.emergencyReservedSlots,
      diag.status,
      diag.maintenanceStatus
    );
  }

  // Appointments
  const insertApt = db.prepare(`
    INSERT INTO appointments (id, time, patientName, patientAge, department, doctor, status, delayMinutes, triagePriority, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const apt of INITIAL_APPOINTMENTS) {
    insertApt.run(
      apt.id,
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
  }

  // Alerts
  const insertAlert = db.prepare(`
    INSERT INTO alerts (id, level, title, description, sourceDepartment, timestamp, projectedTimeToExceed, relatedRecommendationId, acknowledged)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const alert of INITIAL_ALERTS) {
    insertAlert.run(
      alert.id,
      alert.level,
      alert.title,
      alert.description,
      alert.sourceDepartment,
      alert.timestamp,
      alert.projectedTimeToExceed || null,
      alert.relatedRecommendationId || null,
      alert.acknowledged ? 1 : 0
    );
  }

  // Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, timestamp, user, action, category, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const log of INITIAL_AUDIT_LOGS) {
    insertAudit.run(log.id, log.timestamp, log.user, log.action, log.category, log.details);
  }

  // Feedback Metrics
  const insertFeedback = db.prepare(`
    INSERT INTO feedback_metrics (date, predictedDemand, actualDemand, mape, acceptanceRate, avgWaitTimeMinutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const fm of INITIAL_FEEDBACK_METRICS) {
    insertFeedback.run(fm.date, fm.predictedDemand, fm.actualDemand, fm.mape, fm.acceptanceRate, fm.avgWaitTimeMinutes);
  }

  // Forecast points
  const insertForecast = db.prepare(`
    INSERT INTO forecast_points (horizon, time, actual, predicted, lowerBound, upperBound, surgeReason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const fp of FORECAST_24H) {
    insertForecast.run('24H', fp.time, fp.actual, fp.predicted, fp.lowerBound || null, fp.upperBound || null, fp.surgeReason || null);
  }
  for (const fp of FORECAST_7D) {
    insertForecast.run('7D', fp.time, fp.actual, fp.predicted, fp.lowerBound || null, fp.upperBound || null, fp.surgeReason || null);
  }
  for (const fp of FORECAST_30D) {
    insertForecast.run('30D', fp.time, fp.actual, fp.predicted, fp.lowerBound || null, fp.upperBound || null, fp.surgeReason || null);
  }

  console.log('[CareSetu DB] Database seeded successfully.');
}

// Auto-initialize schema on import
initDatabase();

