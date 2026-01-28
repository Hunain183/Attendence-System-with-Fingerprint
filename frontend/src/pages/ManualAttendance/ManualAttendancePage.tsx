import { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle, Search, RefreshCw, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, Badge, Input, Modal } from '../../components/ui';
import { manualAttendanceApi, EmployeeAttendanceStatus } from '../../api/manualAttendance';
import toast from 'react-hot-toast';

export function ManualAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeAttendanceStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [marking, setMarking] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTimeIn, setEditTimeIn] = useState('');
  const [editTimeOut, setEditTimeOut] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Get user role from token
  let isPrimaryAdmin = false;
  const authToken = localStorage.getItem('token');
  if (authToken) {
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      isPrimaryAdmin = payload.role === 'primary_admin';
    } catch (e) {}
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await manualAttendanceApi.getEmployeesStatus();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeIn = async (employeeNo: string) => {
    try {
      setMarking(employeeNo);
      const response = await manualAttendanceApi.markTimeIn(employeeNo);
      toast.success(response.message);
      loadEmployees();
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.detail || 'Failed to mark time in';
      toast.error(errorMsg);
    } finally {
      setMarking(null);
    }
  };

  const handleTimeOut = async (employeeNo: string) => {
    try {
      setMarking(employeeNo);
      const response = await manualAttendanceApi.markTimeOut(employeeNo);
      toast.success(response.message);
      loadEmployees();
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.detail || 'Failed to mark time out';
      toast.error(errorMsg);
    } finally {
      setMarking(null);
    }
  };

  const handleEditClick = (emp: EmployeeAttendanceStatus) => {
    setEditingId(emp.attendance_id);
    setEditTimeIn(emp.time_in ? emp.time_in.slice(0, 5) : '');
    setEditTimeOut(emp.time_out ? emp.time_out.slice(0, 5) : '');
    setShowEditModal(true);
  };

  const handleUpdateAttendance = async () => {
    if (!editingId) return;

    if (!editTimeIn || !editTimeOut) {
      toast.error('Both time in and time out are required');
      return;
    }

    try {
      setUpdating(true);
      const response = await manualAttendanceApi.update(editingId, {
        time_in: editTimeIn,
        time_out: editTimeOut,
      });
      toast.success(response.message);
      setShowEditModal(false);
      setEditingId(null);
      loadEmployees();
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.detail || 'Failed to update attendance';
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: employees.length,
    notMarked: employees.filter(e => e.status === 'not_marked').length,
    inProgress: employees.filter(e => e.status === 'time_in_only').length,
    complete: employees.filter(e => e.status === 'complete').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-10 w-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manual Attendance</h2>
          <p className="text-gray-500 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button onClick={loadEmployees} variant="secondary" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Employees</p>
        </Card>
        <Card className="text-center p-4 bg-gray-50">
          <p className="text-2xl font-bold text-gray-600">{stats.notMarked}</p>
          <p className="text-sm text-gray-500">Not Marked</p>
        </Card>
        <Card className="text-center p-4 bg-yellow-50">
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </Card>
        <Card className="text-center p-4 bg-green-50">
          <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
          <p className="text-sm text-gray-500">Complete</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search by name, employee number, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employee List */}
      <Card>
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {employees.length === 0 ? 'No employees found' : 'No matching employees'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Employee</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Department</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Time In</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Time Out</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employee_no} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-sm text-gray-500">{emp.employee_no}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{emp.department || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={emp.time_in ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {formatTime(emp.time_in)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={emp.time_out ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                        {formatTime(emp.time_out)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {emp.status === 'complete' ? (
                        <Badge variant="success">Complete</Badge>
                      ) : emp.status === 'time_in_only' ? (
                        <Badge variant="warning">In Progress</Badge>
                      ) : (
                        <Badge variant="default">Not Marked</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {emp.status === 'not_marked' && (
                          <Button
                            onClick={() => handleTimeIn(emp.employee_no)}
                            loading={marking === emp.employee_no}
                            className="flex items-center gap-1 text-sm"
                          >
                            <LogIn className="w-4 h-4" />
                            Time In
                          </Button>
                        )}
                        {emp.status === 'time_in_only' && (
                          <Button
                            onClick={() => handleTimeOut(emp.employee_no)}
                            loading={marking === emp.employee_no}
                            className="flex items-center gap-1 text-sm bg-orange-600 hover:bg-orange-700"
                          >
                            <LogOut className="w-4 h-4" />
                            Time Out
                          </Button>
                        )}
                        {emp.status === 'complete' && (
                          <>
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Done
                            </span>
                            {isPrimaryAdmin && emp.attendance_id && (
                              <Button
                                onClick={() => handleEditClick(emp)}
                                variant="secondary"
                                className="flex items-center gap-1 text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Attendance Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Attendance"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Update the time in and time out for this employee
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time In (HH:MM)
              </label>
              <input
                type="time"
                value={editTimeIn}
                onChange={(e) => setEditTimeIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Out (HH:MM)
              </label>
              <input
                type="time"
                value={editTimeOut}
                onChange={(e) => setEditTimeOut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAttendance}
              loading={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
