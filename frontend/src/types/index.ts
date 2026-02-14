// Employee Types
export interface Employee {
  id: number;
  employee_no: string;
  name: string;
  father_name: string | null;
  date_of_birth: string | null;
  cnic: string | null;
  phone_number: string | null;
  picture: string | null;
  gender: string | null;
  blood_group: string | null;
  marital_status: string | null;
  emergency_contact_no: string | null;
  permanent_address: string | null;
  current_address: string | null;
  employment_type: string | null;
  designation: string | null;
  department: string | null;
  hod: string | null;
  sub_department: string | null;
  date_of_joining: string | null;
  shift: string | null;
  is_overtime: boolean | null;
  rest_day: string | null;
  quit_date: string | null;
  remarks: string | null;
  monthly_salary: number | null;
  rate_per_day: number | null;
  increment: number | null;
  date_of_increment: string | null;
  total_salary: number | null;
  reference_1: string | null;
  reference_2: string | null;
  reference_address_1: string | null;
  reference_address_2: string | null;
  previous_employer: string | null;
  previous_employer_address: string | null;
  previous_designation: string | null;
  previous_period_of_service: string | null;
  has_fingerprint: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  employee_no: string;
  name: string;
  father_name?: string;
  date_of_birth?: string;
  cnic?: string;
  phone_number?: string;
  picture?: string;
  gender?: string;
  blood_group?: string;
  marital_status?: string;
  emergency_contact_no?: string;
  permanent_address?: string;
  current_address?: string;
  employment_type?: string;
  designation?: string;
  department?: string;
  hod?: string;
  sub_department?: string;
  date_of_joining?: string;
  shift?: string;
  is_overtime?: boolean;
  rest_day?: string;
  quit_date?: string;
  remarks?: string;
  monthly_salary?: number;
  rate_per_day?: number;
  increment?: number;
  date_of_increment?: string;
  total_salary?: number;
  reference_1?: string;
  reference_2?: string;
  reference_address_1?: string;
  reference_address_2?: string;
  previous_employer?: string;
  previous_employer_address?: string;
  previous_designation?: string;
  previous_period_of_service?: string;
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
  leave_type: string | null;
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
  role?: string;
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

// User Types
export interface UserCreate {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  role: 'user' | 'secondary_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  total: number;
  users: UserResponse[];
}

// Salary Types
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
