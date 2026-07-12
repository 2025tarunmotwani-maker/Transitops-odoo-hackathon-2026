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

export default function VehicleRegistryView({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  userRole
}: VehicleRegistryViewProps) {
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form fields
  const [regNum, setRegNum] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('Delivery Van');
  const [maxCapacity, setMaxCapacity] = useState<number>(2000);
  const [odometer, setOdometer] = useState<number>(0);
  const [acquisitionCost, setAcquisitionCost] = useState<number>(30000);
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [region, setRegion] = useState<'North' | 'South' | 'East' | 'West'>('North');
  
  // Validation feedback
  const [error, setError] = useState('');

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
    setRegion('North');
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
    setRegNum(vehicle.registrationNumber);
    setName(vehicle.name);
    setType(vehicle.type);
    setMaxCapacity(vehicle.maxCapacity);
    setOdometer(vehicle.odometer);
    setAcquisitionCost(vehicle.acquisitionCost);
    setStatus(vehicle.status);
    setRegion(vehicle.region);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!regNum.trim()) {
      setError('Registration Number is required.');
      return;
    }
    if (!name.trim()) {
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

    const payload: Vehicle = {
      registrationNumber: regNum.trim().toUpperCase(),
      name: name.trim(),
      type,
      maxCapacity,
      odometer,
      acquisitionCost,
      status,
      region
    };

    if (editingVehicle) {
      // Editing
      onUpdateVehicle(payload);
      setIsFormOpen(false);
    } else {
      // Creating - check for uniqueness
      const success = onAddVehicle(payload);
      if (success) {
        setIsFormOpen(false);
      } else {
        setError(`A vehicle with Registration Number "${regNum.toUpperCase()}" already exists!`);
      }
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
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const canManage = userRole === 'FleetManager';

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
          <input
            type="text"
            placeholder="Search vehicles by name or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Types</option>
            <option value="Semi-Truck">Semi-Trucks</option>
            <option value="Heavy Duty">Heavy Duty</option>
            <option value="Delivery Van">Delivery Vans</option>
            <option value="EV Cargo">EV Cargo</option>
            <option value="Support Sedan">Support Sedans</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          {canManage ? (
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register Vehicle
            </button>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5" />
              Manager-Only Registry Actions
            </span>
          )}
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          let statusBadgeColor = 'bg-slate-100 text-slate-800';
          if (vehicle.status === 'Available') statusBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
          if (vehicle.status === 'On Trip') statusBadgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
          if (vehicle.status === 'In Shop') statusBadgeColor = 'bg-amber-50 text-amber-700 border-amber-100';
          if (vehicle.status === 'Retired') statusBadgeColor = 'bg-rose-50 text-rose-700 border-rose-100';

          return (
            <motion.div
              layout
              key={vehicle.registrationNumber}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-250 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-300">
                      {vehicle.registrationNumber}
                    </span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm font-semibold">
                      {vehicle.region}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 truncate max-w-[170px]" title={vehicle.name}>
                    {vehicle.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">{vehicle.type}</p>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${statusBadgeColor}`}>
                  {vehicle.status}
                </span>
              </div>

              {/* Specs Body */}
              <div className="p-5 grid grid-cols-2 gap-4 text-xs font-medium flex-1">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Capacity</p>
                    <p className="text-slate-700 font-bold">{(vehicle.maxCapacity).toLocaleString()} kg</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Odometer</p>
                    <p className="text-slate-700 font-bold">{(vehicle.odometer).toLocaleString()} km</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Acquisition</p>
                    <p className="text-slate-700 font-bold">${(vehicle.acquisitionCost).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Operating Hub</p>
                    <p className="text-slate-700 font-bold">{vehicle.region} Logistics Hub</p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              {canManage && (
                <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => openEditForm(vehicle)}
                    disabled={vehicle.status === 'On Trip'}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Edit vehicle details"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(vehicle.registrationNumber)}
                    disabled={vehicle.status === 'On Trip'}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Remove vehicle from database"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <Truck className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">No vehicles found</p>
            <p className="text-slate-400 text-xs mt-1">Try relaxing your search constraints or filters.</p>
          </div>
        )}
      </div>

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  {editingVehicle ? 'Edit Vehicle Profile' : 'Register New Fleet Asset'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Reg Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Registration Plate (Unique)
                      </label>
                      <input
                        type="text"
                        value={regNum}
                        onChange={(e) => setRegNum(e.target.value)}
                        disabled={!!editingVehicle}
                        placeholder="TRK-901"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 disabled:bg-slate-50"
                      />
                    </div>

                    {/* Model Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Vehicle Name / Model
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Volvo FH16 Semi"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Vehicle Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Vehicle Type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as VehicleType)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Semi-Truck">Semi-Truck</option>
                        <option value="Heavy Duty">Heavy Duty</option>
                        <option value="Delivery Van">Delivery Van</option>
                        <option value="EV Cargo">EV Cargo</option>
                        <option value="Support Sedan">Support Sedan</option>
                      </select>
                    </div>

                    {/* Regional Hub */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Regional Logistics Hub
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value as 'North' | 'South' | 'East' | 'West')}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                      </select>
                    </div>

                    {/* Max Load Capacity */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Max Load Capacity (kg)
                      </label>
                      <input
                        type="number"
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 0)}
                        placeholder="25000"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Odometer */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Odometer (km)
                      </label>
                      <input
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(parseInt(e.target.value) || 0)}
                        placeholder="145200"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Acquisition Cost */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Acquisition Cost (USD)
                      </label>
                      <input
                        type="number"
                        value={acquisitionCost}
                        onChange={(e) => setAcquisitionCost(parseInt(e.target.value) || 0)}
                        placeholder="135000"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Vehicle Status */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Fleet Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
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
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
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
