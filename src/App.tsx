import React, { useState } from 'react';
import { Shield, Users, Laptop, FileText, AlertTriangle } from 'lucide-react';
import { User, Device, AccessLog, SecurityPolicy } from './types';
import { users, devices, policies } from './data';

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);

  const checkAccess = () => {
    if (!selectedUser || !selectedDevice) return;

    const applicablePolicy = policies.find(policy => 
      policy.roles.includes(selectedUser.role) &&
      policy.deviceTypes.includes(selectedDevice.type)
    );

    const accessGranted = applicablePolicy && 
      (!applicablePolicy.requirements.complianceRequired || selectedDevice.compliance) &&
      applicablePolicy.requirements.allowedDepartments.includes(selectedUser.department);

    const newLog: AccessLog = {
      timestamp: new Date(),
      userId: selectedUser.id,
      deviceId: selectedDevice.id,
      action: accessGranted ? 'granted' : 'denied',
      reason: !accessGranted ? 'Policy requirements not met' : undefined
    };

    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Network Access Control System</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Select User</h2>
            </div>
            <div className="space-y-2">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    Role: {user.role} | Department: {user.department}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Laptop className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Select Device</h2>
            </div>
            <div className="space-y-2">
              {devices.map(device => (
                <div
                  key={device.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedDevice?.id === device.id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="font-medium">{device.type}</div>
                  <div className="text-sm text-gray-500">
                    OS: {device.os} | Compliance: {device.compliance ? '✓' : '✗'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Access Check Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={checkAccess}
            disabled={!selectedUser || !selectedDevice}
            className={`px-6 py-2 rounded-md font-medium ${
              !selectedUser || !selectedDevice
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Check Access
          </button>
        </div>

        {/* Access Logs */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Access Logs</h2>
          </div>
          <div className="space-y-3">
            {logs.map((log, index) => {
              const user = users.find(u => u.id === log.userId);
              const device = devices.find(d => d.id === log.deviceId);
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    log.action === 'granted' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {log.action === 'denied' && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {user?.name} - {device?.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {log.action.toUpperCase()} - {log.timestamp.toLocaleString()}
                  </div>
                  {log.reason && (
                    <div className="text-sm text-red-600 mt-1">{log.reason}</div>
                  )}
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No access attempts logged yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;