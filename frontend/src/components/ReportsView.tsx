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

  return (
    <div className="space-y-6 print:bg-white print:p-8">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:shadow-none print:border-none print:p-0">
        <div>
          <h2 className="text-base font-bold text-slate-800">Operational & Financial Reports</h2>
          <p className="text-xs text-slate-400 mt-0.5">Anchored Period: Fleet statistics as of July 11, 2026</p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 print:shadow-none">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl print:bg-slate-100">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Fuel Efficiency</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{averageFuelEfficiency.toFixed(2)} km/L</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Total: {totalDistance.toLocaleString()} km run</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 print:shadow-none">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl print:bg-slate-100">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fleet Utilization</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{fleetUtilization}%</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Active / Non-retired</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 print:shadow-none">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl print:bg-slate-100">
            <CircleDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Op Expenses</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">${totalOperationalCost.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Fuel, Maint & Tolls</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 print:shadow-none">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl print:bg-slate-100">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fleet ROI (%)</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{fleetRoi.toFixed(1)}%</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Profit vs Asset Capital</p>
          </div>
        </div>
      </div>

      {/* Main Table Report */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between print:p-0 print:pb-4 print:border-b-2 print:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fleet Registry Executive Ledger</h3>
          <span className="text-xs text-slate-400 font-mono font-semibold print:hidden">All values in USD ($) and Metric system</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider print:bg-white print:border-b-2 print:border-slate-800">
                <th className="px-6 py-4">Vehicle Plate</th>
                <th className="px-6 py-4">Name / Model</th>
                <th className="px-6 py-4 text-right">Distance (km)</th>
                <th className="px-6 py-4 text-right">Fuel Consumed</th>
                <th className="px-6 py-4 text-right">Fuel Efficiency</th>
                <th className="px-6 py-4 text-right">Maintenance Cost</th>
                <th className="px-6 py-4 text-right">Total Operational Cost</th>
                <th className="px-6 py-4 text-right">Trip Revenue</th>
                <th className="px-6 py-4 text-right bg-slate-50 border-l border-slate-100 font-extrabold text-indigo-700 print:bg-white print:border-l-0">Vehicle ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 print:divide-y print:divide-slate-300">
              {vehicleReports.map((report) => {
                let roiColor = 'text-slate-700';
                if (report.roi > 0) roiColor = 'text-emerald-700 font-extrabold';
                else if (report.roi < 0) roiColor = 'text-rose-600 font-extrabold';

                return (
                  <tr key={report.regNum} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">{report.regNum}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{report.name}</td>
                    <td className="px-6 py-4 text-right font-mono">{(report.distance).toLocaleString()} km</td>
                    <td className="px-6 py-4 text-right font-mono">{report.liters > 0 ? `${report.liters} L` : '0 L'}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                      {report.fuelEfficiency > 0 ? `${report.fuelEfficiency.toFixed(2)} km/L` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">${(report.maintCost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono">${(report.operationalCost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-slate-800">
                      ${(report.revenue).toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right bg-indigo-50/10 border-l border-slate-100 font-mono print:bg-white print:border-l-0 ${roiColor}`}>
                      {report.roi.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
