export type Role = 'FleetManager' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst';

export interface User {
  email: string;
  name: string;
  role: Role;
}

export interface AppSettings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

export type VehicleType = 'Semi-Truck' | 'Heavy Duty' | 'Delivery Van' | 'EV Cargo' | 'Support Sedan';
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export interface Vehicle {
  registrationNumber: string; // unique
  name: string;
  type: VehicleType;
  maxCapacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number; // in USD
  status: VehicleStatus;
  region: 'North' | 'South' | 'East' | 'West';
}

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export interface Driver {
  licenseNumber: string; // unique
  name: string;
  licenseCategory: 'Class A CDL' | 'Class B CDL' | 'Class C' | 'Standard';
  licenseExpiryDate: string; // YYYY-MM-DD
  contactNumber: string;
  safetyScore: number; // 0-100
  status: DriverStatus;
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string; // vehicle reg number
  driverId: string; // driver license number
  cargoWeight: number; // kg
  plannedDistance: number; // km
  revenue: number; // USD
  status: TripStatus;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  finalOdometer?: number;
  fuelConsumed?: number; // liters
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  issue: string;
  cost: number;
  status: 'Open' | 'Closed';
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  odometer: number;
}

export interface Expense {
  id: string;
  vehicleId: string;
  date: string;
  category: 'Toll' | 'Permit' | 'Insurance' | 'Fines' | 'Other';
  cost: number;
  description: string;
}

export interface SystemNotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
}
