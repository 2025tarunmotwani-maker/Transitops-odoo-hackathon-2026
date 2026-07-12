import React, { useState } from 'react';
import { Driver, DriverStatus } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  UserCheck, 
  AlertTriangle, 
  Phone, 
  ShieldAlert,
  Calendar,
  X,
  Sparkles,
  Award,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PrimaryButton from './PrimaryButton';
import Badge from './Badge';

interface DriverManagementViewProps {
  drivers: Driver[];
  onAddDriver: (d: Driver) => boolean; // returns true if successful
  onUpdateDriver: (d: Driver) => void;
  onDeleteDriver: (licenseNum: string) => void;
  userRole: string;
}

export default function DriverManagementView({
  drivers,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  userRole
}: DriverManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All'); // 'All' | 'Compliant' | 'Expired/Warning'

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form Fields
  const [licenseNum, setLicenseNum] = useState('');
  const [name, setName] = useState('');
  const [licenseCategory, setLicenseCategory] = useState<'Class A CDL' | 'Class B CDL' | 'Class C' | 'Standard'>('Class A CDL');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('2027-01-01');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState<number>(90);
  const [status, setStatus] = useState<DriverStatus>('Available');

  // Form Validation Feedback
  const [error, setError] = useState('');

  const currentDate = new Date('2026-07-11'); // Anchored time

  // Helper: check if license is expired
  const checkLicenseStatus = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'Expired', days: Math.abs(diffDays), color: 'text-rose-600 bg-rose-50 border-rose-200' };
    } else if (diffDays <= 30) {
      return { status: 'Expiring Soon', days: diffDays, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    } else {
      return { status: 'Active', days: diffDays, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
  };

  const openAddForm = () => {
    setError('');
    setEditingDriver(null);
    setLicenseNum('');
    setName('');
    setLicenseCategory('Class A CDL');
    setLicenseExpiryDate('2027-01-01');
    setContactNumber('');
    setSafetyScore(95);
    setStatus('Available');
    setIsFormOpen(true);
  };

  const openEditForm = (driver: Driver) => {
    if (driver.status === 'On Trip') {
      alert('This driver is currently on a trip. You cannot edit their profile until the dispatch is complete.');
      return;
    }
    setError('');
    setEditingDriver(driver);
    setLicenseNum(driver.licenseNumber);
    setName(driver.name);
    setLicenseCategory(driver.licenseCategory);
    setLicenseExpiryDate(driver.licenseExpiryDate);
    setContactNumber(driver.contactNumber);
    setSafetyScore(driver.safetyScore);
    setStatus(driver.status);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!licenseNum.trim()) {
      setError('License Number is required.');
      return;
    }
    if (!name.trim()) {
      setError('Driver Name is required.');
      return;
    }
    if (!contactNumber.trim()) {
      setError('Contact Number is required.');
      return;
    }
    if (safetyScore < 0 || safetyScore > 100) {
      setError('Safety Score must be between 0 and 100.');
      return;
    }

    const payload: Driver = {
      licenseNumber: licenseNum.trim().toUpperCase(),
      name: name.trim(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber: contactNumber.trim(),
      safetyScore,
      status
    };

    if (editingDriver) {
      onUpdateDriver(payload);
      setIsFormOpen(false);
    } else {
      const success = onAddDriver(payload);
      if (success) {
        setIsFormOpen(false);
      } else {
        setError(`A driver with License Number "${licenseNum.toUpperCase()}" already exists!`);
      }
    }
  };

  const handleDelete = (licenseNumber: string) => {
    const d = drivers.find(item => item.licenseNumber === licenseNumber);
    if (d && d.status === 'On Trip') {
      alert('Cannot delete a driver while they are active on a trip.');
      return;
    }
    if (confirm(`Are you sure you want to delete driver ${d?.name} from active duty rosters?`)) {
      onDeleteDriver(licenseNumber);
    }
  };

  // Filter list
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    
    const compliance = checkLicenseStatus(d.licenseExpiryDate);
    let matchesCompliance = true;
    if (complianceFilter === 'Compliant') {
      matchesCompliance = compliance.status === 'Active';
    } else if (complianceFilter === 'Expired/Warning') {
      matchesCompliance = compliance.status === 'Expired' || compliance.status === 'Expiring Soon';
    }

    return matchesSearch && matchesStatus && matchesCompliance;
  });

  const canManage = userRole === 'FleetManager' || userRole === 'SafetyOfficer';

  return (
    <div className="space-y-6">
      {/* Filters and Command Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 tp-card p-4 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 h-10 w-4.5" />
          <input
            type="text"
            placeholder="Search drivers by name or CDL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tp-search pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All License Status</option>
            <option value="Compliant">Compliant Active CDL</option>
            <option value="Expired/Warning">Expired / Warning List</option>
          </select>

          {canManage ? (
            <PrimaryButton onClick={openAddForm} className="flex items-center gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Onboard Driver
            </PrimaryButton>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5" />
              Manager/Safety-Only Onboarding Actions
            </span>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="tp-card rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Driver</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">License #</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Category</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Expiry</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Contact</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase text-xs tracking-wide">Safety</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase text-xs tracking-wide">Status</th>
                {canManage && <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase text-xs tracking-wide">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDrivers.map((driver) => {
                const compliance = checkLicenseStatus(driver.licenseExpiryDate);
                // Safety score styling
                let safetyColor = 'text-rose-600 bg-rose-50';
                if (driver.safetyScore >= 85) safetyColor = 'text-emerald-700 bg-emerald-50';
                else if (driver.safetyScore >= 70) safetyColor = 'text-amber-700 bg-amber-50';

                return (
                  <motion.tr
                    key={driver.licenseNumber}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 font-bold text-slate-800">{driver.name}</td>
                    <td className="px-4 py-4 font-mono text-slate-600 text-xs">{driver.licenseNumber}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{driver.licenseCategory}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 rounded-sm text-[11px] font-bold border ${compliance.color}`}>
                        {driver.licenseExpiryDate}
                        {compliance.status === 'Expired' && ' (Blocked)'}
                        {compliance.status === 'Expiring Soon' && ' (Renew!)'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-600 text-xs">{driver.contactNumber}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-sm font-bold text-xs ${safetyColor}`}>
                        {driver.safetyScore}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={driver.status === 'Available' ? 'available' : driver.status === 'On Trip' ? 'ontrip' : driver.status === 'Suspended' ? 'suspended' : driver.status === 'Off Duty' ? 'offduty' : 'default'}>
                        {driver.status}
                      </Badge>
                    </td>
                    {canManage && (
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditForm(driver)}
                            disabled={driver.status === 'On Trip'}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {(userRole === 'FleetManager') && (
                            <button
                              onClick={() => handleDelete(driver.licenseNumber)}
                              disabled={driver.status === 'On Trip'}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDrivers.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <UserCheck className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">No drivers found</p>
            <p className="text-slate-400 text-xs mt-1">Try relaxing your search constraints or compliance filters.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
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
                  {editingDriver ? 'Edit Driver Record' : 'Onboard New Driver'}
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
                    {/* License CDL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        CDL / License Number (Unique)
                      </label>
                      <input
                        type="text"
                        value={licenseNum}
                        onChange={(e) => setLicenseNum(e.target.value)}
                        disabled={!!editingDriver}
                        placeholder="DL-A1234"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 disabled:bg-slate-50"
                      />
                    </div>

                    {/* Driver Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Driver Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Marcus Miller"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* License Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        License Class
                      </label>
                      <select
                        value={licenseCategory}
                        onChange={(e) => setLicenseCategory(e.target.value as any)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Class A CDL">Class A CDL (Commercial)</option>
                        <option value="Class B CDL">Class B CDL (Commercial)</option>
                        <option value="Class C">Class C</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        License Expiry Date
                      </label>
                      <input
                        type="date"
                        value={licenseExpiryDate}
                        onChange={(e) => setLicenseExpiryDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Safety Score */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Safety Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={safetyScore}
                        onChange={(e) => setSafetyScore(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Duty Status */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Duty Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as DriverStatus)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="Suspended">Suspended</option>
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
                  <PrimaryButton type="submit" className="text-xs">
                    {editingDriver ? 'Save Changes' : 'Onboard Driver'}
                  </PrimaryButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
