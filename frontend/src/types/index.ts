// Employee Types
export interface Employee {
  id: number;
  employee_no: string;
  name: string;
  father_name: string | null;
  cnic: string | null;
  phone_number: string | null;
  permanent_address: string | null;
  current_address: string | null;
  employment_type: string | null;
  hod: string | null;
  designation: string | null;
  department: string | null;
  sub_department: string | null;
  monthly_salary: string | null;
  per_day_wage: string | null;
  previous_employment: string | null;
  period_from: string | null;
  period_to: string | null;
  date_of_joining: string | null;
  has_fingerprint: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  employee_no: string;
  name: string;
  father_name?: string;
  cnic?: string;
  phone_number?: string;
  permanent_address?: string;
  current_address?: string;
  employment_type?: string;
  hod?: string;
  designation?: string;
  department?: string;
  sub_department?: string;
  monthly_salary?: string;
  per_day_wage?: string;
  previous_employment?: string;
  period_from?: string;
  period_to?: string;
  date_of_joining?: string;
}

export interface EmployeeUpdate extends Partial<EmployeeCreate> {}

export interface EmployeeListResponse {
  total: number;
  employees: Employee[];
}

export interface FingerprintEnroll {
  employee_no: string;
  fingerprint_template: string;
}

// Attendance Types
export interface Attendance {
  id: number;
  employee_no: string;
  employee_name: string;
  department: string | null;
  designation: string | null;
  attendance_date: string;
  time_in: string | null;
  time_out: string | null;
  total_work_minutes: number;
  overtime: boolean;
  overtime_minutes: number;
  device_id: string | null;
}

export interface AttendanceListResponse {
  total: number;
  records: Attendance[];
}

export interface DailyAttendanceSummary {
  date: string;
  total_employees: number;
  present: number;
  absent: number;
  on_time: number;
  late: number;
  overtime_count: number;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// API Response Types
export interface ApiError {
  detail: string;
}

// Filter Types
export interface AttendanceFilters {
  start_date?: string;
  end_date?: string;
  department?: string;
  employee_no?: string;
}

export interface EmployeeFilters {
  department?: string;
  search?: string;
}
