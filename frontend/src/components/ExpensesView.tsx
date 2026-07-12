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
    <div className="space-y-6">
      {/* Sub Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-1">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('fuel'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${activeTab === 'fuel' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Flame className="h-4 w-4" />
            Fuel Logs
          </button>
          <button
            onClick={() => { setActiveTab('expenses'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${activeTab === 'expenses' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Receipt className="h-4 w-4" />
            General Expenses
          </button>
          <button
            onClick={() => { setActiveTab('aggregator'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${activeTab === 'aggregator' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Calculator className="h-4 w-4" />
            Cost Aggregator
          </button>
        </div>

        {canManage ? (
          <div className="flex gap-2">
            {activeTab === 'fuel' && (
              <button
                onClick={handleOpenFuel}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Log Fuel Receipt
              </button>
            )}
            {activeTab === 'expenses' && (
              <button
                onClick={handleOpenExpense}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Register Expense
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
            <Info className="h-3.5 w-3.5" />
            Manager/Analyst-Only Expense Actions
          </span>
        )}
      </div>

      {/* SEARCH OR SEARCH PLACEHOLDER FOR AGGREGATOR */}
      {activeTab !== 'aggregator' && (
        <div className="relative max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'fuel' ? 'fuel logs' : 'operating expenses'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 bg-white"
          />
        </div>
      )}

      {/* FUEL LOGS TAB CONTENT */}
      {activeTab === 'fuel' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Receipt ID</th>
                  <th className="px-6 py-4">Vehicle Plate</th>
                  <th className="px-6 py-4">Refuel Date</th>
                  <th className="px-6 py-4 text-right">Liters Logged</th>
                  <th className="px-6 py-4 text-right">Odometer (km)</th>
                  <th className="px-6 py-4 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredFuel.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{log.id}</td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">{log.vehicleId}</td>
                    <td className="px-6 py-4">{log.date}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold">{log.liters} L</td>
                    <td className="px-6 py-4 text-right font-mono">{(log.odometer).toLocaleString()} km</td>
                    <td className="px-6 py-4 text-right font-mono font-extrabold text-slate-800">${(log.cost).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredFuel.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <Flame className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      No refuel receipts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSES TAB CONTENT */}
      {activeTab === 'expenses' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Expense ID</th>
                  <th className="px-6 py-4">Vehicle Plate</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Incurred Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Invoiced Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredExpenses.map((exp) => {
                  let catColor = 'bg-slate-100 text-slate-700';
                  if (exp.category === 'Toll') catColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                  if (exp.category === 'Permit') catColor = 'bg-purple-50 text-purple-700 border border-purple-100';
                  if (exp.category === 'Insurance') catColor = 'bg-cyan-50 text-cyan-700 border border-cyan-100';
                  if (exp.category === 'Fines') catColor = 'bg-rose-50 text-rose-700 border border-rose-100';

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{exp.id}</td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">{exp.vehicleId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${catColor}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{exp.date}</td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-sm">{exp.description}</td>
                      <td className="px-6 py-4 text-right font-mono font-extrabold text-slate-800">
                        ${(exp.cost).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      No expense logs registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AGGREGATOR TAB CONTENT */}
      {activeTab === 'aggregator' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-800 text-xs font-semibold leading-relaxed">
            <TrendingDown className="h-5 w-5 shrink-0 text-indigo-600" />
            <div>
              <p className="font-bold text-indigo-900">Aggregate Operational Cost computation</p>
              <p className="font-medium mt-0.5 opacity-90">
                Operational cost represents the combined sum of logged Refueling + In-Shop Workshop Overhauls + Miscellaneous Tolls/Permits/Fees associated with each distinct plate registry.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Vehicle Plate</th>
                    <th className="px-6 py-4">Name / Model</th>
                    <th className="px-6 py-4 text-right">Fuel Expenses</th>
                    <th className="px-6 py-4 text-right">Maintenance Workshop</th>
                    <th className="px-6 py-4 text-right">Tolls & Permits</th>
                    <th className="px-6 py-4 text-right bg-slate-50 border-l border-slate-200 font-extrabold text-indigo-700">Total Operational Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {aggregatedCosts.map((agg) => (
                    <tr key={agg.registrationNumber} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">{agg.registrationNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{agg.name}</td>
                      <td className="px-6 py-4 text-right font-mono">${(agg.fuelCost).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono">${(agg.maintCost).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono">${(agg.otherCost).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right bg-indigo-50/20 border-l border-slate-200 font-mono font-black text-slate-900">
                        ${(agg.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
