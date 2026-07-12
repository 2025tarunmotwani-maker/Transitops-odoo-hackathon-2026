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
  Info,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PrimaryButton from './shared/PrimaryButton';
import Badge from './shared/Badge';

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

  // Get vehicle statuses for display
  const getVehicleStatus = (vehicleId: string) => {
    const vObj = vehicles.find(v => v.registrationNumber === vehicleId);
    return vObj?.status || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 tp-card p-4 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
          <input
            type="text"
            placeholder="Search maintenance logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tp-search pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Maintenance States</option>
            <option value="Open">Active Workshop (Open)</option>
            <option value="Closed">Closed & Completed</option>
          </select>

          {canManage && (
            <PrimaryButton onClick={handleOpenCreate} className="flex items-center gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              File Shop Entry
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Two Column Layout: Form + Service Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Maintenance Form */}
        {canManage && (
          <div className="lg:col-span-1">
            <div className="tp-card rounded-xl shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="h-4 w-4 text-indigo-500" />
                Vehicle Record
              </h3>

              {/* Quick Status Indicators */}
              <div className="space-y-2 pb-4 border-b border-slate-200">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Fleet Status</label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-bold">
                    Available
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-bold">
                    In Shop
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-200">
                  Scheduled service is dispatcher-controlled only.
                </div>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Vehicle</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                  onClick={() => handleOpenCreate()}
                >
                  <option>Select vehicle...</option>
                  {eligibleVehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.name} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Issue</label>
                <input
                  type="text"
                  placeholder="e.g., Oil Change"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  onClick={() => handleOpenCreate()}
                />
              </div>

              {/* Cost Estimate */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Cost (USD)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  onClick={() => handleOpenCreate()}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Date</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  onClick={() => handleOpenCreate()}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Notes</label>
                <textarea
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  onClick={() => handleOpenCreate()}
                />
              </div>

              <PrimaryButton className="w-full text-xs justify-center" onClick={handleOpenCreate}>
                <Plus className="h-3.5 w-3.5" />
                Submit
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* RIGHT: Service Log Table */}
        <div className={canManage ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="tp-card rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="h-4 w-4 text-indigo-500" />
                Service Log
              </h3>
              <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                {filteredLogs.length} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Service #</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Vehicle ID</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Vendor / Service</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-600 uppercase text-xs tracking-wide">Cost</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase text-xs tracking-wide">Status</th>
                    {canManage && <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase text-xs tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((log) => {
                    const vObj = vehicles.find(v => v.registrationNumber === log.vehicleId);
                    let statusVariant: 'available' | 'ontrip' | 'offduty' | 'suspended' | 'default' = 'default';
                    
                    if (log.status === 'Open') statusVariant = 'ontrip';
                    if (log.status === 'Closed') statusVariant = 'available';

                    return (
                      <motion.tr
                        key={log.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-4 font-mono font-bold text-slate-800 text-sm">{log.id}</td>
                        <td className="px-4 py-4 font-bold text-slate-800">{log.vehicleId}</td>
                        <td className="px-4 py-4">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-800">{vObj?.name || 'Unknown'}</div>
                            <div className="text-[10px] text-slate-500">{log.issue}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-mono font-bold text-slate-800">${(log.cost).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={statusVariant}>
                            {log.status === 'Open' ? 'In Shop' : 'Completed'}
                          </Badge>
                        </td>
                        {canManage && (
                          <td className="px-4 py-4 text-center">
                            {log.status === 'Open' && (
                              <button
                                onClick={() => handleOpenClose(log)}
                                className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                title="Complete Repairs"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                            {log.status === 'Closed' && (
                              <span className="text-[10px] text-slate-400 font-semibold">Archived</span>
                            )}
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={canManage ? 6 : 5} className="text-center py-8">
                        <Wrench className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 font-bold">No maintenance logs found</p>
                        <p className="text-slate-400 text-xs mt-1">File a new shop entry to get started.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
