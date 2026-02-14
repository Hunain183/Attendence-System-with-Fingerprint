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
  { value: 'A(12)', label: 'A(12) - 6:00 AM - 6:00 PM (12h)' },
  { value: 'B(12)', label: 'B(12) - 6:00 PM - 6:00 AM (12h)' },
  { value: 'E', label: 'E - 2:00 PM - 10:00 PM (8h)' },
  { value: 'G(Off)', label: 'G(Off) - 9:00 AM - 5:30 PM (8.5h)' },
  { value: 'G', label: 'G - 8:00 AM - 4:00 PM (8h)' },
  { value: 'M', label: 'M - 6:00 AM - 2:00 PM (8h)' },
  { value: 'N', label: 'N - 10:00 PM - 6:00 AM (8h)' },
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

const genders = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const bloodGroups = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const maritalStatuses = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
];

export function EmployeeModal({
  isOpen,
  onClose,
  employee,
}: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string>('');
  const [formData, setFormData] = useState<EmployeeCreate>({
    employee_no: '',
    name: '',
    father_name: '',
    date_of_birth: '',
    cnic: '',
    phone_number: '',
    picture: '',
    gender: '',
    blood_group: '',
    marital_status: '',
    emergency_contact_no: '',
    permanent_address: '',
    current_address: '',
    employment_type: '',
    designation: '',
    department: '',
    hod: '',
    sub_department: '',
    date_of_joining: '',
    shift: '',
    is_overtime: true,
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
        picture: employee.picture || '',
        gender: employee.gender || '',
        blood_group: employee.blood_group || '',
        marital_status: employee.marital_status || '',
        emergency_contact_no: employee.emergency_contact_no || '',
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
        is_overtime: employee.is_overtime !== false,
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
      setPicturePreview(employee.picture || '');
    } else {
      setFormData({
        employee_no: '',
        name: '',
        father_name: '',
        date_of_birth: '',
        cnic: '',
        phone_number: '',
        picture: '',
        gender: '',
        blood_group: '',
        marital_status: '',
        emergency_contact_no: '',
        permanent_address: '',
        current_address: '',
        employment_type: '',
        designation: '',
        department: '',
        hod: '',
        sub_department: '',
        date_of_joining: '',
        shift: '',
        is_overtime: true,
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
      setPicturePreview('');
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

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({ ...prev, picture: result }));
      setPicturePreview(result);
    };
    reader.readAsDataURL(file);
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
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Picture (Passport size)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-gray-300"
            />
            {picturePreview && (
              <div className="mt-2">
                <img
                  src={picturePreview}
                  alt="Employee"
                  className="h-16 w-16 rounded object-cover border border-gray-200"
                />
              </div>
            )}
          </div>
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={genders}
            placeholder="Select gender"
          />
          <Select
            label="Blood Group"
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            options={bloodGroups}
            placeholder="Select blood group"
          />
          <Select
            label="Marital Status"
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            options={maritalStatuses}
            placeholder="Select marital status"
          />
          <Input
            label="Emergency Contact No"
            name="emergency_contact_no"
            value={formData.emergency_contact_no}
            onChange={handleChange}
            placeholder="Emergency contact"
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
              label="Is Overtime"
              name="is_overtime"
              value={formData.is_overtime ? 'yes' : 'no'}
              onChange={(e) => setFormData({ ...formData, is_overtime: e.target.value === 'yes' })}
              options={[
                { value: 'yes', label: 'Yes - Calculate Overtime' },
                { value: 'no', label: 'No - No Overtime' },
              ]}
              placeholder="Calculate overtime?"
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
