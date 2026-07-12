import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, User } from '../types';

export const SEED_USERS: User[] = [
  { email: 'manager@transitops.com', name: 'Elena Rostova', role: 'FleetManager' },
  { email: 'driver@transitops.com', name: 'Marcus Miller', role: 'Driver' },
  { email: 'safety@transitops.com', name: 'Officer Sarah Chen', role: 'SafetyOfficer' },
  { email: 'finance@transitops.com', name: 'David Vance', role: 'FinancialAnalyst' }
];

export const SEED_VEHICLES: Vehicle[] = [
  {
    registrationNumber: 'TRK-901',
    name: 'Volvo FH16 Semi',
    type: 'Semi-Truck',
    maxCapacity: 25000,
    odometer: 145200,
    acquisitionCost: 135000,
    status: 'Available',
    region: 'North'
  },
  {
    registrationNumber: 'VAN-05',
    name: 'Ford Transit Cargo Van',
    type: 'Delivery Van',
    maxCapacity: 1500,
    odometer: 48900,
    acquisitionCost: 42000,
    status: 'Available',
    region: 'West'
  },
  {
    registrationNumber: 'TRK-302',
    name: 'Peterbilt 579 Heavy Duty',
    type: 'Heavy Duty',
    maxCapacity: 30000,
    odometer: 289400,
    acquisitionCost: 160000,
    status: 'On Trip',
    region: 'East'
  },
  {
    registrationNumber: 'EV-88',
    name: 'Rivian EDV 700',
    type: 'EV Cargo',
    maxCapacity: 1200,
    odometer: 12400,
    acquisitionCost: 75000,
    status: 'In Shop',
    region: 'South'
  },
  {
    registrationNumber: 'TRK-554',
    name: 'Freightliner Cascadia',
    type: 'Semi-Truck',
    maxCapacity: 24000,
    odometer: 312500,
    acquisitionCost: 120000,
    status: 'Retired',
    region: 'North'
  }
];

export const SEED_DRIVERS: Driver[] = [
  {
    licenseNumber: 'DL-A8827',
    name: 'Marcus Miller',
    licenseCategory: 'Class A CDL',
    licenseExpiryDate: '2027-11-20',
    contactNumber: '+1 (555) 123-4567',
    safetyScore: 94,
    status: 'Available'
  },
  {
    licenseNumber: 'DL-B1104',
    name: 'Sarah Connor',
    licenseCategory: 'Class B CDL',
    licenseExpiryDate: '2026-09-15',
    contactNumber: '+1 (555) 987-6543',
    safetyScore: 98,
    status: 'On Trip'
  },
  {
    licenseNumber: 'DL-A4491',
    name: 'John Doe',
    licenseCategory: 'Class A CDL',
    licenseExpiryDate: '2026-05-10', // Expired based on current local time 2026-07-11
    contactNumber: '+1 (555) 246-8101',
    safetyScore: 72,
    status: 'Available'
  },
  {
    licenseNumber: 'DL-C9381',
    name: 'Carlos Santana',
    licenseCategory: 'Class C',
    licenseExpiryDate: '2028-01-30',
    contactNumber: '+1 (555) 369-2580',
    safetyScore: 85,
    status: 'Off Duty'
  },
  {
    licenseNumber: 'DL-S2204',
    name: 'Robert Williams',
    licenseCategory: 'Class A CDL',
    licenseExpiryDate: '2026-12-05',
    contactNumber: '+1 (555) 741-8529',
    safetyScore: 45, // Low safety score
    status: 'Suspended'
  }
];

export const SEED_TRIPS: Trip[] = [
  {
    id: 'TRP-1001',
    source: 'Seattle, WA',
    destination: 'San Francisco, CA',
    vehicleId: 'TRK-302',
    driverId: 'DL-B1104',
    cargoWeight: 18000,
    plannedDistance: 1300,
    revenue: 4200,
    status: 'Dispatched',
    createdAt: '2026-07-10T08:00:00Z',
    dispatchedAt: '2026-07-10T10:00:00Z'
  },
  {
    id: 'TRP-1002',
    source: 'Los Angeles, CA',
    destination: 'Las Vegas, NV',
    vehicleId: 'VAN-05',
    driverId: 'DL-A8827',
    cargoWeight: 800,
    plannedDistance: 430,
    revenue: 1200,
    status: 'Draft',
    createdAt: '2026-07-11T12:30:00Z'
  },
  {
    id: 'TRP-0997',
    source: 'Chicago, IL',
    destination: 'Detroit, MI',
    vehicleId: 'TRK-901',
    driverId: 'DL-A8827',
    cargoWeight: 22000,
    plannedDistance: 450,
    revenue: 2800,
    status: 'Completed',
    createdAt: '2026-07-05T09:00:00Z',
    dispatchedAt: '2026-07-05T10:30:00Z',
    completedAt: '2026-07-05T18:45:00Z',
    finalOdometer: 145200,
    fuelConsumed: 180 // 180 Liters
  },
  {
    id: 'TRP-0998',
    source: 'Dallas, TX',
    destination: 'Houston, TX',
    vehicleId: 'VAN-05',
    driverId: 'DL-C9381',
    cargoWeight: 950,
    plannedDistance: 380,
    revenue: 950,
    status: 'Completed',
    createdAt: '2026-07-08T07:15:00Z',
    dispatchedAt: '2026-07-08T08:00:00Z',
    completedAt: '2026-07-08T13:30:00Z',
    finalOdometer: 48900,
    fuelConsumed: 48 // 48 Liters
  },
  {
    id: 'TRP-0999',
    source: 'New York, NY',
    destination: 'Boston, MA',
    vehicleId: 'TRK-901',
    driverId: 'DL-B1104',
    cargoWeight: 12000,
    plannedDistance: 350,
    revenue: 1800,
    status: 'Cancelled',
    createdAt: '2026-07-09T14:00:00Z'
  }
];

export const SEED_MAINTENANCE: MaintenanceLog[] = [
  {
    id: 'MNT-201',
    vehicleId: 'EV-88',
    issue: 'Battery Degraded & Cooling Fan Malfunction',
    cost: 1850,
    status: 'Open',
    startDate: '2026-07-09',
    notes: 'Awaiting specialized EV technician diagnostics.'
  },
  {
    id: 'MNT-202',
    vehicleId: 'TRK-901',
    issue: 'Regular Scheduled B-Service Oil & Filter replacement',
    cost: 450,
    status: 'Closed',
    startDate: '2026-07-01',
    endDate: '2026-07-02',
    notes: 'Tires checked, all fluids topped off.'
  }
];

export const SEED_FUEL_LOGS: FuelLog[] = [
  {
    id: 'FUEL-501',
    vehicleId: 'TRK-901',
    date: '2026-07-05',
    liters: 180,
    cost: 270, // $1.50 per liter
    odometer: 145200
  },
  {
    id: 'FUEL-502',
    vehicleId: 'VAN-05',
    date: '2026-07-08',
    liters: 48,
    cost: 72,
    odometer: 48900
  }
];

export const SEED_EXPENSES: Expense[] = [
  {
    id: 'EXP-801',
    vehicleId: 'TRK-901',
    date: '2026-07-05',
    category: 'Toll',
    cost: 120,
    description: 'I-90 Eastbound Gantry Pass tolls'
  },
  {
    id: 'EXP-802',
    vehicleId: 'TRK-302',
    date: '2026-07-10',
    category: 'Permit',
    cost: 250,
    description: 'Oversize load highway clearance permit'
  },
  {
    id: 'EXP-803',
    vehicleId: 'VAN-05',
    date: '2026-07-08',
    category: 'Toll',
    cost: 35,
    description: 'Bay Area FastTrak tolls'
  }
];
