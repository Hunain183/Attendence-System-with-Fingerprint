import { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle, Search, RefreshCw, Edit, Calendar, XCircle } from 'lucide-react';
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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAttendanceStatus | null>(null);
  const [halfLeaveTimeIn, setHalfLeaveTimeIn] = useState('');

  // Get user role from token
  let isPrimaryAdmin = false;
  let isSecondaryAdmin = false;
  let canMarkLeave = false;
  const authToken = localStorage.getItem('token');
  if (authToken) {
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      isPrimaryAdmin = payload.role === 'primary_admin';
      isSecondaryAdmin = payload.role === 'secondary_admin';
      canMarkLeave = isPrimaryAdmin || isSecondaryAdmin;
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

  const handleLeaveClick = (emp: EmployeeAttendanceStatus) => {
    setSelectedEmployee(emp);
    setHalfLeaveTimeIn(emp.time_in ? emp.time_in.slice(0, 5) : '');
    setShowLeaveModal(true);
  };

  const handleMarkLeave = async (leaveType: 'half_leave' | 'full_leave') => {
    if (!selectedEmployee) return;
    if (leaveType === 'half_leave' && !halfLeaveTimeIn) {
      toast.error('Time in is required for half leave');
      return;
    }

    try {
      setMarking(selectedEmployee.employee_no);
      const response = await manualAttendanceApi.markLeave(
        selectedEmployee.employee_no,
        leaveType,
        leaveType === 'half_leave' ? halfLeaveTimeIn : undefined
      );
      toast.success(response.message);
      setShowLeaveModal(false);
      setSelectedEmployee(null);
      setHalfLeaveTimeIn('');
      loadEmployees();
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.detail || 'Failed to mark leave';
      toast.error(errorMsg);
    } finally {
      setMarking(null);
    }
  };

  const handleCancelLeave = async (emp: EmployeeAttendanceStatus) => {
    if (!emp.attendance_id) return;

    if (!confirm(`Cancel leave for ${emp.name}?`)) return;

    try {
      setMarking(emp.employee_no);
      const response = await manualAttendanceApi.cancelLeave(emp.attendance_id);
      toast.success(response.message);
      loadEmployees();
    } catch (error) {
      const errorMsg = (error as any)?.response?.data?.detail || 'Failed to cancel leave';
      toast.error(errorMsg);
    } finally {
      setMarking(null);
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
    leave: employees.filter(e => e.status === 'half_leave' || e.status === 'full_leave').length,
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <Card className="text-center p-4 bg-blue-50">
          <p className="text-2xl font-bold text-blue-600">{stats.leave}</p>
          <p className="text-sm text-gray-500">On Leave</p>
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
                      ) : emp.status === 'half_leave' ? (
                        <Badge variant="info">Half Leave</Badge>
                      ) : emp.status === 'full_leave' ? (
                        <Badge variant="danger">Full Leave</Badge>
                      ) : (
                        <Badge variant="default">Not Marked</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {emp.status === 'not_marked' && (
                          <>
                            <Button
                              onClick={() => handleTimeIn(emp.employee_no)}
                              loading={marking === emp.employee_no}
                              className="flex items-center gap-1 text-sm"
                            >
                              <LogIn className="w-4 h-4" />
                              Time In
                            </Button>
                            {canMarkLeave && (
                              <Button
                                onClick={() => handleLeaveClick(emp)}
                                variant="secondary"
                                className="flex items-center gap-1 text-sm"
                              >
                                <Calendar className="w-4 h-4" />
                                Leave
                              </Button>
                            )}
                          </>
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
                        {(emp.status === 'half_leave' || emp.status === 'full_leave') && (
                          <>
                            <span className="flex items-center gap-1 text-blue-600 text-sm">
                              <Calendar className="w-4 h-4" />
                              {emp.status === 'half_leave' ? 'Half Leave' : 'Full Leave'}
                            </span>
                            {isPrimaryAdmin && emp.attendance_id && (
                              <Button
                                onClick={() => handleCancelLeave(emp)}
                                variant="danger"
                                loading={marking === emp.employee_no}
                                className="flex items-center gap-1 text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel
                              </Button>
                            )}
                          </>
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

      {/* Leave Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Mark Leave"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Mark leave for {selectedEmployee?.name} ({selectedEmployee?.employee_no})
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time In (HH:MM)
              </label>
              <input
                type="time"
                value={halfLeaveTimeIn}
                onChange={(e) => setHalfLeaveTimeIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for half leave. Time out will be auto-calculated.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleMarkLeave('half_leave')}
              loading={marking === selectedEmployee?.employee_no}
              className="flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              Half Leave
            </Button>
            <Button
              onClick={() => handleMarkLeave('full_leave')}
              loading={marking === selectedEmployee?.employee_no}
              variant="danger"
              className="flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              Full Leave
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowLeaveModal(false)}
              disabled={marking === selectedEmployee?.employee_no}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
