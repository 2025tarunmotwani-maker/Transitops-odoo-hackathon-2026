import React, { useState } from 'react';
import { Vehicle, VehicleType, VehicleStatus } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  SlidersHorizontal, 
  Truck, 
  ShieldAlert,
  Gauge,
  CircleDollarSign,
  MapPin,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleRegistryViewProps {
  vehicles: Vehicle[];
  onAddVehicle: (v: Vehicle) => boolean; // returns true if successful
  onUpdateVehicle: (v: Vehicle) => void;
  onDeleteVehicle: (regNum: string) => void;
  userRole: string;
}

type VehicleRegistryVehicle = Vehicle & {
  vehicleName?: string;
  vehicleType?: VehicleType;
  logisticsHub?: 'North' | 'South' | 'East' | 'West';
  maxLoadCapacity?: number;
};

export default function VehicleRegistryView({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  userRole
}: VehicleRegistryViewProps) {
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [regNoSearchTerm, setRegNoSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form fields
  const [regNum, setRegNum] = useState('');
  const [vehicleName, setName] = useState('');
  const [vehicleType, setType] = useState<VehicleType>('Delivery Van');
  const [maxCapacity, setMaxCapacity] = useState<number>(2000);
  const [odometer, setOdometer] = useState<number>(0);
  const [acquisitionCost, setAcquisitionCost] = useState<number>(30000);
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [logisticsHub, setLogisticsHub] = useState<'North' | 'South' | 'East' | 'West'>('North');
  
  // Validation feedback
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open form for adding new vehicle
  const openAddForm = () => {
    setError('');
    setEditingVehicle(null);
    setRegNum('');
    setName('');
    setType('Delivery Van');
    setMaxCapacity(2000);
    setOdometer(0);
    setAcquisitionCost(30000);
    setStatus('Available');
    setLogisticsHub('North');
    setIsFormOpen(true);
  };

  // Open form for editing existing vehicle
  const openEditForm = (vehicle: Vehicle) => {
    if (vehicle.status === 'On Trip') {
      alert('This vehicle is currently on a trip. You cannot edit vital fleet information until the dispatch is complete.');
      return;
    }
    setError('');
    setEditingVehicle(vehicle);
    const vehicleRecord = vehicle as VehicleRegistryVehicle;
    setRegNum(vehicle.registrationNumber);
    setName(vehicleRecord.vehicleName ?? '');
    setType(vehicleRecord.vehicleType ?? 'Delivery Van');
    setMaxCapacity(vehicleRecord.maxLoadCapacity ?? 2000);
    setOdometer(vehicle.odometer);
    setAcquisitionCost(vehicle.acquisitionCost);
    setStatus(vehicle.status);
    setLogisticsHub(vehicleRecord.logisticsHub ?? 'North');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!regNum.trim()) {
      setError('Registration Number is required.');
      return;
    }
    if (!vehicleName.trim()) {
      setError('Vehicle Name/Model is required.');
      return;
    }
    if (maxCapacity <= 0) {
      setError('Maximum capacity must be greater than zero.');
      return;
    }
    if (odometer < 0) {
      setError('Odometer mileage cannot be negative.');
      return;
    }
    if (acquisitionCost <= 0) {
      setError('Acquisition cost must be greater than zero.');
      return;
    }

    const payload = {
      registrationNumber: regNum.trim().toUpperCase(),
      vehicleName: vehicleName.trim(),
      vehicleType,
      maxLoadCapacity: maxCapacity,
      odometer,
      acquisitionCost,
      status,
      logisticsHub
    };

    if (editingVehicle) {
      onUpdateVehicle(payload as unknown as Vehicle);
      setIsFormOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(import.meta.env.VITE_API_URL || 'http://localhost:8081/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Unable to register vehicle.');
      }

      const success = onAddVehicle(payload as unknown as Vehicle);
      if (success) {
        setIsFormOpen(false);
      } else {
        setError(`A vehicle with Registration Number "${regNum.toUpperCase()}" already exists!`);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to register vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (regNumber: string) => {
    const v = vehicles.find(item => item.registrationNumber === regNumber);
    if (v && v.status === 'On Trip') {
      alert('Cannot delete a vehicle while it is active on a trip.');
      return;
    }
    if (confirm(`Are you sure you want to remove vehicle ${regNumber} from the registry?`)) {
      onDeleteVehicle(regNumber);
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const vehicleRecord = v as VehicleRegistryVehicle;
    const matchesSearch = (vehicleRecord.vehicleName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegNoSearch = v.registrationNumber.toLowerCase().includes(regNoSearchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || vehicleRecord.vehicleType === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesRegNoSearch && matchesType && matchesStatus;
  });

  const canManage = userRole === 'FleetManager';

  return (
    <div className="space-y-8 bg-[#181a1d] min-h-screen text-[#f0f1f4] p-8" style={{ fontFamily: 'handdrawnfont, cursive' }}>
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">2. Vehicle Registry</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-72 border border-slate-700 bg-black/40 rounded-full text-sm text-[#f0f1f4] placeholder-slate-500 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
          <span className="text-sm font-medium text-slate-300">Raven K.</span>
          <span className="text-sm font-bold bg-[#142d54] text-blue-200 px-3 py-1 rounded-full">Dispatche <span className="text-xs">RK</span></span>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e2226] p-4 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-black/40 border border-slate-800 text-slate-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
          >
            <option value="All">Type: All</option>
            <option value="Semi-Truck">Semi-Trucks</option>
            <option value="Heavy Duty">Heavy Duty</option>
            <option value="Delivery Van">Delivery Vans</option>
            <option value="EV Cargo">EV Cargo</option>
            <option value="Support Sedan">Support Sedans</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/40 border border-slate-800 text-slate-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
            <input
              type="text"
              placeholder="Search reg. no..."
              value={regNoSearchTerm}
              onChange={(e) => setRegNoSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 border border-slate-700 bg-black/40 rounded-full text-sm text-[#f0f1f4] placeholder-slate-500 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
        </div>

        {canManage ? (
          <button
            onClick={openAddForm}
            className="px-6 py-2 bg-[#d4992b] hover:bg-[#c48e2a] text-[#f0f1f4] rounded-full text-sm font-bold transition-colors shadow-2xl cursor-pointer"
          >
            + Add Vehicle
          </button>
        ) : (
          <span className="text-sm text-slate-400 bg-[#1e2226] border border-slate-800 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
            <Info className="h-3.5 w-3.5" />
            Manager-Only Registry Actions
          </span>
        )}
      </div>

      {/* Table of Vehicles */}
      <div className="bg-[#1e2226] rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-[#181a1d] border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-extrabold uppercase">REG. NO. (UNIQUE)</th>
              <th className="px-6 py-4 font-extrabold uppercase">NAME/MODEL</th>
              <th className="px-6 py-4 font-extrabold uppercase">TYPE</th>
              <th className="px-6 py-4 font-extrabold uppercase">CAPACITY</th>
              <th className="px-6 py-4 font-extrabold uppercase">ODOMETER</th>
              <th className="px-6 py-4 font-extrabold uppercase">ACQ. COST</th>
              <th className="px-6 py-4 font-extrabold uppercase">STATUS</th>
              {canManage && <th className="px-6 py-4 font-extrabold uppercase">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => {
              let statusBadgeColor = 'bg-slate-700 text-slate-200 border-slate-600';
              if (vehicle.status === 'Available') statusBadgeColor = 'bg-[#409240] text-[#f0f1f4] border-emerald-700';
              if (vehicle.status === 'On Trip') statusBadgeColor = 'bg-[#1e293b] text-blue-200 border-blue-900';
              if (vehicle.status === 'In Shop') statusBadgeColor = 'bg-[#c48e2a] text-[#181a1d] border-amber-700';
              if (vehicle.status === 'Retired') statusBadgeColor = 'bg-[#b91c1c] text-[#f0f1f4] border-rose-900';

              return (
                <tr key={vehicle.registrationNumber} className="border-b border-slate-800 hover:bg-[#181a1d]/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#f0f1f4]">{vehicle.registrationNumber}</td>
                  <td className="px-6 py-4 text-[#f0f1f4]">{(vehicle as Vehicle & { vehicleName?: string }).vehicleName ?? ''}</td>
                  <td className="px-6 py-4 text-slate-300">{(vehicle as Vehicle & { vehicleType?: VehicleType }).vehicleType ?? ''}</td>
                  <td className="px-6 py-4 text-slate-300">{((vehicle as Vehicle & { maxLoadCapacity?: number }).maxLoadCapacity ?? 0).toLocaleString()} kg</td>
                  <td className="px-6 py-4 text-slate-300">{(vehicle.odometer).toLocaleString()} km</td>
                  <td className="px-6 py-4 text-slate-300">${(vehicle.acquisitionCost).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-4 py-1.5 rounded-full font-bold border ${statusBadgeColor}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 text-xs">
                        <button
                          onClick={() => openEditForm(vehicle)}
                          disabled={vehicle.status === 'On Trip'}
                          className="p-1.5 hover:bg-[#181a1d] text-slate-400 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Edit vehicle details"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(vehicle.registrationNumber)}
                          disabled={vehicle.status === 'On Trip'}
                          className="p-1.5 hover:bg-rose-900/40 text-rose-500 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Remove vehicle from database"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredVehicles.length === 0 && (
          <div className="py-16 bg-[#1e2226] flex flex-col items-center justify-center text-center text-slate-400">
            <Truck className="h-16 w-16 text-slate-700 mb-4" />
            <p className="font-extrabold text-lg">No vehicles found</p>
            <p className="text-sm mt-1.5">Try relaxing your search constraints or filters.</p>
          </div>
        )}
      </div>

      <p className="text-xs font-bold text-slate-600 tracking-wider">Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher</p>

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e2226] rounded-xl shadow-2xl w-full max-w-lg border border-slate-800 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#181a1d]">
                <h3 className="text-sm font-bold text-[#f0f1f4] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  {editingVehicle ? 'Edit Vehicle Profile' : 'Register New Fleet Asset'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-[#181a1d] text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {error && (
                    <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg flex items-center gap-2 text-xs text-rose-300">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Reg Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Registration Plate (Unique)
                      </label>
                      <input
                        type="text"
                        value={regNum}
                        onChange={(e) => setRegNum(e.target.value)}
                        disabled={!!editingVehicle}
                        placeholder="TRK-901"
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600 disabled:bg-[#181a1d]/60 disabled:text-slate-600"
                      />
                    </div>

                    {/* Model Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Vehicle Name / Model
                      </label>
                      <input
                        type="text"
                        value={vehicleName}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Volvo FH16 Semi"
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    {/* Vehicle Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Vehicle Type
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setType(e.target.value as VehicleType)}
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600"
                      >
                        <option value="Semi-Truck">Semi-Truck</option>
                        <option value="Heavy Duty">Heavy Duty</option>
                        <option value="Delivery Van">Delivery Van</option>
                        <option value="EV Cargo">EV Cargo</option>
                        <option value="Support Sedan">Support Sedan</option>
                      </select>
                    </div>

                    {/* Max Load Capacity */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-indigo-400" />
                        Max Capacity (kg)
                      </label>
                      <input
                        type="number"
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 0)}
                        placeholder="25000"
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    {/* Odometer */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                        Odometer (km)
                      </label>
                      <input
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(parseInt(e.target.value) || 0)}
                        placeholder="145200"
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    {/* Acquisition Cost */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <CircleDollarSign className="h-3.5 w-3.5 text-indigo-400" />
                        Acquisition Cost (USD)
                      </label>
                      <input
                        type="number"
                        value={acquisitionCost}
                        onChange={(e) => setAcquisitionCost(parseInt(e.target.value) || 0)}
                        placeholder="135000"
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    {/* Regional Hub */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                        Logistics Hub
                      </label>
                      <select
                        value={logisticsHub}
                        onChange={(e) => setLogisticsHub(e.target.value as 'North' | 'South' | 'East' | 'West')}
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600"
                      >
                        <option value="North">North Hub</option>
                        <option value="South">South Hub</option>
                        <option value="East">East Hub</option>
                        <option value="West">West Hub</option>
                      </select>
                    </div>

                    {/* Vehicle Status */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Fleet Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                        className="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#f0f1f4] bg-black/40 focus:outline-hidden focus:border-indigo-600"
                      >
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="In Shop">In Shop</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-800 bg-[#181a1d] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-[#1e2226] border border-slate-800 text-slate-300 hover:bg-[#1e2226]/60 rounded-full text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#d4992b] hover:bg-[#c48e2a] text-[#f0f1f4] rounded-full text-xs font-bold shadow-2xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingVehicle ? 'Save Changes' : 'Register Vehicle'}
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