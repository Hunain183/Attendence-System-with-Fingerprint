import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, CheckCircle, XCircle, Clock, User, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../../components/ui';
import axios from 'axios';

interface EmployeeInfo {
  employee_no: string;
  name: string;
  department: string | null;
  designation: string | null;
  employment_type: string | null;
}

interface AttendanceResult {
  success: boolean;
  action: 'check_in' | 'check_out';
  employee: EmployeeInfo;
  time: string;
  message: string;
}

export function KioskPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waitingForFingerprint, setWaitingForFingerprint] = useState(true);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear result after 5 seconds
  useEffect(() => {
    if (result || error) {
      const timer = setTimeout(() => {
        setResult(null);
        setError(null);
        setWaitingForFingerprint(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [result, error]);

  // Simulate fingerprint scan (in real scenario, this would be triggered by hardware)
  const handleFingerprintScan = useCallback(async (employeeNo: string) => {
    setScanning(true);
    setWaitingForFingerprint(false);
    setError(null);
    setResult(null);

    try {
      // Call the device attendance endpoint
      const response = await axios.post(
        '/api/device/attendance',
        { employee_no: employeeNo },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'your-device-api-key-change-in-production'
          }
        }
      );

      const data = response.data;
      
      // Determine if check-in or check-out based on response
      const action = data.time_out ? 'check_out' : 'check_in';
      const time = data.time_out || data.time_in;
      
      setResult({
        success: true,
        action,
        employee: {
          employee_no: data.employee_no,
          name: data.employee_name,
          department: data.department,
          designation: data.designation,
          employment_type: null
        },
        time,
        message: action === 'check_in' 
          ? 'Successfully checked in!' 
          : 'Successfully checked out!'
      });
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { detail?: string } } })
        .response?.data?.detail || 'Failed to mark attendance. Please try again.';
      setError(errorMsg);
    } finally {
      setScanning(false);
    }
  }, []);

  // Demo: simulate fingerprint scan with keyboard shortcut (for testing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press F1-F9 to simulate different employee scans (for demo)
      if (e.key >= 'F1' && e.key <= 'F9' && waitingForFingerprint && !scanning) {
        e.preventDefault();
        const empNum = `EMP00${e.key.slice(1)}`;
        handleFingerprintScan(empNum);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFingerprintScan, waitingForFingerprint, scanning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col items-center justify-center p-4 relative">
      {/* Admin Login Button */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
      >
        <Settings className="h-5 w-5" />
        <span>Admin Login</span>
      </button>

      {/* Header with Clock */}
      <div className="text-center text-white mb-8">
        <h1 className="text-4xl font-bold mb-2">Attendance System</h1>
        <div className="text-6xl font-mono font-bold">
          {format(currentTime, 'HH:mm:ss')}
        </div>
        <div className="text-xl mt-2">
          {format(currentTime, 'EEEE, MMMM dd, yyyy')}
        </div>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-xl p-8">
        {!result && !error ? (
          <>
            {/* Fingerprint Scanner Prompt */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full mb-6 ${
                scanning 
                  ? 'bg-primary-100 animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
              }`}>
                <Fingerprint className={`h-20 w-20 ${
                  scanning ? 'text-primary-600 animate-pulse' : 'text-gray-400'
                }`} />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {scanning ? 'Scanning...' : 'Place Your Finger'}
              </h2>
              
              <p className="text-gray-500 mb-4">
                {scanning 
                  ? 'Please wait while we verify your fingerprint' 
                  : 'Touch the fingerprint scanner to mark your attendance'}
              </p>

              {/* Visual indicator */}
              <div className="flex justify-center gap-2 mt-6">
                <div className={`w-3 h-3 rounded-full ${scanning ? 'bg-primary-500 animate-bounce' : 'bg-gray-300'}`} style={{ animationDelay: '0ms' }} />
                <div className={`w-3 h-3 rounded-full ${scanning ? 'bg-primary-500 animate-bounce' : 'bg-gray-300'}`} style={{ animationDelay: '150ms' }} />
                <div className={`w-3 h-3 rounded-full ${scanning ? 'bg-primary-500 animate-bounce' : 'bg-gray-300'}`} style={{ animationDelay: '300ms' }} />
              </div>

              <p className="text-xs text-gray-400 mt-6">
                Press F1-F9 to simulate fingerprint scan (Demo)
              </p>
            </div>
          </>
        ) : result ? (
          /* Success Result */
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              result.action === 'check_in' 
                ? 'bg-green-100' 
                : 'bg-blue-100'
            }`}>
              {result.action === 'check_in' ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <Clock className="h-12 w-12 text-blue-600" />
              )}
            </div>

            <h2 className={`text-2xl font-bold mb-4 ${
              result.action === 'check_in' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {result.message}
            </h2>

            {/* Employee Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {result.employee.name}
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                {result.employee.employee_no}
              </p>

              <div className="grid grid-cols-2 gap-4 text-left">
                {result.employee.department && (
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-semibold text-gray-900">
                      {result.employee.department}
                    </p>
                  </div>
                )}
                {result.employee.designation && (
                  <div>
                    <p className="text-sm text-gray-500">Designation</p>
                    <p className="font-semibold text-gray-900">
                      {result.employee.designation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="text-3xl font-mono font-bold text-gray-900">
              {result.time}
            </div>
            <p className="text-gray-500 mt-1">
              {result.action === 'check_in' ? 'Check-in Time' : 'Check-out Time'}
            </p>
          </div>
        ) : error ? (
          /* Error Result */
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Attendance Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            <p className="text-sm text-gray-500">
              Please try again or contact administrator
            </p>
          </div>
        ) : null}
      </Card>

      {/* Footer */}
      <p className="text-white/70 mt-8 text-sm">
        Fingerprint Attendance Management System
      </p>
    </div>
  );
}
