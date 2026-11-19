import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Database,
  Server,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Table as TableIcon,
  RefreshCw,
  Search,
  Shield,
  Activity,
  ChevronRight,
  Flame,
  Download,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CareSetuAPI } from '../../services/apiService';
import { useHospital } from '../../context/HospitalContext';

interface TerminalLog {
  id: string;
  command: string;
  output: string;
  success: boolean;
  timestamp: string;
}

export const AdminTerminalView: React.FC = () => {
  const { currentUser, isSurgeActive, triggerEmergencySurge, refreshData, addToast } = useHospital();
  const [activeTab, setActiveTab] = useState<'terminal' | 'database' | 'sql'>('terminal');

  // Terminal state
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      command: 'status',
      output: `[CareSetu Telemetry Node] Hosp ID: HOSP-IN-DEL-409 (Apex Metro Trauma Centre)
Node Status:        OPERATIONAL (DISHA/HIPAA Compliant)
SQLite Engine:      WAL mode synchronous=NORMAL (node:sqlite native)
Database:           server/data/caresetu.db
System:             Ready for operator instructions. Type "help" to list available commands.`,
      success: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Database Explorer state
  const [dbTables, setDbTables] = useState<{ name: string; rowCount: number; columns: { name: string; type: string }[] }[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('beds');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // SQL Query Runner state
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT id, bedNumber, ward, status, patientName FROM beds WHERE status = 'Occupied'");
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isSqlRunning, setIsSqlRunning] = useState(false);

  // Load database metadata
  useEffect(() => {
    loadDatabaseMeta();
  }, []);

  // Scroll terminal to bottom
  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, activeTab]);

  const loadDatabaseMeta = async () => {
    const res = await CareSetuAPI.getDatabaseTables();
    if (res && res.tables) {
      setDbTables(res.tables);
      if (res.tables.length > 0 && !selectedTable) {
        setSelectedTable(res.tables[0].name);
      }
    }
  };

  // Load selected table data
  useEffect(() => {
    if (selectedTable) {
      fetchTableRows(selectedTable);
    }
  }, [selectedTable]);

  const fetchTableRows = async (tableName: string) => {
    setIsLoadingTable(true);
    try {
      const res = await CareSetuAPI.getTableRows(tableName);
      if (res && res.rows) {
        setTableData(res.rows);
      }
    } finally {
      setIsLoadingTable(false);
    }
  };

  const handleCommandSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    if (cmd.toLowerCase() === 'clear') {
      setTerminalLogs([]);
      setCommandInput('');
      return;
    }

    setIsExecuting(true);
    // Add to history
    setCommandHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)]);
    setHistoryIndex(-1);

    try {
      const result = await CareSetuAPI.executeAdminCommand(cmd, currentUser.name);
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: result.output,
          success: result.success,
          timestamp: result.timestamp || new Date().toLocaleTimeString(),
        },
      ]);
      setCommandInput('');

      // Refresh app data context if command altered state
      if (cmd.startsWith('beds:') || cmd.startsWith('docs:') || cmd.startsWith('alerts:') || cmd.startsWith('surge:') || cmd.startsWith('db:seed')) {
        await refreshData();
        await loadDatabaseMeta();
        if (selectedTable) fetchTableRows(selectedTable);
      }
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = Math.min(commandHistory.length - 1, historyIndex + 1);
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const runQuickCommand = (cmd: string) => {
    setCommandInput(cmd);
    setTimeout(() => {
      handleCommandSubmit();
    }, 50);
  };

  const handleRunSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsSqlRunning(true);
    setSqlError(null);
    try {
      const res = await CareSetuAPI.runDatabaseQuery(sqlQuery);
      if (res && res.success) {
        setSqlResults(res.data);
      } else {
        setSqlError('Query failed or returned no results.');
      }
    } catch (err: any) {
      setSqlError(err.message || 'Error executing SQL');
    } finally {
      setIsSqlRunning(false);
    }
  };

  const handleResetDb = async () => {
    if (confirm('Are you sure you want to re-seed the SQLite database to factory reference fixtures?')) {
      const res = await CareSetuAPI.resetDatabase();
      if (res?.success) {
        addToast('Database Reset', 'SQLite database re-seeded with initial hospital fixtures', 'success');
        await refreshData();
        await loadDatabaseMeta();
        if (selectedTable) fetchTableRows(selectedTable);
        setTerminalLogs((prev) => [
          ...prev,
          {
            id: `cmd-${Date.now()}`,
            command: 'db:seed',
            output: 'Database successfully re-seeded with standard clinical reference fixtures.',
            success: true,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    }
  };

  const exportTableJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tableData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `caresetu_${selectedTable}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Data Exported', `Exported ${tableData.length} records from ${selectedTable}`, 'info');
  };

  // Filtered rows for explorer
  const filteredRows = tableData.filter((row) => {
    if (!tableSearch) return true;
    return JSON.stringify(row).toLowerCase().includes(tableSearch.toLowerCase());
  });

  return (
    <div className="editorial-page space-y-6 pb-12">
      {/* Top Banner */}
      <section className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8">
          <div className="eyebrow mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4F7A5F] shadow-[0_0_0_4px_rgba(82,122,94,0.15)] animate-pulse" />
            Core Infrastructure Console · DISHA Tier-1
          </div>
          <h2 className="display-heading-compact flex items-center gap-3">
            Admin Terminal & Database Orchestrator
          </h2>
          <p className="text-xs text-[#667085] mt-2 max-w-2xl">
            Direct operational CLI shell and SQLite database management console for Apex Metro Trauma Centre. Inspect clinical records, orchestrate surge capacity, and execute verified system commands.
          </p>
        </div>

        <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end">
          <button
            onClick={handleResetDb}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9DDE5] text-xs font-medium text-[#1C1C1E] bg-white hover:bg-[#FBFBF8] transition-subtle shadow-sm"
            title="Reset SQLite database with initial demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#243B80]" />
            Re-seed DB
          </button>
          <button
            onClick={triggerEmergencySurge}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-subtle shadow-sm ${
              isSurgeActive
                ? 'bg-[#A14D45]/10 border-[#A14D45]/40 text-[#A14D45]'
                : 'bg-white border-[#D9DDE5] text-[#1C1C1E] hover:bg-[#FBFBF8]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isSurgeActive ? 'text-[#A14D45]' : 'text-[#A16207]'}`} />
            {isSurgeActive ? 'Deactivate Surge' : 'Inject Surge'}
          </button>
        </div>
      </section>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#D9DDE5] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-subtle ${
              activeTab === 'terminal'
                ? 'bg-[#101827] text-white shadow-sm'
                : 'text-[#667085] hover:text-[#1C1C1E] hover:bg-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#38BDF8]" />
            Interactive CLI Terminal
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-subtle ${
              activeTab === 'database'
                ? 'bg-[#101827] text-white shadow-sm'
                : 'text-[#667085] hover:text-[#1C1C1E] hover:bg-white'
            }`}
          >
            <Database className="w-4 h-4 text-[#34D399]" />
            Live Database Explorer
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {dbTables.length} tables
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-subtle ${
              activeTab === 'sql'
                ? 'bg-[#101827] text-white shadow-sm'
                : 'text-[#667085] hover:text-[#1C1C1E] hover:bg-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-[#FBBF24]" />
            SQL Query Console
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-[#8B95A5]">
          <span>Engine: <strong className="text-[#1C1C1E]">node:sqlite WAL</strong></span>
          <span>·</span>
          <span>Host: <strong className="text-[#1C1C1E]">HOSP-IN-DEL-409</strong></span>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CLI TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="space-y-4">
          {/* Quick command bar */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-mono text-[#8B95A5] mr-1">Quick Commands:</span>
            {['status', 'health', 'db:stats', 'beds:list', 'docs:list', 'alerts:list', 'apts:list', 'audit:tail 5', 'help', 'clear'].map((qc) => (
              <button
                key={qc}
                onClick={() => runQuickCommand(qc)}
                className="px-2.5 py-1 rounded-md bg-white border border-[#D9DDE5] text-[#1C1C1E] font-mono text-[11px] hover:border-[#243B80] hover:text-[#243B80] transition-subtle shadow-2xs"
              >
                {qc}
              </button>
            ))}
          </div>

          {/* Terminal Window Container */}
          <div className="rounded-xl overflow-hidden shadow-2xl border border-[#334155] bg-[#0A0E17] text-[#E2E8F0]">
            {/* Window title bar */}
            <div className="h-10 bg-[#0F172A] border-b border-[#1E293B] px-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block opacity-85" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block opacity-85" />
                <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block opacity-85" />
                <span className="text-xs font-mono font-medium text-[#94A3B8] ml-2">
                  caresetu-adm@apex-metro:~ (SQLite 3.45 / WAL)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Connected
                </span>
                <span>User: {currentUser.name}</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed max-h-[580px] min-h-[420px] overflow-y-auto space-y-4">
              <div className="text-[#38BDF8] pb-2 border-b border-[#1E293B]">
                <p className="font-bold text-sm">CareSetu Clinical OS v2.4.0-PROD [Node.js v24 + SQLite Engine]</p>
                <p className="text-[#94A3B8] text-xs mt-0.5">Apex Metro General Hospital & Trauma Centre · Node HOSP-IN-DEL-409</p>
                <p className="text-[#64748B] text-[11px] mt-1">Type <span className="text-[#FBBF24]">help</span> or click quick actions to inspect beds, physicians, alerts, and database records.</p>
              </div>

              {terminalLogs.map((log) => (
                <div key={log.id} className="space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-[#94A3B8]">
                    <span className="text-[#10B981] font-semibold">caresetu-adm:~$</span>
                    <span className="text-white font-bold">{log.command}</span>
                    <span className="text-[10px] text-[#64748B] ml-auto">{log.timestamp}</span>
                  </div>
                  {log.output && (
                    <pre className={`p-3 rounded-md overflow-x-auto whitespace-pre-wrap leading-relaxed text-[12px] font-mono ${
                      log.success
                        ? 'bg-[#0F172A]/80 text-[#CBD5E1] border border-[#1E293B]'
                        : 'bg-[#450A0A]/40 text-[#FCA5A5] border border-[#7F1D1D]'
                    }`}>
                      {log.output}
                    </pre>
                  )}
                </div>
              ))}

              <div ref={terminalBottomRef} />
            </div>

            {/* Terminal Input Form */}
            <form onSubmit={handleCommandSubmit} className="p-3 bg-[#0F172A] border-t border-[#1E293B] flex items-center gap-2">
              <span className="text-[#10B981] font-mono font-bold text-xs pl-2 select-none">
                caresetu-adm:~$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command (e.g., status, beds:list, db:stats, audit:tail)..."
                disabled={isExecuting}
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-[#64748B]"
                autoFocus
              />
              <button
                type="submit"
                disabled={isExecuting || !commandInput.trim()}
                className="px-3 py-1.5 rounded bg-[#243B80] hover:bg-[#1D2E68] text-white text-xs font-mono font-medium disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Execute
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DATABASE EXPLORER */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Table list selector */}
            <div className="lg:col-span-3 space-y-2">
              <h3 className="text-xs font-bold text-[#8B95A5] uppercase tracking-wider px-1">
                Database Tables ({dbTables.length})
              </h3>
              <div className="space-y-1">
                {dbTables.map((tbl) => (
                  <button
                    key={tbl.name}
                    onClick={() => setSelectedTable(tbl.name)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-subtle ${
                      selectedTable === tbl.name
                        ? 'bg-[#101827] text-white font-semibold shadow-sm'
                        : 'bg-white border border-[#D9DDE5] text-[#1C1C1E] hover:bg-[#FBFBF8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TableIcon className={`w-3.5 h-3.5 ${selectedTable === tbl.name ? 'text-[#38BDF8]' : 'text-[#8B95A5]'}`} />
                      <span className="font-mono truncate">{tbl.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      selectedTable === tbl.name ? 'bg-white/20 text-white' : 'bg-[#F1F3F5] text-[#667085]'
                    }`}>
                      {tbl.rowCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table data preview */}
            <div className="lg:col-span-9 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#D9DDE5] shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#1C1C1E]">{selectedTable}</span>
                  <span className="text-xs text-[#8B95A5]">
                    ({filteredRows.length} of {tableData.length} records shown)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8B95A5] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="Filter records..."
                      className="pl-8 pr-3 py-1 text-xs rounded-md border border-[#D9DDE5] focus:outline-none focus:border-[#243B80] w-44"
                    />
                  </div>
                  <button
                    onClick={() => fetchTableRows(selectedTable)}
                    className="p-1.5 rounded-md border border-[#D9DDE5] text-[#667085] hover:text-[#1C1C1E] hover:bg-[#FBFBF8]"
                    title="Refresh table"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTable ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={exportTableJson}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#D9DDE5] text-xs font-medium text-[#1C1C1E] hover:bg-[#FBFBF8]"
                    title="Export table data as JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-[#243B80]" />
                    Export
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-[#D9DDE5] bg-white overflow-hidden shadow-2xs">
                {isLoadingTable ? (
                  <div className="p-12 text-center text-xs text-[#8B95A5] flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#243B80]" />
                    Querying SQLite table...
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#8B95A5]">
                    No records found for this table or filter criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#F8F9FA] border-b border-[#D9DDE5] sticky top-0 z-10 text-[#667085]">
                        <tr>
                          {Object.keys(filteredRows[0] || {}).map((col) => (
                            <th key={col} className="px-3.5 py-2.5 font-semibold text-[11px] whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {filteredRows.slice(0, 100).map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FBFBF8] transition-colors">
                            {Object.entries(row).map(([k, val]: [string, any], vIdx) => {
                              const rendered = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                              return (
                                <td key={vIdx} className="px-3.5 py-2 whitespace-nowrap text-[#1C1C1E] max-w-xs truncate" title={rendered}>
                                  {rendered}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SQL QUERY RUNNER */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="section-panel p-5 space-y-4 bg-white rounded-xl border border-[#D9DDE5] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1C1C1E] font-heading flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#243B80]" />
                  Direct SQLite Query Inspector
                </h3>
                <p className="text-xs text-[#667085]">
                  Execute read-only SELECT queries directly against the active SQLite database instance.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#8B95A5] px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#D9DDE5]">
                PRAGMA query_only = 1
              </span>
            </div>

            {/* Sample queries */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-mono text-[#8B95A5]">Presets:</span>
              {[
                { label: 'Available Beds', q: "SELECT id, bedNumber, ward, floor, oxygenEquipped FROM beds WHERE status = 'Available'" },
                { label: 'Ward Census Summary', q: "SELECT ward, count(*) as total, sum(case when status='Occupied' then 1 else 0 end) as occupied FROM beds GROUP BY ward" },
                { label: 'Critical Alerts', q: "SELECT id, level, title, sourceDepartment, timestamp FROM alerts WHERE level = 'CRITICAL'" },
                { label: 'On-Duty Doctors', q: "SELECT name, specialty, department, activePatients, fatigueIndex FROM doctors WHERE status = 'Available'" },
                { label: 'Recent Audit Logs', q: "SELECT timestamp, user, action, details FROM audit_logs ORDER BY id DESC LIMIT 10" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSqlQuery(preset.q)}
                  className="px-2.5 py-1 rounded bg-[#F8F9FA] border border-[#D9DDE5] text-[#1C1C1E] text-[11px] font-mono hover:border-[#243B80] hover:text-[#243B80] transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Query editor */}
            <div className="space-y-2">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={3}
                className="w-full p-3 font-mono text-xs rounded-lg border border-[#D9DDE5] bg-[#0A0E17] text-[#38BDF8] focus:outline-none focus:border-[#243B80] leading-relaxed"
                placeholder="SELECT * FROM beds LIMIT 10;"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8B95A5]">
                  Only SELECT and PRAGMA statements are permitted. Modifications must be dispatched through signed clinical endpoints.
                </span>
                <button
                  onClick={handleRunSql}
                  disabled={isSqlRunning || !sqlQuery.trim()}
                  className="px-4 py-2 rounded-lg bg-[#101827] hover:bg-[#1E293B] text-white text-xs font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSqlRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-[#34D399]" />}
                  Execute SQL Query
                </button>
              </div>
            </div>

            {/* Error display */}
            {sqlError && (
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs font-mono">
                {sqlError}
              </div>
            )}

            {/* SQL Results */}
            {sqlResults && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span>Query returned <strong>{sqlResults.length}</strong> record(s)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(JSON.stringify(sqlResults, null, 2));
                      addToast('JSON Copied', 'Query results copied to clipboard', 'info');
                    }}
                    className="flex items-center gap-1 text-[#243B80] hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    Copy JSON
                  </button>
                </div>

                {sqlResults.length > 0 ? (
                  <div className="rounded-lg border border-[#D9DDE5] overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#F8F9FA] border-b border-[#D9DDE5] sticky top-0 text-[#667085]">
                        <tr>
                          {Object.keys(sqlResults[0]).map((col) => (
                            <th key={col} className="px-3 py-2 font-semibold text-[11px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {sqlResults.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FBFBF8]">
                            {Object.values(row).map((val: any, vIdx) => (
                              <td key={vIdx} className="px-3 py-1.5 whitespace-nowrap text-[#1C1C1E]">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#8B95A5] border border-dashed border-[#D9DDE5] rounded-lg">
                    Query completed with 0 rows returned.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
