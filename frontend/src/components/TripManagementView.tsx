import React, { useState } from 'react';
import { Trip, Vehicle, Driver, TripStatus } from '../types';
import { 
  Plus, 
  Search, 
  Send, 
  CheckSquare, 
  XSquare, 
  ShieldAlert, 
  MapPin, 
  Navigation,
  Scale, 
  Calendar,
  Sparkles,
  X,
  Gauge,
  Flame,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TripManagementViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onCreateTrip: (trip: Trip) => void;
  onDispatchTrip: (tripId: string) => void;
  onCompleteTrip: (tripId: string, finalOdometer: number, fuelConsumed: number) => void;
  onCancelTrip: (tripId: string) => void;
  userRole: string;
}

export default function TripManagementView({
  trips,
  vehicles,
  drivers,
  onCreateTrip,
  onDispatchTrip,
  onCompleteTrip,
  onCancelTrip,
  userRole
}: TripManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'All'>('All');

  // Creation Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState<number>(0);
  const [plannedDistance, setPlannedDistance] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(500);
  const [error, setError] = useState('');

  // Completion Modal States
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [completingTripId, setCompletingTripId] = useState('');
  const [finalOdometer, setFinalOdometer] = useState<number>(0);
  const [fuelConsumed, setFuelConsumed] = useState<number>(0);
  const [completeError, setCompleteError] = useState('');

  const currentDate = new Date('2026-07-11');

  // Filter Drivers who are eligible for assignment
  const availableDrivers = drivers.filter(d => {
    // Driver status must be Available
    if (d.status !== 'Available') return false;
    
    // License must not be expired
    const expiry = new Date(d.licenseExpiryDate);
    if (expiry < currentDate) return false;

    return true;
  });

  // Filter Vehicles that are eligible for dispatch
  const availableVehicles = vehicles.filter(v => v.status === 'Available');

  const handleOpenCreate = () => {
    setError('');
    setSource('');
    setDestination('');
    setCargoWeight(0);
    setPlannedDistance(0);
    setRevenue(1000);
    
    // Pre-select first eligible vehicle & driver if any
    if (availableVehicles.length > 0) setSelectedVehicleId(availableVehicles[0].registrationNumber);
    else setSelectedVehicleId('');

    if (availableDrivers.length > 0) setSelectedDriverId(availableDrivers[0].licenseNumber);
    else setSelectedDriverId('');

    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!source.trim() || !destination.trim()) {
      setError('Source and Destination are required.');
      return;
    }
    if (!selectedVehicleId) {
      setError('Please select an available vehicle.');
      return;
    }
    if (!selectedDriverId) {
      setError('Please select an available driver.');
      return;
    }
    if (cargoWeight <= 0) {
      setError('Cargo weight must be greater than zero.');
      return;
    }
    if (plannedDistance <= 0) {
      setError('Planned distance must be greater than zero.');
      return;
    }
    if (revenue <= 0) {
      setError('Expected revenue must be greater than zero.');
      return;
    }

    // Business Rule Check: Cargo weight must not exceed max load capacity of selected vehicle
    const vehicleObj = vehicles.find(v => v.registrationNumber === selectedVehicleId);
    if (vehicleObj && cargoWeight > vehicleObj.maxCapacity) {
      setError(`Overweight Blocked: Cargo weight (${cargoWeight.toLocaleString()} kg) exceeds the maximum capacity of ${vehicleObj.name} (${vehicleObj.maxCapacity.toLocaleString()} kg).`);
      return;
    }

    const newTrip: Trip = {
      id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      source: source.trim(),
      destination: destination.trim(),
      vehicleId: selectedVehicleId,
      driverId: selectedDriverId,
      cargoWeight,
      plannedDistance,
      revenue,
      status: 'Draft',
      createdAt: new Date().toISOString()
    };

    onCreateTrip(newTrip);
    setIsCreateOpen(false);
  };

  const handleOpenComplete = (trip: Trip) => {
    setCompleteError('');
    setCompletingTripId(trip.id);
    
    // Default final odometer to current odometer + planned distance
    const vObj = vehicles.find(v => v.registrationNumber === trip.vehicleId);
    const curOdom = vObj ? vObj.odometer : 0;
    setFinalOdometer(curOdom + trip.plannedDistance);
    setFuelConsumed(Math.round(trip.plannedDistance / 3)); // reasonable estimate to begin with
    
    setIsCompleteOpen(true);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompleteError('');

    const trip = trips.find(t => t.id === completingTripId);
    if (!trip) return;

    const vObj = vehicles.find(v => v.registrationNumber === trip.vehicleId);
    const curOdom = vObj ? vObj.odometer : 0;

    if (finalOdometer <= curOdom) {
      setCompleteError(`Final odometer (${finalOdometer.toLocaleString()} km) must be strictly greater than the vehicle's departure odometer (${curOdom.toLocaleString()} km).`);
      return;
    }
    if (fuelConsumed <= 0) {
      setCompleteError('Fuel consumed must be greater than 0 Liters.');
      return;
    }

    onCompleteTrip(completingTripId, finalOdometer, fuelConsumed);
    setIsCompleteOpen(false);
  };

  // Filter list
  const filteredTrips = trips.filter(t => {
    const vObj = vehicles.find(v => v.registrationNumber === t.vehicleId);
    const dObj = drivers.find(d => d.licenseNumber === t.driverId);
    
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (vObj && vObj.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (dObj && dObj.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canManage = userRole === 'FleetManager' || userRole === 'Driver';

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
          <input
            type="text"
            placeholder="Search dispatches by location, vehicle, driver or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Trip States</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched (On Trip)</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {canManage ? (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Plan New Dispatch
            </button>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5" />
              Driver/Manager-Only Trip Planning
            </span>
          )}
        </div>
      </div>

      {/* Trips List/Table View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Trip ID</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Assigned Vehicle</th>
                <th className="px-6 py-4">Assigned Driver</th>
                <th className="px-6 py-4 text-right">Specs (kg/km)</th>
                <th className="px-6 py-4 text-right">Revenue</th>
                <th className="px-6 py-4 text-center">Status</th>
                {canManage && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTrips.map((trip) => {
                const vehicleObj = vehicles.find(v => v.registrationNumber === trip.vehicleId);
                const driverObj = drivers.find(d => d.licenseNumber === trip.driverId);

                let statusBadge = 'bg-slate-100 text-slate-800';
                if (trip.status === 'Draft') statusBadge = 'bg-slate-100 text-slate-600 border border-slate-200';
                if (trip.status === 'Dispatched') statusBadge = 'bg-blue-50 text-blue-700 border border-blue-100';
                if (trip.status === 'Completed') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                if (trip.status === 'Cancelled') statusBadge = 'bg-rose-50 text-rose-700 border border-rose-100';

                return (
                  <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{trip.id}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <MapPin className="h-3 w-3 text-emerald-500" />
                          <span>{trip.source}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Navigation className="h-3 w-3 text-indigo-400" />
                          <span>{trip.destination}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {vehicleObj ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 truncate block max-w-[140px]">{vehicleObj.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{vehicleObj.registrationNumber}</span>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {driverObj ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">{driverObj.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{driverObj.licenseNumber}</span>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-0.5 font-mono">
                        <span className="font-bold block">{(trip.cargoWeight).toLocaleString()} kg</span>
                        <span className="text-slate-400">{(trip.plannedDistance).toLocaleString()} km</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      ${(trip.revenue).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${statusBadge}`}>
                        {trip.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {trip.status === 'Draft' && (
                            <>
                              <button
                                onClick={() => onDispatchTrip(trip.id)}
                                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all text-[11px]"
                                title="Dispatch Trip"
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span>Dispatch</span>
                              </button>
                              <button
                                onClick={() => onCancelTrip(trip.id)}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all text-[11px]"
                                title="Cancel Dispatch"
                              >
                                <XSquare className="h-3.5 w-3.5" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {trip.status === 'Dispatched' && (
                            <>
                              <button
                                onClick={() => handleOpenComplete(trip)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all text-[11px]"
                                title="Log completion statistics"
                              >
                                <CheckSquare className="h-3.5 w-3.5" />
                                <span>Complete</span>
                              </button>
                              <button
                                onClick={() => onCancelTrip(trip.id)}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all text-[11px]"
                                title="Cancel Dispatch"
                              >
                                <XSquare className="h-3.5 w-3.5" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                            <span className="text-[10px] text-slate-400 font-semibold italic">Archived</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="text-center py-10 text-slate-400">
                    <Navigation className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold">No dispatches found</p>
                    <p className="text-[11px] mt-0.5">Clear search filters or register a new trip plan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TRIP PLAN MODAL */}
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
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Plan & Schedule Dispatch
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
                      <span className="font-semibold">{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Source */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Dispatch Source
                      </label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="e.g., Chicago, IL"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Destination */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Route Destination
                      </label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Minneapolis, MN"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Vehicle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Available Fleet Vehicle
                      </label>
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {availableVehicles.map(v => (
                          <option key={v.registrationNumber} value={v.registrationNumber}>
                            {v.name} ({v.registrationNumber}) - Max: {v.maxCapacity}kg
                          </option>
                        ))}
                      </select>
                      {availableVehicles.length === 0 && (
                        <span className="text-[10px] text-rose-500 font-bold block mt-1">
                          No active, available vehicles in fleet!
                        </span>
                      )}
                    </div>

                    {/* Driver */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Available Licensed Driver
                      </label>
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 bg-white"
                      >
                        <option value="">-- Choose Driver --</option>
                        {availableDrivers.map(d => (
                          <option key={d.licenseNumber} value={d.licenseNumber}>
                            {d.name} ({d.licenseCategory}) - Rating: {d.safetyScore}%
                          </option>
                        ))}
                      </select>
                      {availableDrivers.length === 0 && (
                        <span className="text-[10px] text-rose-500 font-bold block mt-1">
                          No available compliant drivers! (Excludes suspended or expired licenses)
                        </span>
                      )}
                    </div>

                    {/* Cargo Weight */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Scale className="h-3.5 w-3.5" /> Cargo Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={cargoWeight}
                        onChange={(e) => setCargoWeight(parseInt(e.target.value) || 0)}
                        placeholder="e.g., 500"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Planned Distance */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Navigation className="h-3.5 w-3.5" /> Planned Distance (km)
                      </label>
                      <input
                        type="number"
                        value={plannedDistance}
                        onChange={(e) => setPlannedDistance(parseInt(e.target.value) || 0)}
                        placeholder="e.g., 400"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Expected Revenue */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Contract Revenue (USD)
                      </label>
                      <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(parseInt(e.target.value) || 0)}
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
                    Create Dispatch Plan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPLETE TRIP MODAL */}
      <AnimatePresence>
        {isCompleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                  Complete Dispatch Stats
                </h3>
                <button
                  onClick={() => setIsCompleteOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCompleteSubmit}>
                <div className="p-6 space-y-4">
                  {completeError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span className="font-semibold">{completeError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Final Odometer */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" /> Final Odometer Reading (km)
                      </label>
                      <input
                        type="number"
                        value={finalOdometer}
                        onChange={(e) => setFinalOdometer(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Must be higher than vehicle's current odometer.
                      </p>
                    </div>

                    {/* Fuel Consumed */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" /> Fuel Consumed (Liters)
                      </label>
                      <input
                        type="number"
                        value={fuelConsumed}
                        onChange={(e) => setFuelConsumed(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCompleteOpen(false)}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Submit & Close Trip
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
