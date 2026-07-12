import React, { useState } from 'react';
import { MaintenanceLog, Vehicle } from '../types';
import { 
  Plus, 
  Search, 
  Wrench, 
  CheckCircle2, 
  ShieldAlert, 
  Calendar,
  X,
  Sparkles,
  Play,
  FileText,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MaintenanceViewProps {
  maintenanceLogs: MaintenanceLog[];
  vehicles: Vehicle[];
  onCreateLog: (log: MaintenanceLog) => void;
  onCloseLog: (logId: string, endDate: string, cost: number, notes: string) => void;
  userRole: string;
}

export default function MaintenanceView({
  maintenanceLogs,
  vehicles,
  onCreateLog,
  onCloseLog,
  userRole
}: MaintenanceViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');

  // Form states - Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState<number>(150);
  const [startDate, setStartDate] = useState('2026-07-11');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Form states - Close
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closingLogId, setClosingLogId] = useState('');
  const [closingEndDate, setClosingEndDate] = useState('2026-07-11');
  const [closingCost, setClosingCost] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [closeError, setCloseError] = useState('');

  // Vehicles eligible to be put into maintenance (not retired, and not already on trip unless forcing)
  const eligibleVehicles = vehicles.filter(v => v.status !== 'Retired');

  const handleOpenCreate = () => {
    setError('');
    setIssue('');
    setCost(150);
    setStartDate('2026-07-11');
    setNotes('');
    
    if (eligibleVehicles.length > 0) setSelectedVehicleId(eligibleVehicles[0].registrationNumber);
    else setSelectedVehicleId('');
    
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedVehicleId) {
      setError('Please select a vehicle.');
      return;
    }
    if (!issue.trim()) {
      setError('Please describe the mechanical issue.');
      return;
    }
    if (cost < 0) {
      setError('Cost cannot be negative.');
      return;
    }

    const newLog: MaintenanceLog = {
      id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: selectedVehicleId,
      issue: issue.trim(),
      cost,
      status: 'Open',
      startDate,
      notes: notes.trim()
    };

    onCreateLog(newLog);
    setIsCreateOpen(false);
  };

  const handleOpenClose = (log: MaintenanceLog) => {
    setCloseError('');
    setClosingLogId(log.id);
    setClosingEndDate('2026-07-11');
    setClosingCost(log.cost);
    setClosingNotes(log.notes || '');
    setIsCloseOpen(true);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCloseError('');

    if (!closingEndDate) {
      setCloseError('End date is required.');
      return;
    }
    if (closingCost < 0) {
      setCloseError('Cost cannot be negative.');
      return;
    }

    onCloseLog(closingLogId, closingEndDate, closingCost, closingNotes);
    setIsCloseOpen(false);
  };

  const filteredLogs = maintenanceLogs.filter(log => {
    const vObj = vehicles.find(v => v.registrationNumber === log.vehicleId);
    const matchesSearch = log.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (vObj && vObj.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canManage = userRole === 'FleetManager';

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
          <input
            type="text"
            placeholder="Search logs by vehicle, issue or tech notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Maintenance States</option>
            <option value="Open">Active Workshop (Open)</option>
            <option value="Closed">Closed & Completed</option>
          </select>

          {canManage ? (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              File Shop Entry
            </button>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5" />
              Manager-Only Workshop Control
            </span>
          )}
        </div>
      </div>

      {/* Grid representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLogs.map((log) => {
          const vObj = vehicles.find(v => v.registrationNumber === log.vehicleId);
          const isOpen = log.status === 'Open';

          return (
            <motion.div
              layout
              key={log.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-250 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-sm">
                      {log.id}
                    </span>
                    <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm">
                      {log.vehicleId}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 truncate max-w-[170px]" title={vObj?.name}>
                    {vObj?.name || 'Unknown Vehicle'}
                  </h4>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${isOpen ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                  {isOpen ? 'In Repair' : 'Completed'}
                </span>
              </div>

              {/* Specs body */}
              <div className="p-5 space-y-4 flex-1 text-xs font-medium text-slate-600">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">Reported Issue</span>
                  <p className="text-slate-800 font-bold text-xs">{log.issue}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Start Date
                    </span>
                    <p className="text-slate-700 font-bold mt-0.5">{log.startDate}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> End Date
                    </span>
                    <p className="text-slate-700 font-bold mt-0.5">{log.endDate || 'Active Shop'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400" /> Diagnostic Notes
                  </span>
                  <p className="text-slate-600 text-xs italic bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    {log.notes || 'No notes on file.'}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">Repair Invoiced</span>
                  <span className="text-base font-extrabold text-slate-800 font-mono">
                    ${(log.cost).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              {canManage && isOpen && (
                <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-end text-xs">
                  <button
                    onClick={() => handleOpenClose(log)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Repairs</span>
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <Wrench className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">No maintenance logs found</p>
            <p className="text-slate-400 text-xs mt-1">Try relaxing search parameters or filters.</p>
          </div>
        )}
      </div>

      {/* CREATE MAINTENANCE DIALOG */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-indigo-500" />
                  File Mechanic Entry
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Vehicle Selection */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Select Vehicle
                      </label>
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                      >
                        <option value="">-- Select Active Vehicle --</option>
                        {eligibleVehicles.map(v => (
                          <option key={v.registrationNumber} value={v.registrationNumber}>
                            {v.name} ({v.registrationNumber}) - Current: {v.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Issue Description */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Mechanical Issue & Repairs Needed
                      </label>
                      <input
                        type="text"
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                        placeholder="e.g., Replace front brake pads and rotors"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Initial Cost Estimate */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Cost Estimate (USD)
                      </label>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Workshop Entry Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Tech Notes */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Pre-Diagnostics & Tech Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add diagnostics, assigned mechanic, or priority instructions here..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Log Mechanic Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLOSE MAINTENANCE DIALOG */}
      <AnimatePresence>
        {isCloseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Close Repairs & Restore Status
                </h3>
                <button
                  onClick={() => setIsCloseOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCloseSubmit}>
                <div className="p-6 space-y-4">
                  {closeError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{closeError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* End Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Release Date
                      </label>
                      <input
                        type="date"
                        value={closingEndDate}
                        onChange={(e) => setClosingEndDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Final Cost */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Final Repair Cost (USD)
                      </label>
                      <input
                        type="number"
                        value={closingCost}
                        onChange={(e) => setClosingCost(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Diagnostic Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Closing Mechanic Notes
                      </label>
                      <textarea
                        value={closingNotes}
                        onChange={(e) => setClosingNotes(e.target.value)}
                        placeholder="Detail resolving procedures, mechanic comments, or parts replaced..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCloseOpen(false)}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Certify & Restore Fleet Status
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
