import api from './axios';

export interface EmployeeAttendanceStatus {
  employee_no: string;
  name: string;
  department: string | null;
  attendance_id: number | null;
  time_in: string | null;
  time_out: string | null;
  status: 'not_marked' | 'time_in_only' | 'complete';
}

export interface ManualAttendanceResponse {
  id: number;
  employee_no: string;
  employee_name: string;
  attendance_date: string;
  time_in: string | null;
  time_out: string | null;
  total_work_minutes: number;
  action: string;
  message: string;
}

export interface AttendanceUpdateRequest {
  time_in?: string;
  time_out?: string;
}

export const manualAttendanceApi = {
  /**
   * Get all employees with their attendance status for today
   */
  getEmployeesStatus: async (): Promise<EmployeeAttendanceStatus[]> => {
    const response = await api.get<EmployeeAttendanceStatus[]>('/manual-attendance/employees-status');
    return response.data;
  },

  /**
   * Mark time in for an employee
   */
  markTimeIn: async (employeeNo: string): Promise<ManualAttendanceResponse> => {
    const response = await api.post<ManualAttendanceResponse>('/manual-attendance/time-in', {
      employee_no: employeeNo,
    });
    return response.data;
  },

  /**
   * Mark time out for an employee
   */
  markTimeOut: async (employeeNo: string): Promise<ManualAttendanceResponse> => {
    const response = await api.post<ManualAttendanceResponse>('/manual-attendance/time-out', {
      employee_no: employeeNo,
    });
    return response.data;
  },

  /**
   * Update attendance (primary admin only)
   */
  update: async (attendanceId: number, data: AttendanceUpdateRequest): Promise<ManualAttendanceResponse> => {
    const response = await api.put<ManualAttendanceResponse>(`/manual-attendance/${attendanceId}`, data);
    return response.data;
  },
};
