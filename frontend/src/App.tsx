import React, { useState, useEffect } from 'react';
import { 
  User, 
  Vehicle, 
  Driver, 
  Trip, 
  MaintenanceLog, 
  FuelLog, 
  Expense, 
  SystemNotification,
  Role
} from './types';
import { 
  loadInitialState, 
  saveState, 
  generateSystemNotifications 
} from './data/db';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import VehicleRegistryView from './components/VehicleRegistryView';
import DriverManagementView from './components/DriverManagementView';
import TripManagementView from './components/TripManagementView';
import MaintenanceView from './components/MaintenanceView';
import ExpensesView from './components/ExpensesView';
import ReportsView from './components/ReportsView';
import DocumentsView from './components/DocumentsView';
import { 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  Calculator, 
  FileSpreadsheet, 
  FileText, 
  LogOut, 
  Bell, 
  Sun, 
  Moon, 
  LayoutDashboard,
  ShieldCheck,
  User as UserIcon,
  X,
  Menu,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [state, setState] = useState(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('transitops_theme');
      return stored !== 'light';
    } catch {
      return true;
    }
  });

  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem('transitops_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  // Sync state changes with localStorage
  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Dynamically recalculate notifications whenever vehicles, drivers, or maintenance logs change
      if (updates.drivers || updates.vehicles || updates.maintenanceLogs) {
        const freshNotis = generateSystemNotifications(
          newState.drivers,
          newState.vehicles,
          newState.maintenanceLogs
        );
        // Retain "read" state from current notifications if applicable
        newState.notifications = freshNotis.map(gn => {
          const matched = prev.notifications.find(pn => pn.id === gn.id);
          return matched ? { ...gn, read: matched.read } : gn;
        });
      }

      saveState(newState);
      return newState;
    });
  };

  const handleLogin = (user: User) => {
    updateState({ currentUser: user });
  };

  const handleLogout = () => {
    updateState({ currentUser: null });
  };

  const handleRoleSwitch = (newRole: Role) => {
    if (!state.currentUser) return;
    const mockNames: Record<Role, string> = {
      FleetManager: 'Elena Rostova (Fleet Mgr)',
      Driver: 'Marcus Miller (Dispatcher/Driver)',
      SafetyOfficer: 'Officer Sarah Chen (Safety)',
      FinancialAnalyst: 'David Vance (Finance)'
    };
    const updatedUser: User = {
      email: state.currentUser.email,
      name: mockNames[newRole] || state.currentUser.name,
      role: newRole
    };
    updateState({ currentUser: updatedUser });
  };

  // Notification Helpers
  const unreadNotisCount = state.notifications.filter(n => !n.read).length;
  
  const handleMarkNotisAsRead = () => {
    const readNotis = state.notifications.map(n => ({ ...n, read: true }));
    updateState({ notifications: readNotis });
  };

  // VECHILE WORKFLOWS (CRUD)
  const handleAddVehicle = (newVehicle: Vehicle) => {
    const exists = state.vehicles.some(v => v.registrationNumber === newVehicle.registrationNumber);
    if (exists) return false;

    const updated = [newVehicle, ...state.vehicles];
    updateState({ vehicles: updated });
    return true;
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    const updated = state.vehicles.map(v => 
      v.registrationNumber === updatedVehicle.registrationNumber ? updatedVehicle : v
    );
    updateState({ vehicles: updated });
  };

  const handleDeleteVehicle = (regNum: string) => {
    const updated = state.vehicles.filter(v => v.registrationNumber !== regNum);
    updateState({ vehicles: updated });
  };

  // DRIVER WORKFLOWS (CRUD)
  const handleAddDriver = (newDriver: Driver) => {
    const exists = state.drivers.some(d => d.licenseNumber === newDriver.licenseNumber);
    if (exists) return false;

    const updated = [newDriver, ...state.drivers];
    updateState({ drivers: updated });
    return true;
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    const updated = state.drivers.map(d => 
      d.licenseNumber === updatedDriver.licenseNumber ? updatedDriver : d
    );
    updateState({ drivers: updated });
  };

  const handleDeleteDriver = (licenseNum: string) => {
    const updated = state.drivers.filter(d => d.licenseNumber !== licenseNum);
    updateState({ drivers: updated });
  };

  // TRIP DISPATCH WORKFLOWS
  const handleCreateTrip = (newTrip: Trip) => {
    const updated = [newTrip, ...state.trips];
    updateState({ trips: updated });
  };

  const handleDispatchTrip = (tripId: string) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    // Update Trip status to Dispatched
    const updatedTrips = state.trips.map(t => 
      t.id === tripId ? { ...t, status: 'Dispatched' as const, dispatchedAt: new Date().toISOString() } : t
    );

    // Update Vehicle status to 'On Trip'
    const updatedVehicles = state.vehicles.map(v => 
      v.registrationNumber === trip.vehicleId ? { ...v, status: 'On Trip' as const } : v
    );

    // Update Driver status to 'On Trip'
    const updatedDrivers = state.drivers.map(d => 
      d.licenseNumber === trip.driverId ? { ...d, status: 'On Trip' as const } : d
    );

    updateState({
      trips: updatedTrips,
      vehicles: updatedVehicles,
      drivers: updatedDrivers
    });
  };

  const handleCompleteTrip = (tripId: string, finalOdom: number, fuelCons: number) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    // 1. Update Trip
    const updatedTrips = state.trips.map(t => 
      t.id === tripId 
        ? { 
            ...t, 
            status: 'Completed' as const, 
            completedAt: new Date().toISOString(), 
            finalOdometer: finalOdom,
            fuelConsumed: fuelCons
          } 
        : t
    );

    // 2. Update Vehicle Odometer & Restore to Available
    const updatedVehicles = state.vehicles.map(v => 
      v.registrationNumber === trip.vehicleId 
        ? { ...v, status: 'Available' as const, odometer: finalOdom } 
        : v
    );

    // 3. Restore Driver to Available
    const updatedDrivers = state.drivers.map(d => 
      d.licenseNumber === trip.driverId ? { ...d, status: 'Available' as const } : d
    );

    // 4. Automatically generate a Fuel Log expense
    const fuelPricePerLiter = 1.50; // reasonable average price
    const fuelCostComputed = Math.round(fuelCons * fuelPricePerLiter);
    const newFuelLog: FuelLog = {
      id: `FUEL-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: trip.vehicleId,
      date: new Date().toISOString().split('T')[0],
      liters: fuelCons,
      cost: fuelCostComputed,
      odometer: finalOdom
    };
    const updatedFuelLogs = [newFuelLog, ...state.fuelLogs];

    updateState({
      trips: updatedTrips,
      vehicles: updatedVehicles,
      drivers: updatedDrivers,
      fuelLogs: updatedFuelLogs
    });
  };

  const handleCancelTrip = (tripId: string) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    const isCurrentlyDispatched = trip.status === 'Dispatched';

    // Update Trip status to Cancelled
    const updatedTrips = state.trips.map(t => 
      t.id === tripId ? { ...t, status: 'Cancelled' as const } : t
    );

    let updatedVehicles = state.vehicles;
    let updatedDrivers = state.drivers;

    // If it was already actively dispatched, restore vehicle and driver status back to Available
    if (isCurrentlyDispatched) {
      updatedVehicles = state.vehicles.map(v => 
        v.registrationNumber === trip.vehicleId ? { ...v, status: 'Available' as const } : v
      );
      updatedDrivers = state.drivers.map(d => 
        d.licenseNumber === trip.driverId ? { ...d, status: 'Available' as const } : d
      );
    }

    updateState({
      trips: updatedTrips,
      vehicles: updatedVehicles,
      drivers: updatedDrivers
    });
  };

  // MAINTENANCE WORKFLOWS
  const handleCreateMaintenanceLog = (newLog: MaintenanceLog) => {
    const updatedLogs = [newLog, ...state.maintenanceLogs];

    // Automatically set vehicle status to 'In Shop'
    const updatedVehicles = state.vehicles.map(v => 
      v.registrationNumber === newLog.vehicleId ? { ...v, status: 'In Shop' as const } : v
    );

    updateState({
      maintenanceLogs: updatedLogs,
      vehicles: updatedVehicles
    });
  };

  const handleCloseMaintenanceLog = (logId: string, endDate: string, cost: number, notes: string) => {
    const log = state.maintenanceLogs.find(m => m.id === logId);
    if (!log) return;

    const updatedLogs = state.maintenanceLogs.map(m => 
      m.id === logId ? { ...m, status: 'Closed' as const, endDate, cost, notes } : m
    );

    // Restore vehicle status back to 'Available' (unless it was retired)
    const updatedVehicles = state.vehicles.map(v => {
      if (v.registrationNumber === log.vehicleId) {
        return v.status === 'Retired' ? v : { ...v, status: 'Available' as const };
      }
      return v;
    });

    updateState({
      maintenanceLogs: updatedLogs,
      vehicles: updatedVehicles
    });
  };

  // COST LOGS WORKFLOWS
  const handleAddFuelLog = (newFuelLog: FuelLog) => {
    const updated = [newFuelLog, ...state.fuelLogs];
    updateState({ fuelLogs: updated });
  };

  const handleAddExpense = (newExpense: Expense) => {
    const updated = [newExpense, ...state.expenses];
    updateState({ expenses: updated });
  };

  // Unauthenticated routing guards
  if (!state.currentUser) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  const user = state.currentUser;

  // Sidebar list of navigation tabs
  const navigationTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', name: 'Fleet Registry', icon: Truck },
    { id: 'drivers', name: 'Driver Roster', icon: Users },
    { id: 'trips', name: 'Dispatch Control', icon: Navigation },
    { id: 'maintenance', name: 'Workshop Logs', icon: Wrench },
    { id: 'expenses', name: 'Cost Logs', icon: Calculator },
    { id: 'documents', name: 'Safety & Docs', icon: FileText },
    { id: 'reports', name: 'Executive Reports', icon: FileSpreadsheet },
  ];

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-200`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'bg-zinc-950/90 border-zinc-900' : 'bg-white/90 border-zinc-200'} backdrop-blur-md flex items-center justify-between px-6 py-3.5 shadow-xs print:hidden`}>
        {/* Left Brand Area */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="p-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl shadow-xs shrink-0">
            <Truck className="h-5 w-5 text-zinc-400" />
          </div>
          <span className="text-xl tracking-[4px] font-display uppercase font-semibold text-zinc-900 dark:text-zinc-100">TransitOps</span>
        </div>

        {/* Right Controls & Role Switcher */}
        <div className="flex items-center gap-4">
          {/* RBAC Role Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="hidden md:inline text-[10px] uppercase font-extrabold text-zinc-400 dark:text-zinc-500 px-2 tracking-wider">
              RBAC Scope
            </span>
            <select
              value={user.role}
              onChange={(e) => handleRoleSwitch(e.target.value as Role)}
              className="bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-100 font-bold px-2.5 py-1.5 rounded-lg border-0 focus:outline-hidden focus:ring-1 focus:ring-zinc-700 cursor-pointer shadow-xs"
            >
              <option value="FleetManager">Fleet Manager</option>
              <option value="Driver">Driver / Coordinator</option>
              <option value="SafetyOfficer">Safety Officer</option>
              <option value="FinancialAnalyst">Financial Analyst</option>
            </select>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Toggle theme mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notification bell and indicator */}
          <div className="relative">
            <button
              onClick={() => { setIsNotiOpen(!isNotiOpen); handleMarkNotisAsRead(); }}
              className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="View system compliance alerts"
            >
              <Bell className="h-4 w-4" />
              {unreadNotisCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-black text-[9px] animate-pulse">
                  {unreadNotisCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            <AnimatePresence>
              {isNotiOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotiOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2.5 w-80 max-h-96 z-50 rounded-xl border p-4 shadow-xl overflow-y-auto ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-150 dark:border-slate-700">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Logistics Compliance Center
                      </h4>
                      <button
                        onClick={() => setIsNotiOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {state.notifications.map(noti => {
                        let iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40';
                        if (noti.type === 'warning') iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40';
                        if (noti.type === 'success') iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';

                        return (
                          <div key={noti.id} className="flex gap-2 text-xs font-medium leading-normal items-start p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div className={`p-1.5 rounded-md shrink-0 ${iconColor}`}>
                              {noti.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{noti.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{noti.message}</p>
                            </div>
                          </div>
                        );
                      })}

                      {state.notifications.length === 0 && (
                        <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                          <p className="text-xs font-bold">All systems compliant</p>
                          <p className="text-[10px] mt-0.5">No expired CDLs or open garage alarms.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User profile details & Logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-black text-zinc-800 dark:text-zinc-100">{user.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer"
              title="Log Out of system"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Structural Body */}
      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <aside className={`hidden md:block w-64 min-h-[calc(100vh-69px)] border-r ${isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'} p-4 space-y-2 shrink-0 print:hidden`}>
          <div className="p-2 mb-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-zinc-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">Scope: {user.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-xs' 
                      : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-100'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className={`fixed top-0 bottom-0 left-0 w-64 z-50 border-r p-4 space-y-4 md:hidden flex flex-col ${isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-zinc-900 text-white border border-zinc-800 rounded-lg">
                      <Truck className="h-5 w-5" />
                    </div>
                    <span className="text-lg tracking-[3px] font-display uppercase font-semibold text-zinc-900 dark:text-white">TransitOps</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1 flex-1">
                  {navigationTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-xs' 
                            : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-100'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{user.role}</p>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Workspace Active View Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-full overflow-hidden print:p-0">
          {/* RBAC specific top scope warning banner */}
          <div className="mb-6 bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between text-xs font-medium print:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
              <span className="text-zinc-300">
                Active Role scope: <strong className="text-white font-bold">{user.role}</strong>. 
                {user.role === 'FleetManager' && " Full administrative clearance for all fleet CRUD operations."}
                {user.role === 'Driver' && " Dispatch focus enabled. Complete active routes and log actuals."}
                {user.role === 'SafetyOfficer' && " Safety roster priority. Filter driver CDL and compliance validations."}
                {user.role === 'FinancialAnalyst' && " Finance Ledger active. View operational costs, expenses and ROI breakdowns."}
              </span>
            </div>
            <span className="hidden sm:inline bg-zinc-800 text-zinc-300 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-zinc-700">
              RBAC Verified
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  vehicles={state.vehicles}
                  drivers={state.drivers}
                  trips={state.trips}
                  maintenanceLogs={state.maintenanceLogs}
                  fuelLogs={state.fuelLogs}
                  expenses={state.expenses}
                />
              )}

              {activeTab === 'vehicles' && (
                <VehicleRegistryView
                  vehicles={state.vehicles}
                  onAddVehicle={handleAddVehicle}
                  onUpdateVehicle={handleUpdateVehicle}
                  onDeleteVehicle={handleDeleteVehicle}
                  userRole={user.role}
                />
              )}

              {activeTab === 'drivers' && (
                <DriverManagementView
                  drivers={state.drivers}
                  onAddDriver={handleAddDriver}
                  onUpdateDriver={handleUpdateDriver}
                  onDeleteDriver={handleDeleteDriver}
                  userRole={user.role}
                />
              )}

              {activeTab === 'trips' && (
                <TripManagementView
                  trips={state.trips}
                  vehicles={state.vehicles}
                  drivers={state.drivers}
                  onCreateTrip={handleCreateTrip}
                  onDispatchTrip={handleDispatchTrip}
                  onCompleteTrip={handleCompleteTrip}
                  onCancelTrip={handleCancelTrip}
                  userRole={user.role}
                />
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceView
                  maintenanceLogs={state.maintenanceLogs}
                  vehicles={state.vehicles}
                  onCreateLog={handleCreateMaintenanceLog}
                  onCloseLog={handleCloseMaintenanceLog}
                  userRole={user.role}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesView
                  fuelLogs={state.fuelLogs}
                  expenses={state.expenses}
                  maintenanceLogs={state.maintenanceLogs}
                  vehicles={state.vehicles}
                  onAddFuelLog={handleAddFuelLog}
                  onAddExpense={handleAddExpense}
                  userRole={user.role}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsView
                  vehicles={state.vehicles}
                  userRole={user.role}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  vehicles={state.vehicles}
                  drivers={state.drivers}
                  trips={state.trips}
                  maintenanceLogs={state.maintenanceLogs}
                  fuelLogs={state.fuelLogs}
                  expenses={state.expenses}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
