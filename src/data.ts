import { User, Device, SecurityPolicy } from './types';

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    email: 'admin@company.com',
    isEmailVerified: true,
  },
  {
    id: '2',
    name: 'Regular User',
    role: 'user',
    department: 'Sales',
    email: 'harsh@nitp.ac.in', // For demonstration this regular user email is set to the one for automatic verification.
    isEmailVerified: false,   // This flag will be updated automatically.
  },
  {
    id: '3',
    name: 'Guest User',
    role: 'guest',
    department: 'External',
    email: 'guest@external.com',
    isEmailVerified: true,
  },
];

export const devices: Device[] = [
  { id: '1', type: 'desktop', os: 'Windows 11', compliance: true },
  { id: '2', type: 'laptop', os: 'macOS', compliance: true },
  { id: '3', type: 'mobile', os: 'iOS', compliance: false },
];

export const policies: SecurityPolicy[] = [
  {
    id: '1',
    name: 'Admin Access Policy',
    roles: ['admin'],
    deviceTypes: ['desktop', 'laptop'],
    requirements: {
      complianceRequired: true,
      allowedDepartments: ['IT'],
    },
  },
  {
    id: '2',
    name: 'General Access Policy',
    roles: ['user'],
    deviceTypes: ['desktop', 'laptop', 'mobile', 'tablet'],
    requirements: {
      complianceRequired: true,
      allowedDepartments: ['IT', 'Sales', 'Marketing'],
      allowedHours: [9, 17], // Access allowed between 09:00 and 17:00.
    },
  },
  {
    id: '3',
    name: 'Guest Access Policy',
    roles: ['guest'],
    deviceTypes: ['mobile', 'tablet'],
    requirements: {
      complianceRequired: false,
      allowedDepartments: ['External'],
    },
  },
];
