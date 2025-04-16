import React, { useState, useEffect } from 'react';
import { Shield, Users, Laptop, FileText, AlertTriangle } from 'lucide-react';
import { User, Device, AccessLog } from './types';
import { users, devices, policies } from './data';

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);

  // States for advanced emergency override (admin).
  const [emergencyOverride, setEmergencyOverride] = useState<boolean>(false);
  const [emergencyPassword, setEmergencyPassword] = useState<string>('');
  const [emergency2FACode, setEmergency2FACode] = useState<string>('');
  const [entered2FACode, setEntered2FACode] = useState<string>('');
  const [verify2FA, setVerify2FA] = useState<boolean>(false);
  const [emergencyFailureCount, setEmergencyFailureCount] = useState<number>(0);
  const [emergencyLocked, setEmergencyLocked] = useState<boolean>(false);

  // States for regular user email verification.
  const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState<string>('');
  const [enteredEmailVerificationCode, setEnteredEmailVerificationCode] = useState<string>('');
  const [manualVerificationEmail, setManualVerificationEmail] = useState<string>('');

  const [filter, setFilter] = useState<'all' | 'granted' | 'denied'>('all');

  // Helper function to generate a random 6-digit code.
  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  // (Removed auto-verification useEffect in order to let the user manually verify)

  const checkAccess = () => {
    if (!selectedUser || !selectedDevice) return;

    let accessGranted = false;
    let reason: string | undefined = undefined;

    // Emergency override for admin.
    if (selectedUser.role === 'admin' && emergencyOverride) {
      if (emergencyLocked) {
        accessGranted = false;
        reason = 'Emergency override is locked due to multiple failed attempts. Please wait before retrying.';
      } else if (selectedDevice.type === 'mobile') {
        if (emergencyPassword !== '123456') {
          const newFailureCount = emergencyFailureCount + 1;
          setEmergencyFailureCount(newFailureCount);
          if (newFailureCount >= 3) {
            setEmergencyLocked(true);
            reason = 'Too many failed emergency override attempts. Emergency override locked for 60 seconds.';
            setTimeout(() => {
              setEmergencyLocked(false);
              setEmergencyFailureCount(0);
            }, 60000);
          } else {
            reason = 'Invalid emergency override password for mobile access.';
          }
          accessGranted = false;
        } else if (!verify2FA) {
          const code = generateCode();
          setEmergency2FACode(code);
          setVerify2FA(true);
          reason = `2FA required. Your 2FA code is: ${code}`;
          accessGranted = false;
        } else {
          if (entered2FACode !== emergency2FACode) {
            accessGranted = false;
            reason = 'Invalid 2FA code.';
          } else {
            accessGranted = true;
            reason = 'Emergency override activated on mobile with valid password and 2FA.';
            setEmergencyFailureCount(0);
            setVerify2FA(false);
            setEntered2FACode('');
            setEmergency2FACode('');
          }
        }
      } else {
        accessGranted = true;
        reason = 'Emergency override activated. Access granted regardless of policy.';
      }
    } else {
      // For regular users on desktop/laptop, enforce email verification.
      if (
        selectedUser.role === 'user' &&
        (selectedDevice.type === 'desktop' || selectedDevice.type === 'laptop')
      ) {
        if (!selectedUser.isEmailVerified) {
          accessGranted = false;
          reason = 'Access denied: Email verification required for regular users.';
          logAccess(reason);
          return;
        }
      }
      
      // Normal policy check.
      const applicablePolicy = policies.find(policy =>
        policy.roles.includes(selectedUser.role) &&
        policy.deviceTypes.includes(selectedDevice.type)
      );

      accessGranted = Boolean(
        applicablePolicy &&
          (!applicablePolicy.requirements.complianceRequired || selectedDevice.compliance) &&
          applicablePolicy.requirements.allowedDepartments.includes(selectedUser.department)
      );

      if (accessGranted && applicablePolicy?.requirements.allowedHours) {
        const currentHour = new Date().getHours();
        const [startHour, endHour] = applicablePolicy.requirements.allowedHours;
        if (currentHour < startHour || currentHour >= endHour) {
          accessGranted = false;
          reason = `Access allowed only between ${startHour}:00 and ${endHour}:00 hours.`;
        }
      }

      if (!accessGranted && !reason) {
        reason = 'Policy requirements not met.';
      }
    }

    logAccess(reason, accessGranted);
  };

  // Helper function to log access attempts.
  const logAccess = (reason?: string, accessGranted: boolean = false) => {
    if (!selectedUser || !selectedDevice) return;
    const newLog: AccessLog = {
      timestamp: new Date(),
      userId: selectedUser.id,
      deviceId: selectedDevice.id,
      action: accessGranted ? 'granted' : 'denied',
      reason,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Function to send email verification code to regular users.
  const sendEmailVerification = () => {
    const code = generateCode();
    setEmailVerificationCode(code);
    setEmailVerificationSent(true);
    // For demo purposes, show the code in an alert.
    alert(`Your email verification code is: ${code}`);
  };

  // Function to verify email code.
  const verifyEmail = () => {
    if (enteredEmailVerificationCode === emailVerificationCode) {
      if (selectedUser) {
        const updatedUser = { ...selectedUser, isEmailVerified: true };
        setSelectedUser(updatedUser);
      }
      setEmailVerificationSent(false);
      setEmailVerificationCode('');
      setEnteredEmailVerificationCode('');
      alert('Email verified successfully via code!');
    } else {
      alert('Invalid verification code.');
    }
  };

  // Analytics calculations.
  const totalAttempts = logs.length;
  const grantedCount = logs.filter(log => log.action === 'granted').length;
  const deniedCount = logs.filter(log => log.action === 'denied').length;
  const successRate = totalAttempts > 0 ? ((grantedCount / totalAttempts) * 100).toFixed(2) : '0';

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.action === filter;
  });

  // Function to export logs as CSV.
  const exportLogs = () => {
    const headers = ['Timestamp', 'User ID', 'Device ID', 'Action', 'Reason'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log =>
        [
          log.timestamp.toLocaleString(),
          log.userId,
          log.deviceId,
          log.action,
          log.reason ? `"${log.reason}"` : ''
        ].join(',')
      )
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "access_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset 2FA state when emergency override is deactivated.
  useEffect(() => {
    if (!emergencyOverride) {
      setVerify2FA(false);
      setEmergency2FACode('');
      setEntered2FACode('');
    }
  }, [emergencyOverride]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
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
                  onClick={() => {
                    setSelectedUser(user);
                    // Reset all override and verification states.
                    setEmergencyOverride(false);
                    setEmergencyPassword('');
                    setEmergencyFailureCount(0);
                    setEmergencyLocked(false);
                    setVerify2FA(false);
                    setEmergency2FACode('');
                    setEntered2FACode('');
                    // Reset email verification states.
                    setEmailVerificationSent(false);
                    setEmailVerificationCode('');
                    setEnteredEmailVerificationCode('');
                    setManualVerificationEmail('');
                  }}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    Role: {user.role} | Department: {user.department}
                  </div>
                  <div className="text-sm text-gray-500">
                    Email: {user.email} {user.role === 'user' && !user.isEmailVerified && '(Not Verified)'}
                  </div>
                </div>
              ))}
            </div>
            {/* For regular users with unverified email on desktop/laptop, show email verification panel */}
            {selectedUser?.role === 'user' &&
              !selectedUser.isEmailVerified &&
              selectedDevice &&
              (selectedDevice.type === 'desktop' || selectedDevice.type === 'laptop') && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold mb-2">Email Verification</h3>
                  {/* Option 1: Code-based verification */}
                  {emailVerificationSent ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter verification code"
                        value={enteredEmailVerificationCode}
                        onChange={(e) => setEnteredEmailVerificationCode(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={verifyEmail}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Verify Code
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={sendEmailVerification}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send Verification Code
                    </button>
                  )}
                  {/* Option 2: Manual Verification */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Enter email for manual verification"
                      value={manualVerificationEmail}
                      onChange={(e) => setManualVerificationEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => {
                        if (manualVerificationEmail.toLowerCase() === 'harsh@nitp.ac.in') {
                          if (selectedUser) {
                            const updatedUser = { ...selectedUser, isEmailVerified: true };
                            setSelectedUser(updatedUser);
                          }
                          alert("Email manually verified successfully!");
                          setManualVerificationEmail('');
                        } else {
                          alert("Email does not match. Please try again.");
                        }
                      }}
                      className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Manually Verify
                    </button>
                  </div>
                </div>
              )}
            {/* Emergency override controls for admin */}
            {selectedUser?.role === 'admin' && (
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emergencyOverride}
                    onChange={(e) => {
                      if (emergencyLocked) return;
                      setEmergencyOverride(e.target.checked);
                    }}
                    className="mr-2"
                    id="emergencyOverride"
                    disabled={emergencyLocked}
                  />
                  <label htmlFor="emergencyOverride" className="text-sm text-red-600 font-medium">
                    Activate Emergency Access Override
                  </label>
                </div>
                {emergencyOverride && selectedDevice?.type === 'mobile' && (
                  <div className="mt-2">
                    <input
                      type="password"
                      placeholder="Enter emergency password"
                      value={emergencyPassword}
                      onChange={(e) => setEmergencyPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md mb-2"
                    />
                    {verify2FA && (
                      <div>
                        <input
                          type="text"
                          placeholder="Enter 2FA code"
                          value={entered2FACode}
                          onChange={(e) => setEntered2FACode(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
                {emergencyLocked && (
                  <div className="mt-2 text-sm text-red-500">
                    Emergency override locked due to repeated failed attempts. Please wait 60 seconds.
                  </div>
                )}
              </div>
            )}
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

        {/* Log Filtering and Export */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <label htmlFor="filter" className="mr-2 font-medium text-gray-700">
              Filter Logs:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'granted' | 'denied')}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All</option>
              <option value="granted">Granted</option>
              <option value="denied">Denied</option>
            </select>
          </div>
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export Logs
          </button>
        </div>

        {/* Access Logs */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Access Logs</h2>
          </div>
          <div className="space-y-3">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const user = users.find(u => u.id === log.userId);
                const device = devices.find(d => d.id === log.deviceId);
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-md ${log.action === 'granted' ? 'bg-green-50' : 'bg-red-50'}`}
                  >
                    <div className="flex items-center space-x-2">
                      {log.action === 'denied' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      <span className="font-medium">{user?.name} - {device?.type}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {log.action.toUpperCase()} - {log.timestamp.toLocaleString()}
                    </div>
                    {log.reason && (
                      <div className="text-sm text-red-600 mt-1">{log.reason}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-center py-4">
                No access attempts logged yet
              </div>
            )}
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Analytics Dashboard</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded">
              <div className="font-medium">Total Attempts</div>
              <div>{totalAttempts}</div>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <div className="font-medium">Granted</div>
              <div>{grantedCount}</div>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <div className="font-medium">Denied</div>
              <div>{deniedCount}</div>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <div className="font-medium">Success Rate</div>
              <div>{successRate}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
