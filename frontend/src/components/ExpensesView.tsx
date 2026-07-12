import React, { useState } from 'react';
import { FuelLog, Expense, Vehicle, MaintenanceLog } from '../types';
import { 
  Plus, 
  Search, 
  Flame, 
  Receipt, 
  Calculator, 
  ShieldAlert, 
  TrendingDown,
  X,
  Sparkles,
  DollarSign,
  Gauge,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpensesViewProps {
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceLogs: MaintenanceLog[];
  vehicles: Vehicle[];
  onAddFuelLog: (log: FuelLog) => void;
  onAddExpense: (exp: Expense) => void;
  userRole: string;
}

export default function ExpensesView({
  fuelLogs,
  expenses,
  maintenanceLogs,
  vehicles,
  onAddFuelLog,
  onAddExpense,
  userRole
}: ExpensesViewProps) {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses' | 'aggregator'>('fuel');
  const [searchTerm, setSearchTerm] = useState('');

  // Fuel Form states
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState<number>(50);
  const [fuelCost, setFuelCost] = useState<number>(75);
  const [fuelDate, setFuelDate] = useState('2026-07-11');
  const [fuelOdometer, setFuelOdometer] = useState<number>(0);
  const [fuelError, setFuelError] = useState('');

  // Expense Form states
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expCategory, setExpCategory] = useState<'Toll' | 'Permit' | 'Insurance' | 'Fines' | 'Other'>('Toll');
  const [expCost, setExpCost] = useState<number>(25);
  const [expDate, setExpDate] = useState('2026-07-11');
  const [expDesc, setExpDesc] = useState('');
  const [expError, setExpError] = useState('');

  const handleOpenFuel = () => {
    setFuelError('');
    setFuelLiters(50);
    setFuelCost(75);
    setFuelDate('2026-07-11');
    if (vehicles.length > 0) {
      setFuelVehicleId(vehicles[0].registrationNumber);
      setFuelOdometer(vehicles[0].odometer);
    } else {
      setFuelVehicleId('');
      setFuelOdometer(0);
    }
    setIsFuelOpen(true);
  };

  const handleOpenExpense = () => {
    setExpError('');
    setExpCost(25);
    setExpDate('2026-07-11');
    setExpDesc('');
    if (vehicles.length > 0) {
      setExpVehicleId(vehicles[0].registrationNumber);
    } else {
      setExpVehicleId('');
    }
    setIsExpenseOpen(true);
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFuelError('');

    if (!fuelVehicleId) {
      setFuelError('Vehicle is required.');
      return;
    }
    if (fuelLiters <= 0) {
      setFuelError('Liters must be greater than zero.');
      return;
    }
    if (fuelCost <= 0) {
      setFuelError('Cost must be greater than zero.');
      return;
    }
    if (fuelOdometer < 0) {
      setFuelError('Odometer cannot be negative.');
      return;
    }

    const newLog: FuelLog = {
      id: `FUEL-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: fuelVehicleId,
      date: fuelDate,
      liters: fuelLiters,
      cost: fuelCost,
      odometer: fuelOdometer
    };

    onAddFuelLog(newLog);
    setIsFuelOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');

    if (!expVehicleId) {
      setExpError('Vehicle is required.');
      return;
    }
    if (expCost <= 0) {
      setExpError('Cost must be greater than zero.');
      return;
    }
    if (!expDesc.trim()) {
      setExpError('Description is required.');
      return;
    }

    const newExp: Expense = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: expVehicleId,
      date: expDate,
      category: expCategory,
      cost: expCost,
      description: expDesc.trim()
    };

    onAddExpense(newExp);
    setIsExpenseOpen(false);
  };

  // Cost Aggregations (Fuel + Maintenance + Expenses) per vehicle
  const aggregatedCosts = vehicles.map(vehicle => {
    const vFuelCost = fuelLogs
      .filter(f => f.vehicleId === vehicle.registrationNumber)
      .reduce((sum, f) => sum + f.cost, 0);

    const vMaintCost = maintenanceLogs
      .filter(m => m.vehicleId === vehicle.registrationNumber)
      .reduce((sum, m) => sum + m.cost, 0);

    const vOtherExpenses = expenses
      .filter(e => e.vehicleId === vehicle.registrationNumber)
      .reduce((sum, e) => sum + e.cost, 0);

    const totalOperationalCost = vFuelCost + vMaintCost + vOtherExpenses;

    return {
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      fuelCost: vFuelCost,
      maintCost: vMaintCost,
      otherCost: vOtherExpenses,
      total: totalOperationalCost
    };
  });

  const canManage = userRole === 'FleetManager' || userRole === 'FinancialAnalyst';

  // Filters
  const filteredFuel = fuelLogs.filter(f => 
    f.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpenses = expenses.filter(e => 
    e.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      {/* Top row: search + actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleOpenFuel} className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-md font-semibold">+ Log Fuel</button>
          <button onClick={handleOpenExpense} className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-md font-semibold">+ Add Expense</button>
        </div>
      </div>

      {/* Fuel Logs table */}
      <div className="mb-8">
        <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Fuel Logs</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Liters</th>
                  <th className="px-6 py-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuel.map(f => (
                  <tr key={f.id} className="border-b border-zinc-800">
                    <td className="px-6 py-3 font-mono text-zinc-200">{f.vehicleId}</td>
                    <td className="px-6 py-3 text-zinc-400">{f.date}</td>
                    <td className="px-6 py-3 text-right font-mono">{f.liters} L</td>
                    <td className="px-6 py-3 text-right font-mono text-zinc-200">${f.cost.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredFuel.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">No fuel logs</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Other Expenses table */}
      <div className="mb-6">
        <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Other Expenses (Toll / Misc)</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <th className="px-6 py-3">Trip</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Toll</th>
                  <th className="px-6 py-3">Other</th>
                  <th className="px-6 py-3">Maint. (Linked)</th>
                  <th className="px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="border-b border-zinc-800">
                    <td className="px-6 py-3 font-mono text-zinc-200">{e.id}</td>
                    <td className="px-6 py-3 text-zinc-300">{e.vehicleId}</td>
                    <td className="px-6 py-3">{e.category === 'Toll' ? e.cost : 0}</td>
                    <td className="px-6 py-3">{e.category === 'Other' ? e.cost : 0}</td>
                    <td className="px-6 py-3">{maintenanceLogs.filter(m=>m.vehicleId===e.vehicleId).reduce((s,m)=>s+m.cost,0)}</td>
                    <td className="px-6 py-3">${e.cost.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">No other expenses</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center">
        <div className="text-sm text-amber-400 font-bold">{aggregatedCosts.reduce((s,a)=>s+a.total,0).toLocaleString()}</div>
      </div>

      {/* Modals (restyled dark) */}

      {/* FUEL DIALOG */}
      <AnimatePresence>
        {isFuelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Flame className="h-4 w-4 text-indigo-500" />
                  Log Fuel Receipt Ticket
                </h3>
                <button
                  onClick={() => setIsFuelOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleFuelSubmit}>
                <div className="p-6 space-y-4">
                  {fuelError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{fuelError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Vehicle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Select Vehicle
                      </label>
                      <select
                        value={fuelVehicleId}
                        onChange={(e) => {
                          setFuelVehicleId(e.target.value);
                          const matchingV = vehicles.find(v => v.registrationNumber === e.target.value);
                          if (matchingV) setFuelOdometer(matchingV.odometer);
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.registrationNumber} value={v.registrationNumber}>
                            {v.name} ({v.registrationNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Liters */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Liters Logged
                        </label>
                        <input
                          type="number"
                          value={fuelLiters}
                          onChange={(e) => setFuelLiters(parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      {/* Cost */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Total Cost
                        </label>
                        <input
                          type="number"
                          value={fuelCost}
                          onChange={(e) => setFuelCost(parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Refuel Date
                        </label>
                        <input
                          type="date"
                          value={fuelDate}
                          onChange={(e) => setFuelDate(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      {/* Odometer */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5 text-slate-400" /> Odometer (km)
                        </label>
                        <input
                          type="number"
                          value={fuelOdometer}
                          onChange={(e) => setFuelOdometer(parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFuelOpen(false)}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Submit Fuel Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPENSE DIALOG */}
      <AnimatePresence>
        {isExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-indigo-500" />
                  Log Miscellaneous Operating Expense
                </h3>
                <button
                  onClick={() => setIsExpenseOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleExpenseSubmit}>
                <div className="p-6 space-y-4">
                  {expError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{expError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Vehicle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Select Vehicle
                      </label>
                      <select
                        value={expVehicleId}
                        onChange={(e) => setExpVehicleId(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.registrationNumber} value={v.registrationNumber}>
                            {v.name} ({v.registrationNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Category
                        </label>
                        <select
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                        >
                          <option value="Toll">Toll Fee</option>
                          <option value="Permit">Regulatory Permit</option>
                          <option value="Insurance">Asset Insurance</option>
                          <option value="Fines">Compliance Fine</option>
                          <option value="Other">Other Miscellaneous</option>
                        </select>
                      </div>

                      {/* Cost */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Cost (USD)
                        </label>
                        <input
                          type="number"
                          value={expCost}
                          onChange={(e) => setExpCost(parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Incurred Date
                      </label>
                      <input
                        type="date"
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Invoice Description
                      </label>
                      <input
                        type="text"
                        value={expDesc}
                        onChange={(e) => setExpDesc(e.target.value)}
                        placeholder="e.g., Highway transit toll fee for load 2"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsExpenseOpen(false)}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Register Operational Cost
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
