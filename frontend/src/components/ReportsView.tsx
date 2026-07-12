import React from 'react';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  Flame, 
  Compass, 
  CircleDollarSign,
  Award,
  Download,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}

export default function ReportsView({
  vehicles,
  drivers,
  trips,
  maintenanceLogs,
  fuelLogs,
  expenses
}: ReportsViewProps) {

  // Calculate detailed stats per vehicle
  const vehicleReports = vehicles.map(vehicle => {
    const regNum = vehicle.registrationNumber;

    // Completed Trips for this vehicle
    const completedTrips = trips.filter(t => t.vehicleId === regNum && t.status === 'Completed');
    const totalDistance = completedTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const totalRevenue = completedTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);

    // Fuel consumed
    const totalFuelLiters = fuelLogs
      .filter(f => f.vehicleId === regNum)
      .reduce((sum, f) => sum + f.liters, 0);
    
    const totalFuelCost = fuelLogs
      .filter(f => f.vehicleId === regNum)
      .reduce((sum, f) => sum + f.cost, 0);

    // Fuel Efficiency (km/L)
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters) : 0;

    // Maintenance Costs
    const totalMaintCost = maintenanceLogs
      .filter(m => m.vehicleId === regNum)
      .reduce((sum, m) => sum + m.cost, 0);

    // Other Expenses
    const totalOtherCost = expenses
      .filter(e => e.vehicleId === regNum)
      .reduce((sum, e) => sum + e.cost, 0);

    // Total Operational Cost (Fuel + Maintenance + Expenses)
    const totalOperationalCost = totalFuelCost + totalMaintCost + totalOtherCost;

    // Vehicle ROI: (Revenue - (Maintenance + Fuel)) / AcquisitionCost
    // Let's multiply by 100 to get a percentage
    const acquisition = vehicle.acquisitionCost || 1; // avoid division by zero
    const roi = ((totalRevenue - (totalMaintCost + totalFuelCost)) / acquisition) * 100;

    return {
      regNum,
      name: vehicle.name,
      type: vehicle.type,
      distance: totalDistance,
      revenue: totalRevenue,
      liters: totalFuelLiters,
      fuelCost: totalFuelCost,
      fuelEfficiency,
      maintCost: totalMaintCost,
      operationalCost: totalOperationalCost,
      roi,
      acquisition
    };
  });

  // Calculate Fleet Averages
  const totalFuelLiters = vehicleReports.reduce((sum, r) => sum + r.liters, 0);
  const totalDistance = vehicleReports.reduce((sum, r) => sum + r.distance, 0);
  const averageFuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters) : 0;

  const totalOperationalCost = vehicleReports.reduce((sum, r) => sum + r.operationalCost, 0);
  const totalFleetRevenue = vehicleReports.reduce((sum, r) => sum + r.revenue, 0);

  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const totalActiveCap = vehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = totalActiveCap > 0 ? Math.round((activeVehicles / totalActiveCap) * 100) : 0;

  // Average Fleet ROI
  const totalAcquisition = vehicleReports.reduce((sum, r) => sum + r.acquisition, 0);
  const totalCostsSum = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0) + fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const fleetRoi = totalAcquisition > 0 ? ((totalFleetRevenue - totalCostsSum) / totalAcquisition) * 100 : 0;

  // Export to CSV Function
  const exportToCSV = () => {
    // CSV Header row
    const headers = ['Vehicle Plate', 'Model Name', 'Type', 'Acquisition Cost ($)', 'Distance Traveled (km)', 'Fuel Consumed (L)', 'Fuel Efficiency (km/L)', 'Maintenance Cost ($)', 'Total Operational Cost ($)', 'Contract Revenue ($)', 'ROI (%)'];
    
    // CSV Data rows
    const rows = vehicleReports.map(r => [
      r.regNum,
      r.name,
      r.type,
      r.acquisition,
      r.distance,
      r.liters,
      r.fuelEfficiency.toFixed(2),
      r.maintCost,
      r.operationalCost,
      r.revenue,
      r.roi.toFixed(1)
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  const monthlyRevenue = [3200, 3800, 4200, 4600, 5200, 5600, 5400];
  const revenueMax = Math.max(...monthlyRevenue, 1);
  const costliestVehicles = vehicleReports
    .slice()
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm uppercase tracking-[0.35em] text-zinc-500 font-semibold mb-2">Reports & Analytics</h2>
              <p className="text-xs text-zinc-500">Fleet intelligence snapshot for your transport operations.</p>
            </div>
            <div className="w-full lg:w-1/3">
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
                <input
                  className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
              <p className="text-[10px] uppercase tracking-[0.4em] text-sky-400/80 mb-3">Fuel Efficiency</p>
              <div className="text-3xl font-semibold text-slate-100">{averageFuelEfficiency.toFixed(1)} km/L</div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
              <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-400/80 mb-3">Fleet Utilization</p>
              <div className="text-3xl font-semibold text-slate-100">{fleetUtilization}%</div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400/80 mb-3">Operational Cost</p>
              <div className="text-3xl font-semibold text-slate-100">${totalOperationalCost.toLocaleString()}</div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
              <p className="text-[10px] uppercase tracking-[0.4em] text-lime-400/80 mb-3">Vehicle ROI</p>
              <div className="text-3xl font-semibold text-slate-100">{fleetRoi.toFixed(1)}%</div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 uppercase tracking-[0.35em] mb-4">ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost</div>

          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Monthly Revenue</p>
                </div>
              </div>
              <div className="flex items-end gap-3 h-40">
                {monthlyRevenue.map((value, index) => (
                  <div key={index} className="flex-1">
                    <div
                      className="rounded-t-2xl bg-sky-500"
                      style={{ height: `${Math.max(24, (value / revenueMax) * 100)}%` }}
                    />
                    <div className="mt-2 h-2 rounded-full bg-zinc-900" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Top Costliest Vehicles</p>
              </div>
              <div className="space-y-4">
                {costliestVehicles.map((vehicle, index) => {
                  const percentage = Math.min(100, Math.round((vehicle.operationalCost / Math.max(1, costliestVehicles[0]?.operationalCost || 1)) * 100));
                  const barColors = ['bg-pink-500', 'bg-amber-500', 'bg-sky-500'];
                  return (
                    <div key={vehicle.regNum} className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-zinc-300">
                        <span>{vehicle.regNum}</span>
                        <span className="font-semibold text-slate-100">${vehicle.operationalCost.toLocaleString()}</span>
                      </div>
                      <div className="h-3 rounded-full bg-zinc-900 overflow-hidden">
                        <div className={`${barColors[index % barColors.length]} h-full`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
