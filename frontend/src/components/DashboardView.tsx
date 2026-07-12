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
      {/* Top header + search */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-zinc-100">Dashboard</h1>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search..."
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-zinc-400" />
          <div className="text-sm font-medium text-zinc-300">Filters</div>
        </div>

        <div className="flex gap-3 ml-4 flex-wrap">
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 text-sm">
            {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 text-sm">
            {vehicleStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 text-sm">
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={resetFilters} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-300">Reset</button>
        </div>
      </div>

      {/* Big KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Active Vehicles</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-4xl font-display font-bold text-zinc-100">{activeVehicles}</h2>
            <Truck className="h-8 w-8 text-amber-300" />
          </div>
          <p className="text-sm text-zinc-500 mt-2">On delivery routes</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Available Vehicles</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-4xl font-display font-bold text-zinc-100">{availableVehicles}</h2>
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-sm text-zinc-500 mt-2">Ready for dispatch</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Active Trips</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-4xl font-display font-bold text-zinc-100">{activeTripsCount}</h2>
            <Navigation className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="text-sm text-zinc-500 mt-2">Currently transit</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Fleet Utilization</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-4xl font-display font-bold text-zinc-100">{fleetUtilization}%</h2>
            <Percent className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="text-sm text-zinc-500 mt-2">Active / Non-retired</p>
        </div>
      </div>

      {/* Main content: Recent trips + Status panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
          <h3 className="text-sm font-display font-semibold text-zinc-100 mb-4">Recent Trips</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="py-2">Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                {trips.slice(0,6).map(t => (
                  <tr key={t.id} className="border-t border-zinc-800">
                    <td className="py-3 font-mono">{t.id}</td>
                    <td>{t.vehicleId || '—'}</td>
                    <td>{drivers.find(d => d.licenseNumber === t.driverId)?.name || '—'}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status==='Dispatched' ? 'bg-blue-600 text-white' : t.status==='Completed' ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-200'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{t.plannedDistance ? `${Math.round(t.plannedDistance/20)} min` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
          <h3 className="text-sm font-display font-semibold text-zinc-100 mb-4">Vehicle Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Available</span>
                <span className="font-semibold text-zinc-200">{availableVehicles}</span>
              </div>
              <div className="w-full bg-zinc-950 h-3 rounded-full border border-zinc-850 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${totalVehicles? (availableVehicles/totalVehicles)*100:0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>On Trip</span>
                <span className="font-semibold text-zinc-200">{activeVehicles}</span>
              </div>
              <div className="w-full bg-zinc-950 h-3 rounded-full border border-zinc-850 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${totalVehicles? (activeVehicles/totalVehicles)*100:0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>In Shop</span>
                <span className="font-semibold text-zinc-200">{maintenanceVehicles}</span>
              </div>
              <div className="w-full bg-zinc-950 h-3 rounded-full border border-zinc-850 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${totalVehicles? (maintenanceVehicles/totalVehicles)*100:0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Retired</span>
                <span className="font-semibold text-zinc-200">{retiredVehicles}</span>
              </div>
              <div className="w-full bg-zinc-950 h-3 rounded-full border border-zinc-850 overflow-hidden">
                <div className="h-full bg-zinc-500" style={{ width: `${totalVehicles? (retiredVehicles/totalVehicles)*100:0}%` }} />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Total Revenue</span>
                <span className="font-bold text-emerald-400">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
