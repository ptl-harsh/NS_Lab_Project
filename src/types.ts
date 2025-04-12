export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  department: string;
}

export interface Device {
  id: string;
  type: 'desktop' | 'laptop' | 'mobile' | 'tablet';
  os: string;
  compliance: boolean;
}

export interface AccessLog {
  timestamp: Date;
  userId: string;
  deviceId: string;
  action: 'granted' | 'denied';
  reason?: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  roles: string[];
  deviceTypes: string[];
  requirements: {
    complianceRequired: boolean;
    allowedDepartments: string[];
  };
}