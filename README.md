# CareSetu (केयर सेतु)
### Intelligent Hospital Resource Intelligence & Clinical Capacity Orchestrator

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%2024%2B-green.svg)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-SQLite%20(node%3Asqlite%20WAL)-blue.svg)](https://sqlite.org)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind%204-indigo.svg)](https://react.dev)
[![Standard](https://img.shields.io/badge/Compliance-DISHA%20%7C%20HIPAA-emerald.svg)](#compliance--security)

CareSetu is an enterprise-grade hospital resource intelligence platform designed to balance patient demand with physical clinical capacity in real time. Built for hospital command centers, triage administrators, and chief medical officers, CareSetu connects ward sensors, EHR feeds, and outpatient appointment queues into a unified, high-integrity decision plane.

---

## Key Highlights

- **Persistent SQLite Ledger**: Native SQLite database (`server/data/caresetu.db`) running in high-performance Write-Ahead Logging (WAL) mode with zero external binaries.
- **Interactive Admin Terminal**: High-fidelity CLI operational console (`caresetu-adm:~$`) with command recall, real-time node diagnostics, and SQL inspection.
- **Full-Stack REST Architecture**: Complete Express API service layer powering bed management, physician rosters, outpatient triage, alerts, and audit logging.
- **Explainable Clinical Recommendations**: AI-driven resource reallocation suggestions requiring explicit clinician digital signatures.
- **Scenario Stress Testing**: Mathematical simulation engine to test mass-casualty events, respiratory surges, and staff shortages before impacting physical wards.
- **Emergency Reserve Protection**: Dedicated locking of critical care assets (5 ICU beds and 3 emergency trauma physicians) to guarantee Code Blue readiness.

---

## Architectural Overview

```
                      +------------------------------------------+
                      |         CareSetu Clinical Web UI         |
                      |    (React 19, TypeScript, Tailwind 4)    |
                      +--------------------+---------------------+
                                           |
                           HTTP / REST API | /api/*
                                           v
                      +--------------------+---------------------+
                      |       CareSetu Express API Gateway       |
                      |  - Dashboard & Telemetry Pipelines       |
                      |  - Bed Census & Doctor Roster Endpoints  |
                      |  - Scenario Simulation Mathematical Engine|
                      |  - Admin Terminal Command Interpreter    |
                      +--------------------+---------------------+
                                           |
                                node:sqlite | DatabaseSync (WAL Mode)
                                           v
                      +--------------------+---------------------+
                      |        SQLite Relational Database        |
                      |         (server/data/caresetu.db)        |
                      |  - beds, doctors, appointments, alerts   |
                      |  - recommendations, audit_logs, metrics  |
                      |  - forecast_points, feedback_metrics     |
                      +------------------------------------------+
```

---

## Core Capabilities

### 1. Hospital Operations Command Dashboard
- Six synchronized KPI cards: Available Beds, Doctors Available, Staff Utilization, Diagnostics Utilization, Active Pressure Alerts, Outpatient Wait Times.
- Ward pressure gauges across Intensive Care (ICU), High Dependency Units (HDU), General Medical, and Isolation.
- Emergency reserve compliance indicator confirming protected buffer isolation.

### 2. Interactive Admin Terminal (`caresetu-adm:~$`)
A clinical CLI shell designed for hospital systems engineers and operations leads:
- **System Health & Telemetry**: `status`, `health`, `telemetry`
- **Database Inspection**: `db:stats`, `db:tables`, `db:query <SQL>`, `db:seed`
- **Resource Management**: `beds:list [ward]`, `beds:update <id> <status>`, `docs:list`, `docs:shift <id> <status>`
- **Triage & Queue Control**: `apts:list`, `apts:triage <id> <P1-P4>`, `alerts:list`, `alerts:ack <id>`
- **Emergency Surge Protocol**: `surge:trigger`, `surge:reset`
- **Audit Logging**: `audit:tail [limit]`

### 3. Visual Database Explorer & SQL Console
- Direct inspection of all relational tables (`beds`, `doctors`, `appointments`, `diagnostics`, `alerts`, `recommendations`, `audit_logs`).
- Real-time text search and filter across columns.
- One-click JSON export for regulatory archiving.
- Read-only SQL query runner with syntax-checked execution.

### 4. Demand Forecasting Engine
- Multi-horizon forecasting (24-Hour hourly, 7-Day daily, and 30-Day strategic outlooks).
- Probabilistic DeepAR recurrent modeling with 95% confidence bounds.
- Automated detection of impending surge windows (e.g. evening acute ingress, monsoon seasonal waves).

### 5. Prescriptive Optimization & Clinician-in-the-Loop
- Transparent mathematical models that rebalance staff and beds from elective departments to acute wards.
- Full clinician governance: medical officers review rationale, impact metrics, and can **APPROVE**, **MODIFY**, or **REJECT** decisions.
- Every sign-off is permanently recorded in the tamper-evident audit ledger.

### 6. Scenario Stress Testing & Simulation
- Dynamic mathematical model allowing administrators to simulate:
  - Patient demand swings (100% to 200%)
  - Mass casualty incidents (+45% trauma ingress)
  - Staff absenteeism and influenza epidemic outbreaks
- Predicts door-to-doctor waiting times, bed saturation, and generates actionable bottleneck mitigations.

---

## Database Schema

CareSetu stores its relational state inside `server/data/caresetu.db`:

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `beds` | Physical bed census | `id`, `bedNumber`, `ward`, `floor`, `status`, `patientName`, `oxygenEquipped`, `ventilatorActive` |
| `doctors` | Physician shift rosters | `id`, `name`, `specialty`, `department`, `status`, `activePatients`, `fatigueIndex` |
| `appointments` | Outpatient & triage queue | `id`, `time`, `patientName`, `patientAge`, `doctor`, `status`, `triagePriority`, `notes` |
| `diagnostics` | Imaging & Cath Lab units | `id`, `name`, `type`, `utilization`, `queueCount`, `emergencyReservedSlots`, `maintenanceStatus` |
| `alerts` | Early-warning thresholds | `id`, `level`, `title`, `description`, `sourceDepartment`, `timestamp`, `acknowledged` |
| `recommendations` | Prescriptive AI actions | `id`, `priority`, `title`, `status`, `impactMetrics`, `suggestedAllocations`, `approvedBy` |
| `audit_logs` | Compliance event log | `id`, `timestamp`, `user`, `action`, `category`, `details` |
| `metrics` | High-level KPI values | `id`, `title`, `value`, `subvalue`, `status`, `trendDirection` |
| `resource_pressure`| Departmental load | `id`, `name`, `utilization`, `status`, `total`, `occupied`, `available` |

---

## REST API Reference

The backend exposes standardized endpoints under `/api`:

### System & Admin
- `GET /api/health` — Subsystem heartbeat and node status
- `POST /api/admin/terminal/execute` — Execute administrative CLI command
- `GET /api/admin/db/tables` — List database tables and row counts
- `GET /api/admin/db/table/:name` — Retrieve table rows
- `POST /api/admin/db/query` — Execute safe read-only SQL query
- `POST /api/admin/db/seed` — Re-seed database with default fixtures
- `POST /api/admin/surge` — Toggle mass-casualty surge telemetry

### Operations & Resources
- `GET /api/dashboard` — Live metric cards, pressure gauges, and alerts summary
- `GET /api/demand/forecast` — Multi-horizon patient demand forecasts
- `GET /api/resources/beds` — Full bed census
- `PATCH /api/resources/beds/:id` — Update bed status or patient assignment
- `POST /api/resources/beds` — Provision a new bed
- `GET /api/resources/doctors` — On-duty physician rosters
- `PATCH /api/resources/doctors/:id` — Update physician status or fatigue index
- `GET /api/resources/diagnostics` — Imaging suite queue status
- `GET /api/appointments` — Outpatient triage appointments
- `POST /api/appointments` — Schedule new triage appointment
- `PATCH /api/appointments/:id` — Update appointment status or priority
- `GET /api/alerts` — Active early-warning alerts
- `POST /api/alerts/:id/acknowledge` — Acknowledge alert
- `GET /api/optimization/recommendations` — AI prescriptive recommendations
- `POST /api/optimization/recommendations/:id/action` — Clinician sign-off (APPROVE/MODIFY/REJECT)
- `POST /api/scenarios/run` — Execute scenario stress simulation
- `GET /api/audit-logs` — Regulatory audit trail

---

## Getting Started

### Prerequisites
- **Node.js**: v22.0.0 or higher (Node.js v24 recommended for built-in `node:sqlite`)
- **npm**: v10+

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd c:\Users\Hp\Desktop\CareSetu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm run dev
   ```
   *The development server starts on `http://localhost:3000` with Vite and the integrated Express + SQLite backend proxy.*

4. Alternatively, to run the standalone backend server independently:
   ```bash
   npm run server
   ```
   *Runs on `http://localhost:5001`.*

5. To build for production:
   ```bash
   npm run build
   ```

---

## Admin Terminal Quick Reference

Once running, navigate to the **Admin Terminal** in the sidebar (or click the bottom terminal widget) to run commands:

```bash
# Check node status and active bed occupancy
status

# View database table row counts
db:stats

# Query available ICU beds
db:query SELECT id, bedNumber, floor, status FROM beds WHERE ward = 'ICU'

# Update a bed's status
beds:update bed-01 Available

# Update a physician's shift
docs:shift doc-01 "In Surgery"

# Simulate an emergency surge protocol
surge:trigger

# Review recent clinician audit entries
audit:tail 10
```

---

## Compliance & Security

CareSetu is structured to comply with healthcare regulatory standards:
- **DISHA (Digital Information Security in Healthcare Act)**: Strict role-based access control and patient anonymization.
- **HIPAA Compliance**: Encrypted data-at-rest via SQLite database permissions, zero plaintext patient identifiers outside encrypted channels.
- **Clinician Signature Requirement**: Machine learning allocations cannot bypass physical clinicians; every reallocation requires an authorized digital sign-off recorded in the audit log.

---

## License

Distributed under the Apache 2.0 License. See `LICENSE` for details.
