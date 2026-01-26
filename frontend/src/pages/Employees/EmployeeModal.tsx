import { useState, useEffect } from 'react';
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
    cnic: '',
    phone_number: '',
    permanent_address: '',
    current_address: '',
    employment_type: '',
    hod: '',
    designation: '',
    department: '',
    date_of_joining: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!employee;

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_no: employee.employee_no,
        name: employee.name,
        father_name: employee.father_name || '',
        cnic: employee.cnic || '',
        phone_number: employee.phone_number || '',
        permanent_address: employee.permanent_address || '',
        current_address: employee.current_address || '',
        employment_type: employee.employment_type || '',
        hod: employee.hod || '',
        designation: employee.designation || '',
        department: employee.department || '',
        date_of_joining: employee.date_of_joining
          ? employee.date_of_joining.split('T')[0]
          : '',
      });
    } else {
      setFormData({
        employee_no: '',
        name: '',
        father_name: '',
        cnic: '',
        phone_number: '',
        permanent_address: '',
        current_address: '',
        employment_type: '',
        hod: '',
        designation: '',
        department: '',
        date_of_joining: '',
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      // Clean empty strings - only include non-empty values
      // For date_of_joining, convert to ISO format if present
      const cleanData: Partial<EmployeeCreate> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'date_of_joining' && value) {
            // Convert date string to ISO datetime format
            cleanData[key as keyof EmployeeCreate] = `${value}T00:00:00`;
          } else {
            (cleanData as Record<string, string>)[key] = value;
          }
        }
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input
            label="Date of Joining"
            name="date_of_joining"
            type="date"
            value={formData.date_of_joining}
            onChange={handleChange}
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
            label="HOD"
            name="hod"
            value={formData.hod}
            onChange={handleChange}
            placeholder="Head of Department"
          />
          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="Software Engineer"
          />
          <Select
            label="Employment Type"
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            options={employmentTypes}
            placeholder="Select type"
          />
        </div>

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
