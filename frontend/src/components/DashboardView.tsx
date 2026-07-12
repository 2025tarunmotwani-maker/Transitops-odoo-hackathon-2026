import React, { useState } from 'react';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '../types';
import { 
  Truck, 
  CheckCircle2, 
  Wrench, 
  Navigation, 
  Clock, 
  Users, 
  Percent, 
  DollarSign, 
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}

export default function DashboardView({
  vehicles,
  drivers,
  trips,
  maintenanceLogs,
  fuelLogs,
  expenses
}: DashboardViewProps) {
  // Filter States
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Available unique fields for filters
  const vehicleTypes = ['All', 'Semi-Truck', 'Heavy Duty', 'Delivery Van', 'EV Cargo', 'Support Sedan'];
  const vehicleStatuses = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];
  const regions = ['All', 'North', 'South', 'East', 'West'];

  // Apply filters to vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchType = selectedType === 'All' || v.type === selectedType;
    const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
    const matchRegion = selectedRegion === 'All' || v.region === selectedRegion;
    return matchType && matchStatus && matchRegion;
  });

  const resetFilters = () => {
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedRegion('All');
  };

  // KPIs calculations based on filtered set
  const totalVehicles = filteredVehicles.length;
  const activeVehicles = filteredVehicles.filter(v => v.status === 'On Trip').length;
  const availableVehicles = filteredVehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehicles = filteredVehicles.filter(v => v.status === 'In Shop').length;
  const retiredVehicles = filteredVehicles.filter(v => v.status === 'Retired').length;

  // Trips & Drivers (associated with filtered vehicles if matching)
  const filteredVehicleIds = new Set(filteredVehicles.map(v => v.registrationNumber));
  
  const relevantTrips = trips.filter(t => filteredVehicleIds.has(t.vehicleId));
  const activeTripsCount = relevantTrips.filter(t => t.status === 'Dispatched').length;
  const pendingTripsCount = relevantTrips.filter(t => t.status === 'Draft').length;

  const relevantDrivers = drivers.filter(d => {
    // Find driver of any active trip involving filtered vehicles
    if (d.status === 'On Trip') {
      const activeTrip = trips.find(t => t.driverId === d.licenseNumber && t.status === 'Dispatched');
      if (activeTrip) {
        return filteredVehicleIds.has(activeTrip.vehicleId);
      }
    }
    return true; // Simple driver count
  });

  const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;

  // Fleet Utilization = (Active Vehicles / Total Vehicles) * 100
  const totalActiveCap = vehicles.filter(v => v.status !== 'Retired').length;
  const activeCapVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const fleetUtilization = totalActiveCap > 0 ? Math.round((activeCapVehicles / totalActiveCap) * 100) : 0;

  // Financial summary
  const totalRevenue = trips
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + (t.revenue || 0), 0);

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalMaintCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalOtherExpense = expenses.reduce((sum, e) => sum + e.cost, 0);
  const totalExpenses = totalFuelCost + totalMaintCost + totalOtherExpense;

  // Chart data calculations: Operational Cost per region
  const regionCosts = { North: 0, South: 0, East: 0, West: 0 };
  vehicles.forEach(v => {
    const vFuel = fuelLogs.filter(f => f.vehicleId === v.registrationNumber).reduce((s, f) => s + f.cost, 0);
    const vMaint = maintenanceLogs.filter(m => m.vehicleId === v.registrationNumber).reduce((s, m) => s + m.cost, 0);
    const vExp = expenses.filter(e => e.vehicleId === v.registrationNumber).reduce((s, e) => s + e.cost, 0);
    regionCosts[v.region] += vFuel + vMaint + vExp;
  });

  const regionCostData = Object.entries(regionCosts).map(([name, cost]) => ({ name, cost }));
  const maxRegionCost = Math.max(...regionCostData.map(d => d.cost), 100);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-zinc-400" />
          <h2 className="text-base font-display font-medium text-zinc-100">Operational Filters</h2>
          {(selectedType !== 'All' || selectedStatus !== 'All' || selectedRegion !== 'All') && (
            <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-zinc-700">
              Active Filters
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:border-zinc-700 focus:ring-0"
            >
              {vehicleTypes.map(t => (
                <option key={t} value={t}>Type: {t}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:border-zinc-700 focus:ring-0"
            >
              {vehicleStatuses.map(s => (
                <option key={s} value={s}>Status: {s}</option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:border-zinc-700 focus:ring-0"
            >
              {regions.map(r => (
                <option key={r} value={r}>Region: {r}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-1.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-xl">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Active Vehicles</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">{activeVehicles}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">On delivery routes</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Available Fleet</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">{availableVehicles}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Ready for dispatch</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-amber-400 border border-zinc-800 rounded-xl">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">In Maintenance</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">{maintenanceVehicles}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">In the garage workshop</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-xl">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Fleet Utilization</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">{fleetUtilization}%</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Active / Non-retired</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-xl">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Active Trips</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">{activeTripsCount}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Currently transit</p>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Pending Trips</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">{pendingTripsCount}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Draft status dispatches</p>
          </div>
        </div>

        {/* Metric 7 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-cyan-400 border border-zinc-800 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Drivers Available</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">{driversOnDuty}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Available & On Trip</p>
          </div>
        </div>

        {/* Metric 8 */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-zinc-950 text-rose-400 border border-zinc-800 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Net Profitability</p>
            <h3 className="text-xl font-display font-medium text-zinc-100 mt-1">
              ${(totalRevenue - totalExpenses).toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Rev - Operational Costs</p>
          </div>
        </div>
      </div>

      {/* Analytics & Custom Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Graph 1: Cost Distribution by Region */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-display font-medium text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              Regional Expenses Breakdown
            </h3>
            <span className="text-xs text-zinc-500 font-mono">Max: ${maxRegionCost.toLocaleString()}</span>
          </div>

          <div className="space-y-4 pt-2">
            {regionCostData.map((region, idx) => {
              const pct = (region.cost / maxRegionCost) * 100;
              return (
                <div key={region.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      {region.name} Region
                    </span>
                    <span className="font-semibold text-zinc-200">${region.cost.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-850">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="bg-zinc-100 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-3 text-center text-xs">
            <div>
              <p className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Total Revenue</p>
              <p className="text-base font-display font-bold text-emerald-400 mt-0.5">${totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Total Cost</p>
              <p className="text-base font-display font-bold text-rose-400 mt-0.5">${totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Total Fleet</p>
              <p className="text-base font-display font-bold text-zinc-300 mt-0.5">{totalVehicles} registered</p>
            </div>
          </div>
        </div>

        {/* Custom Visual: Fleet Type Mix (Concentric Stacked Donut / List Representation) */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-xs">
          <h3 className="text-sm font-display font-medium text-zinc-100 uppercase tracking-wider mb-4">
            Fleet Composition
          </h3>
          <div className="flex flex-col items-center justify-center h-48">
            {/* Visual SVG representing fleet composition */}
            <svg className="w-32 h-32" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              
              {/* Calculate status shares */}
              {(() => {
                const total = totalVehicles || 1;
                const stroke1 = (availableVehicles / total) * 100;
                const stroke2 = (activeVehicles / total) * 100;
                const stroke3 = (maintenanceVehicles / total) * 100;
                const stroke4 = (retiredVehicles / total) * 100;

                return (
                  <>
                    {/* Available (Green) */}
                    <circle 
                       cx="18" cy="18" r="15.915" fill="none" 
                       stroke="#10b981" strokeWidth="3" 
                       strokeDasharray={`${stroke1} ${100 - stroke1}`} 
                       strokeDashoffset="25" 
                    />
                    {/* Active On Trip (Blue) */}
                    <circle 
                       cx="18" cy="18" r="15.915" fill="none" 
                       stroke="#3b82f6" strokeWidth="3" 
                       strokeDasharray={`${stroke2} ${100 - stroke2}`} 
                       strokeDashoffset={25 - stroke1} 
                    />
                    {/* In Shop (Amber) */}
                    <circle 
                       cx="18" cy="18" r="15.915" fill="none" 
                       stroke="#f59e0b" strokeWidth="3" 
                       strokeDasharray={`${stroke3} ${100 - stroke3}`} 
                       strokeDashoffset={25 - stroke1 - stroke2} 
                    />
                    {/* Retired (Gray) */}
                    <circle 
                       cx="18" cy="18" r="15.915" fill="none" 
                       stroke="#71717a" strokeWidth="3" 
                       strokeDasharray={`${stroke4} ${100 - stroke4}`} 
                       strokeDashoffset={25 - stroke1 - stroke2 - stroke3} 
                    />
                  </>
                );
              })()}
              
              <g className="translate-y-[2px]">
                <text x="18" y="16" className="text-[5px] font-extrabold fill-zinc-100 text-center" textAnchor="middle">
                  {totalVehicles}
                </text>
                <text x="18" y="21" className="text-[2.5px] font-bold fill-zinc-500 text-center uppercase tracking-widest" textAnchor="middle">
                  Vehicles
                </text>
              </g>
            </svg>
          </div>

          <div className="space-y-2 mt-4 border-t border-zinc-800 pt-4 text-xs font-medium text-zinc-400">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Available Vehicles
              </span>
              <span className="font-semibold text-zinc-200">{availableVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                On Trip Route
              </span>
              <span className="font-semibold text-zinc-200">{activeVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Maintenance Garage
              </span>
              <span className="font-semibold text-zinc-200">{maintenanceVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-zinc-500 rounded-full" />
                Retired
              </span>
              <span className="font-semibold text-zinc-200">{retiredVehicles}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
