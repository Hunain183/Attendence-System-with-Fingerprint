import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Download, RefreshCw } from 'lucide-react';
import { Button, Input, Select, Card, Table } from '../../components/ui';
import { employeeApi } from '../../api';
import { Employee, EmployeeFilters } from '../../types';
import toast from 'react-hot-toast';

const departments = [
  { value: '', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Sales', label: 'Sales' },
  { value: 'IT', label: 'IT' },
  { value: 'Administration', label: 'Administration' },
];

export function EmployeeReportPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EmployeeFilters>({
    department: '',
    search: '',
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      // Build filters object without undefined values
      const apiFilters: EmployeeFilters = {};
      if (filters.department) apiFilters.department = filters.department;
      if (filters.search) apiFilters.search = filters.search;
      
      const data = await employeeApi.getAll(0, 1000, apiFilters);
      setEmployees(data.employees);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load employee report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'MMM d, yyyy');
  };

  const exportToCSV = () => {
    if (employees.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Employee No',
      'Name',
      "Father's Name",
      'Date of Birth',
      'CNIC',
      'Phone Number',
      'Permanent Address',
      'Current Address',
      'Reference 1',
      'Reference Address 1',
      'Reference 2',
      'Reference Address 2',
      'Employment Type',
      'Department',
      'Designation',
      'Date of Joining',
      'Shift',
    ];

    const rows = employees.map((e) => [
      e.employee_no,
      e.name,
      e.father_name || '',
      e.date_of_birth || '',
      e.cnic || '',
      e.phone_number || '',
      e.permanent_address || '',
      e.current_address || '',
      e.reference_1 || '',
      e.reference_address_1 || '',
      e.reference_2 || '',
      e.reference_address_2 || '',
      e.employment_type || '',
      e.department || '',
      e.designation || '',
      e.date_of_joining || '',
      e.shift || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee-report.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported successfully');
  };

  const columns = [
    { key: 'employee_no', header: 'Employee No' },
    { key: 'name', header: 'Name' },
    { key: 'father_name', header: "Father's Name" },
    {
      key: 'date_of_birth',
      header: 'Date of Birth',
      render: (item: Employee) => formatDate(item.date_of_birth),
    },
    { key: 'cnic', header: 'CNIC' },
    { key: 'phone_number', header: 'Phone Number' },
    { key: 'permanent_address', header: 'Permanent Address' },
    { key: 'current_address', header: 'Current Address' },
    { key: 'reference_1', header: 'Reference 1' },
    { key: 'reference_address_1', header: 'Reference Address 1' },
    { key: 'reference_2', header: 'Reference 2' },
    { key: 'reference_address_2', header: 'Reference Address 2' },
    { key: 'employment_type', header: 'Employment Type' },
    { key: 'department', header: 'Department' },
    { key: 'designation', header: 'Designation' },
    {
      key: 'date_of_joining',
      header: 'Date of Joining',
      render: (item: Employee) => formatDate(item.date_of_joining),
    },
    { key: 'shift', header: 'Shift' },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Report</h2>
          <p className="text-gray-500 mt-1">
            Export employee details ({total} records)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchEmployees}
          >
            Refresh
          </Button>
          <Button
            icon={<Download className="h-4 w-4" />}
            onClick={exportToCSV}
            disabled={loading}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Department"
            name="department"
            value={filters.department || ''}
            onChange={handleFilterChange}
            options={departments}
          />
          <Input
            label="Search"
            name="search"
            value={filters.search || ''}
            onChange={handleFilterChange}
            placeholder="Name or employee no"
          />
        </div>
      </Card>

      <Card padding="none">
        <Table
          columns={columns}
          data={employees}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No employees found for the selected filters"
        />
      </Card>
    </div>
  );
}
