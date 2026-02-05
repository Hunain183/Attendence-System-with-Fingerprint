import { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Select } from '../../components/ui';
import { employeeApi } from '../../api';
import { Employee, EmployeeCreate, EmployeeUpdate } from '../../types';
import toast from 'react-hot-toast';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  employee: Employee | null;
}

const employmentTypes = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Temporary', label: 'Temporary' },
  { value: 'Contractual', label: 'Contractual' },
  { value: 'Intern', label: 'Intern' },
];

const departments = [
  { value: 'Human Resources / Admin', label: 'Human Resources / Admin' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Export', label: 'Export' },
  { value: 'Accounts & Audit', label: 'Accounts & Audit' },
  { value: 'IT', label: 'IT' },
  { value: 'Production', label: 'Production' },
  { value: 'Electric', label: 'Electric' },
];

const shifts = [
  { value: 'D', label: 'D - 12 Hours' },
  { value: 'A', label: 'A - 8 Hours' },
  { value: 'B', label: 'B - 8 Hours' },
  { value: 'C', label: 'C - 8 Hours' },
  { value: 'G', label: 'G - 8 Hours' },
];

const restDays = [
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
];

export function EmployeeModal({
  isOpen,
  onClose,
  employee,
}: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeCreate>({
    employee_no: '',
    name: '',
    father_name: '',
    date_of_birth: '',
    cnic: '',
    phone_number: '',
    permanent_address: '',
    current_address: '',
    employment_type: '',
    designation: '',
    department: '',
    hod: '',
    sub_department: '',
    date_of_joining: '',
    shift: '',
    rest_day: '',
    quit_date: '',
    remarks: '',
    monthly_salary: '',
    rate_per_day: '',
    increment: '',
    date_of_increment: '',
    total_salary: '',
    reference_1: '',
    reference_2: '',
    reference_address_1: '',
    reference_address_2: '',
    previous_employer: '',
    previous_employer_address: '',
    previous_designation: '',
    previous_period_of_service: '',
  } as any);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!employee;

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_no: employee.employee_no,
        name: employee.name,
        father_name: employee.father_name || '',
        date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
        cnic: employee.cnic || '',
        phone_number: employee.phone_number || '',
        permanent_address: employee.permanent_address || '',
        current_address: employee.current_address || '',
        employment_type: employee.employment_type || '',
        designation: employee.designation || '',
        department: employee.department || '',
        hod: employee.hod || '',
        sub_department: employee.sub_department || '',
        date_of_joining: employee.date_of_joining
          ? employee.date_of_joining.split('T')[0]
          : '',
        shift: employee.shift || '',
        rest_day: employee.rest_day || '',
        quit_date: employee.quit_date ? employee.quit_date.split('T')[0] : '',
        remarks: employee.remarks || '',
        monthly_salary: employee.monthly_salary?.toString() || '',
        rate_per_day: employee.rate_per_day?.toString() || '',
        increment: employee.increment?.toString() || '',
        date_of_increment: employee.date_of_increment
          ? employee.date_of_increment.split('T')[0]
          : '',
        total_salary: employee.total_salary?.toString() || '',
        reference_1: employee.reference_1 || '',
        reference_2: employee.reference_2 || '',
        reference_address_1: employee.reference_address_1 || '',
        reference_address_2: employee.reference_address_2 || '',
        previous_employer: employee.previous_employer || '',
        previous_employer_address: employee.previous_employer_address || '',
        previous_designation: employee.previous_designation || '',
        previous_period_of_service: employee.previous_period_of_service || '',
      } as any);
    } else {
      setFormData({
        employee_no: '',
        name: '',
        father_name: '',
        date_of_birth: '',
        cnic: '',
        phone_number: '',
        permanent_address: '',
        current_address: '',
        employment_type: '',
        designation: '',
        department: '',
        hod: '',
        sub_department: '',
        date_of_joining: '',
        shift: '',
        rest_day: '',
        quit_date: '',
        remarks: '',
        monthly_salary: '',
        rate_per_day: '',
        increment: '',
        date_of_increment: '',
        total_salary: '',
        reference_1: '',
        reference_2: '',
        reference_address_1: '',
        reference_address_2: '',
        previous_employer: '',
        previous_employer_address: '',
        previous_designation: '',
        previous_period_of_service: '',
      } as any);
    }
    setErrors({});
  }, [employee, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_no.trim()) {
      newErrors.employee_no = 'Employee number is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const totalSalaryValue = useMemo(() => {
    const monthly = parseInt(String(formData.monthly_salary ?? ''), 10);
    const increment = parseInt(String(formData.increment ?? ''), 10);
    if (Number.isNaN(monthly) && Number.isNaN(increment)) return '';
    const monthlyValue = Number.isNaN(monthly) ? 0 : monthly;
    const incrementValue = Number.isNaN(increment) ? 0 : increment;
    return String(monthlyValue + incrementValue);
  }, [formData.monthly_salary, formData.increment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      // Clean empty strings - only include non-empty values
      // For dates, convert to ISO format if present
      const cleanData: Record<string, any> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value !== '' && value !== null && value !== undefined) {
          if (
            (key === 'date_of_joining' ||
              key === 'date_of_birth' ||
              key === 'quit_date' ||
              key === 'date_of_increment') &&
            value
          ) {
            // Convert date string to ISO datetime format
            cleanData[key] = `${value}T00:00:00`;
          } else if (
            key === 'monthly_salary' ||
            key === 'rate_per_day' ||
            key === 'increment' ||
            key === 'total_salary'
          ) {
            // Convert to number
            cleanData[key] = value ? parseInt(value as string) : undefined;
          } else {
            cleanData[key] = value;
          }
        }
      }

      if (totalSalaryValue !== '') {
        cleanData.total_salary = parseInt(totalSalaryValue, 10);
      }
      
      console.log('Submitting employee data:', JSON.stringify(cleanData, null, 2));

      if (isEditMode && employee) {
        await employeeApi.update(employee.id, cleanData as EmployeeUpdate);
        toast.success('Employee updated successfully');
      } else {
        await employeeApi.create(cleanData as EmployeeCreate);
        toast.success('Employee created successfully');
      }

      onClose(true);
    } catch (error) {
      console.error('Employee creation error:', error);
      const errorResponse = (error as { response?: { data?: { detail?: string | Array<{msg: string}> } } }).response?.data?.detail;
      
      let message = 'Operation failed';
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (Array.isArray(errorResponse) && errorResponse.length > 0) {
        // Pydantic validation errors come as array
        message = errorResponse.map(e => e.msg).join(', ');
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title={isEditMode ? 'Edit Employee' : 'Add Employee'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Employee No *"
            name="employee_no"
            value={formData.employee_no}
            onChange={handleChange}
            error={errors.employee_no}
            placeholder="EMP001"
            disabled={isEditMode}
          />
          <Input
            label="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="John Doe"
          />
          <Input
            label="Father's Name"
            name="father_name"
            value={formData.father_name}
            onChange={handleChange}
            placeholder="Father's name"
          />
          <Input
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
          <Input
            label="CNIC"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            error={errors.cnic}
            placeholder="12345-1234567-1"
          />
          <Input
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+92 300 1234567"
          />
        </div>

        {/* Addresses */}
        <Input
          label="Permanent Address"
          name="permanent_address"
          value={formData.permanent_address}
          onChange={handleChange}
          placeholder="Enter permanent address"
        />

        <Input
          label="Current Address"
          name="current_address"
          value={formData.current_address}
          onChange={handleChange}
          placeholder="Enter current address"
        />

        {/* Employment Details - BEFORE References */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Employment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Employment Type"
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              options={employmentTypes}
              placeholder="Select type"
            />
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={departments}
              placeholder="Select department"
            />
            <Input
              label="Head of Department (HOD)"
              name="hod"
              value={formData.hod}
              onChange={handleChange}
              placeholder="HOD name"
            />
            <Input
              label="Sub Department"
              name="sub_department"
              value={formData.sub_department}
              onChange={handleChange}
              placeholder="Sub department"
            />
            <Input
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
            <Input
              label="Date of Joining"
              name="date_of_joining"
              type="date"
              value={formData.date_of_joining}
              onChange={handleChange}
            />
            <Select
              label="Shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              options={shifts}
              placeholder="Select shift"
            />
            <Select
              label="Rest Day"
              name="rest_day"
              value={formData.rest_day}
              onChange={handleChange}
              options={restDays}
              placeholder="Select rest day"
            />
            <Input
              label="Quit Date"
              name="quit_date"
              type="date"
              value={formData.quit_date}
              onChange={handleChange}
            />
            <Input
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Additional remarks"
            />
          </div>
        </div>

        {/* Salary Details */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Salary Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Monthly Salary (PKR)"
              name="monthly_salary"
              type="number"
              value={formData.monthly_salary}
              onChange={handleChange}
              placeholder="e.g., 50000"
            />
            <Input
              label="Rate Per Day (PKR)"
              name="rate_per_day"
              type="number"
              value={formData.rate_per_day}
              onChange={handleChange}
              placeholder="Auto-calculated"
              readOnly
            />
            <Input
              label="Increment (PKR)"
              name="increment"
              type="number"
              value={formData.increment}
              onChange={handleChange}
              placeholder="e.g., 5000"
            />
            <Input
              label="Date of Increment"
              name="date_of_increment"
              type="date"
              value={formData.date_of_increment}
              onChange={handleChange}
            />
            <Input
              label="Total Salary"
              name="total_salary"
              type="number"
              value={totalSalaryValue}
              readOnly
            />
          </div>
        </div>

        {/* References */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">References</h3>
          <div className="space-y-4">
            <Input
              label="Reference 1"
              name="reference_1"
              value={formData.reference_1}
              onChange={handleChange}
              placeholder="Name and contact"
            />
            <Input
              label="Reference Address 1"
              name="reference_address_1"
              value={formData.reference_address_1}
              onChange={handleChange}
              placeholder="Address of reference 1"
            />
            <Input
              label="Reference 2"
              name="reference_2"
              value={formData.reference_2}
              onChange={handleChange}
              placeholder="Name and contact"
            />
            <Input
              label="Reference Address 2"
              name="reference_address_2"
              value={formData.reference_address_2}
              onChange={handleChange}
              placeholder="Address of reference 2"
            />
          </div>
        </div>

        {/* Previous Employment */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Previous Employment</h3>
          <div className="space-y-4">
            <Input
              label="Previous Employer"
              name="previous_employer"
              value={formData.previous_employer}
              onChange={handleChange}
              placeholder="Company name"
            />
            <Input
              label="Address"
              name="previous_employer_address"
              value={formData.previous_employer_address}
              onChange={handleChange}
              placeholder="Company address"
            />
            <Input
              label="Designation"
              name="previous_designation"
              value={formData.previous_designation}
              onChange={handleChange}
              placeholder="Job title"
            />
            <Input
              label="Period of Service"
              name="previous_period_of_service"
              value={formData.previous_period_of_service}
              onChange={handleChange}
              placeholder="e.g., Jan 2020 - Dec 2022"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onClose()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
