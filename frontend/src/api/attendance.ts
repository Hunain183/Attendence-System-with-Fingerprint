import api from './axios';
import {
  AttendanceListResponse,
  DailyAttendanceSummary,
  AttendanceFilters,
} from '../types';

export const attendanceApi = {
  /**
   * Get attendance records with filters
   */
  getAll: async (
    skip = 0,
    limit = 100,
    filters?: AttendanceFilters
  ): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.employee_no) params.append('employee_no', filters.employee_no);

    const response = await api.get<AttendanceListResponse>(
      `/admin/attendance?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get today's attendance
   */
  getToday: async (skip = 0, limit = 100): Promise<AttendanceListResponse> => {
    const response = await api.get<AttendanceListResponse>(
      `/admin/attendance/today?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get attendance summary for a date
   */
  getSummary: async (date?: string): Promise<DailyAttendanceSummary> => {
    const params = date ? `?target_date=${date}` : '';
    const response = await api.get<DailyAttendanceSummary>(
      `/admin/attendance/summary${params}`
    );
    return response.data;
  },

  /**
   * Get attendance by specific date
   */
  getByDate: async (
    date: string,
    skip = 0,
    limit = 100
  ): Promise<AttendanceListResponse> => {
    const response = await api.get<AttendanceListResponse>(
      `/admin/attendance/by-date/${date}?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Manually mark attendance (Admin only)
   */
  markManual: async (data: {
    employee_no: string;
    attendance_date: string;
    time_in?: string | null;
    time_out?: string | null;
  }) => {
    const response = await api.post('/admin/attendance/mark', data);
    return response;
  },

  /**
   * Update attendance record (Primary admin only)
   */
  updateAttendance: async (
    attendanceId: number,
    data: {
      employee_no: string;
      attendance_date: string;
      time_in?: string | null;
      time_out?: string | null;
    }
  ) => {
    const response = await api.put(`/admin/attendance/${attendanceId}`, data);
    return response;
  },

  /**
   * Delete attendance record (Primary admin only)
   */
  deleteAttendance: async (attendanceId: number) => {
    const response = await api.delete(`/admin/attendance/${attendanceId}`);
    return response;
  },
};
