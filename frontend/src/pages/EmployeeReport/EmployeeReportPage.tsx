import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Printer, RefreshCw } from 'lucide-react';
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
      
      const data = await employeeApi.getAll(0, 500, apiFilters);
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

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML table with all data
    const tableRows = employees
      .map(
        (e) => `
      <tr>
        <td>${e.employee_no}</td>
        <td>${e.name}</td>
        <td>${e.father_name || '-'}</td>
        <td>${e.date_of_birth || '-'}</td>
        <td>${e.cnic || '-'}</td>
        <td>${e.phone_number || '-'}</td>
        <td>${e.permanent_address || '-'}</td>
        <td>${e.current_address || '-'}</td>
        <td>${e.reference_1 || '-'}</td>
        <td>${e.reference_address_1 || '-'}</td>
        <td>${e.reference_2 || '-'}</td>
        <td>${e.reference_address_2 || '-'}</td>
        <td>${e.employment_type || '-'}</td>
        <td>${e.department || '-'}</td>
        <td>${e.designation || '-'}</td>
        <td>${e.date_of_joining || '-'}</td>
        <td>${e.shift || '-'}</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Employee Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 10px;
            background: white;
          }
          h1 {
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #d1d5db;
            padding: 8px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          @media print {
            body {
              margin: 0;
            }
            table {
              page-break-inside: avoid;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <h1>Employee Report</h1>
        <p>Total Records: ${employees.length}</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Employee No</th>
              <th>Name</th>
              <th>Father's Name</th>
              <th>Date of Birth</th>
              <th>CNIC</th>
              <th>Phone Number</th>
              <th>Permanent Address</th>
              <th>Current Address</th>
              <th>Reference 1</th>
              <th>Reference Address 1</th>
              <th>Reference 2</th>
              <th>Reference Address 2</th>
              <th>Employment Type</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Date of Joining</th>
              <th>Shift</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
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
            icon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
            disabled={loading}
          >
            Print
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
