import api from './axios';

export interface Salary {
  id: number;
  employee_id: number;
  month: string;
  rate_of_pay: number;
  month_days: number;
  overtime_hours: number;
  total_days_worked: number;
  amount: number;
  advance: number;
  net_amount: number;
  notes?: string;
  signature?: string;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  updated_at: string;
  employee_name?: string;
  designation?: string;
}

export interface SalaryCreate {
  employee_id: number;
  month: string;
  rate_of_pay: number;
  month_days?: number;
  overtime_hours?: number;
  total_days_worked?: number;
  advance?: number;
  notes?: string;
  signature?: string;
  status?: string;
}

export interface SalaryUpdate {
  rate_of_pay?: number;
  month_days?: number;
  overtime_hours?: number;
  total_days_worked?: number;
  advance?: number;
  notes?: string;
  signature?: string;
  status?: string;
}

export interface SalaryCalculate {
  employee_id: number;
  month: string;
  rate_of_pay: number;
  advance?: number;
}

const salaryAPI = {
  // Get all salaries with optional filters
  getAll: async (params?: {
    month?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Salary[]> => {
    const response = await api.get('/admin/salaries/', { params });
    return response.data;
  },

  // Get salary by ID
  getById: async (id: number): Promise<Salary> => {
    const response = await api.get(`/admin/salaries/${id}`);
    return response.data;
  },

  // Get salaries for a specific employee
  getByEmployee: async (employeeId: number): Promise<Salary[]> => {
    const response = await api.get(`/admin/salaries/employee/${employeeId}`);
    return response.data;
  },

  // Create salary record
  create: async (data: SalaryCreate): Promise<Salary> => {
    const response = await api.post('/admin/salaries/', data);
    return response.data;
  },

  // Auto-calculate salary from attendance
  calculate: async (data: SalaryCalculate): Promise<Salary> => {
    const response = await api.post('/admin/salaries/calculate', data);
    return response.data;
  },

  // Update salary record
  update: async (id: number, data: SalaryUpdate): Promise<Salary> => {
    const response = await api.put(`/admin/salaries/${id}`, data);
    return response.data;
  },

  // Delete salary record
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/salaries/${id}`);
  },
};

export default salaryAPI;
