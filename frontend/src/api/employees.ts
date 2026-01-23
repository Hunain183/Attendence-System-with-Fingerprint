import api from './axios';
import {
  Employee,
  EmployeeCreate,
  EmployeeUpdate,
  EmployeeListResponse,
  FingerprintEnroll,
  EmployeeFilters,
} from '../types';

export const employeeApi = {
  /**
   * Get all employees with pagination and filters
   */
  getAll: async (
    skip = 0,
    limit = 100,
    filters?: EmployeeFilters
  ): Promise<EmployeeListResponse> => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (filters?.department) params.append('department', filters.department);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<EmployeeListResponse>(
      `/admin/employees?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get single employee by ID
   */
  getById: async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/admin/employees/${id}`);
    return response.data;
  },

  /**
   * Create new employee
   */
  create: async (data: EmployeeCreate): Promise<Employee> => {
    const response = await api.post<Employee>('/admin/employees', data);
    return response.data;
  },

  /**
   * Update existing employee
   */
  update: async (id: number, data: EmployeeUpdate): Promise<Employee> => {
    const response = await api.put<Employee>(`/admin/employees/${id}`, data);
    return response.data;
  },

  /**
   * Delete employee
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/employees/${id}`);
  },

  /**
   * Enroll fingerprint for employee
   */
  enrollFingerprint: async (data: FingerprintEnroll): Promise<Employee> => {
    const response = await api.post<Employee>(
      '/admin/employees/enroll-fingerprint',
      data
    );
    return response.data;
  },
};
