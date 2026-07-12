import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, SystemNotification, User } from '../types';
import {
  SEED_VEHICLES,
  SEED_DRIVERS,
  SEED_TRIPS,
  SEED_MAINTENANCE,
  SEED_FUEL_LOGS,
  SEED_EXPENSES
} from './seedData';

// Constants for LocalStorage keys
const STORAGE_PREFIX = 'transitops_';
const KEYS = {
  VEHICLES: `${STORAGE_PREFIX}vehicles`,
  DRIVERS: `${STORAGE_PREFIX}drivers`,
  TRIPS: `${STORAGE_PREFIX}trips`,
  MAINTENANCE: `${STORAGE_PREFIX}maintenance`,
  FUEL: `${STORAGE_PREFIX}fuel`,
  EXPENSES: `${STORAGE_PREFIX}expenses`,
  CURRENT_USER: `${STORAGE_PREFIX}user`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`
};

export interface TransitState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  notifications: SystemNotification[];
  currentUser: User | null;
}

// Check driver license status and generate alerts
export function generateSystemNotifications(
  drivers: Driver[],
  vehicles: Vehicle[],
  maintenance: MaintenanceLog[]
): SystemNotification[] {
  const notifications: SystemNotification[] = [];
  const currentDate = new Date('2026-07-11'); // Anchored on current local time in metadata

  // 1. Expired/Expiring driver licenses
  drivers.forEach(driver => {
    const expiry = new Date(driver.licenseExpiryDate);
    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      notifications.push({
        id: `noti-exp-${driver.licenseNumber}`,
        type: 'warning',
        title: 'Expired License CDL',
        message: `Driver ${driver.name} has an EXPIRED license (${driver.licenseExpiryDate})! Assignment is blocked.`,
        date: '2026-07-11',
        read: false
      });
    } else if (diffDays <= 30) {
      notifications.push({
        id: `noti-warn-${driver.licenseNumber}`,
        type: 'info',
        title: 'License Expiring Soon',
        message: `Driver ${driver.name}'s license expires in ${diffDays} days (${driver.licenseExpiryDate}).`,
        date: '2026-07-11',
        read: false
      });
    }
  });

  // 2. High cost maintenance logs
  maintenance.forEach(log => {
    if (log.status === 'Open' && log.cost > 1000) {
      notifications.push({
        id: `noti-mnt-${log.id}`,
        type: 'warning',
        title: 'High-Cost Active Maintenance',
        message: `Vehicle ${log.vehicleId} is undergoing high-cost maintenance ($${log.cost}).`,
        date: '2026-07-11',
        read: false
      });
    }
  });

  // 3. Vehicles in shop
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;
  if (inShopCount > 1) {
    notifications.push({
      id: 'noti-shop-limit',
      type: 'info',
      title: 'Elevated Garage Load',
      message: `${inShopCount} vehicles are currently "In Shop" for repairs, reducing dispatch capacity.`,
      date: '2026-07-11',
      read: false
    });
  }

  return notifications;
}

export function loadInitialState(): TransitState {
  const getStorage = <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const vehicles = getStorage<Vehicle[]>(KEYS.VEHICLES, SEED_VEHICLES);
  const drivers = getStorage<Driver[]>(KEYS.DRIVERS, SEED_DRIVERS);
  const trips = getStorage<Trip[]>(KEYS.TRIPS, SEED_TRIPS);
  const maintenanceLogs = getStorage<MaintenanceLog[]>(KEYS.MAINTENANCE, SEED_MAINTENANCE);
  const fuelLogs = getStorage<FuelLog[]>(KEYS.FUEL, SEED_FUEL_LOGS);
  const expenses = getStorage<Expense[]>(KEYS.EXPENSES, SEED_EXPENSES);
  
  // Default login: FleetManager
  const currentUser = getStorage<User | null>(KEYS.CURRENT_USER, null);

  // Generate notifications dynamically
  const generatedNotis = generateSystemNotifications(drivers, vehicles, maintenanceLogs);
  const savedNotis = getStorage<SystemNotification[]>(KEYS.NOTIFICATIONS, []);
  
  // Merge notifications - keep read status if already existed
  const notifications = generatedNotis.map(gn => {
    const existing = savedNotis.find(sn => sn.id === gn.id);
    return existing ? { ...gn, read: existing.read } : gn;
  });

  return {
    vehicles,
    drivers,
    trips,
    maintenanceLogs,
    fuelLogs,
    expenses,
    notifications,
    currentUser
  };
}

export function saveState(state: Partial<TransitState>) {
  const setStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  };

  if (state.vehicles) setStorage(KEYS.VEHICLES, state.vehicles);
  if (state.drivers) setStorage(KEYS.DRIVERS, state.drivers);
  if (state.trips) setStorage(KEYS.TRIPS, state.trips);
  if (state.maintenanceLogs) setStorage(KEYS.MAINTENANCE, state.maintenanceLogs);
  if (state.fuelLogs) setStorage(KEYS.FUEL, state.fuelLogs);
  if (state.expenses) setStorage(KEYS.EXPENSES, state.expenses);
  if (state.currentUser !== undefined) setStorage(KEYS.CURRENT_USER, state.currentUser);
  if (state.notifications) setStorage(KEYS.NOTIFICATIONS, state.notifications);
}
