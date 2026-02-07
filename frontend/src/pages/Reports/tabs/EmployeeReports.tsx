import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Printer, RefreshCw } from 'lucide-react';
import { Button, Input, Select, Card, Table } from '../../../components/ui';
import { employeeApi } from '../../../api';
import { Employee, EmployeeFilters } from '../../../types';
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

export function EmployeeReports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [performaLoading, setPerformaLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
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

  const fetchEmployeeOptions = useCallback(async () => {
    try {
      setPerformaLoading(true);
      const data = await employeeApi.getAll(0, 500);
      setAllEmployees(data.employees);
    } catch (error) {
      toast.error('Failed to load employee list');
      console.error(error);
    } finally {
      setPerformaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployeeOptions();
  }, [fetchEmployeeOptions]);

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

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('en-PK');
  };

  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return allEmployees.find((e) => e.id === Number(selectedEmployeeId)) || null;
  }, [selectedEmployeeId, allEmployees]);

  const printableValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return '________________';
    return String(value);
  };

  const printableDate = (value?: string | null) => {
    if (!value) return '________________';
    return format(new Date(value), 'MMM d, yyyy');
  };

  const printablePicture = (value?: string | null) => {
    if (!value) return 'PICTURE';
    const trimmed = value.trim();
    const isDataUrl = trimmed.startsWith('data:image/');
    const isHttpUrl = /^https?:\/\//.test(trimmed);
    if (isDataUrl || isHttpUrl) {
      return `<img src="${trimmed}" alt="Employee" style="width:72px;height:72px;object-fit:cover;border-radius:6px;border:1px solid #d1d5db;" />`;
    }
    return trimmed.length > 60 ? 'Provided' : trimmed;
  };

  const printableCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return '________________';
    return formatCurrency(value);
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
    const waitForImages = () => {
      const images = Array.from(printWindow.document.images || []);
      if (images.length === 0) {
        printWindow.print();
        return;
      }
      let loaded = 0;
      const done = () => {
        loaded += 1;
        if (loaded === images.length) {
          printWindow.print();
        }
      };
      images.forEach((img) => {
        if (img.complete) {
          done();
        } else {
          img.onload = done;
          img.onerror = done;
        }
      });
    };

    setTimeout(waitForImages, 0);
  };

  const handlePrintPerforma = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const e = selectedEmployee;
    const computedTotalSalary = e
      ? e.total_salary ??
        (e.monthly_salary == null && e.increment == null
          ? null
          : (e.monthly_salary || 0) + (e.increment || 0))
      : null;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Employee Performa</title>
        <style>
          body {
            font-family: "Segoe UI", Arial, sans-serif;
            margin: 24px;
            color: #111827;
            background: #fff;
          }
          .page {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
          }
          .header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .header-left {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .picture-box {
            width: 96px;
            height: 96px;
            border: 1px solid #9ca3af;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            overflow: hidden;
          }
          .picture-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .personal-section {
            position: relative;
            padding-right: 120px;
          }
          .picture-float {
            position: absolute;
            top: 34px;
            right: 0;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .meta {
            font-size: 12px;
            color: #6b7280;
          }
          .section {
            margin-top: 18px;
          }
          .section-title {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 24px;
          }
          .field {
            display: flex;
            gap: 8px;
            font-size: 13px;
          }
          .label {
            min-width: 150px;
            font-weight: 600;
            color: #374151;
          }
          .value {
            flex: 1;
            border-bottom: 1px dotted #cbd5e1;
            padding-bottom: 2px;
          }
          .full {
            grid-column: 1 / -1;
          }
          .signatures {
            margin-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .sig-left {
            flex: 1;
          }
          .sig-center {
            flex: 1;
            display: flex;
            justify-content: center;
          }
          .sig-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-end;
          }
          .sig-block {
            min-width: 160px;
            text-align: center;
            font-size: 12px;
          }
          .sig-line {
            letter-spacing: 1px;
          }
          .sig-label {
            margin-top: 6px;
            color: #374151;
            font-weight: 600;
          }
          @media print {
            body { margin: 0; }
            .page { border: none; border-radius: 0; padding: 12px; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="header-left">
              <div class="title">Employee Performa</div>
              <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <div class="section personal-section">
            <div class="section-title">Personal Details</div>
            <div class="picture-float">
              <div class="picture-box">${printablePicture(e?.picture)}</div>
            </div>
            <div class="grid">
              <div class="field"><div class="label">Employee No</div><div class="value">${printableValue(e?.employee_no)}</div></div>
              <div class="field"><div class="label">CNIC</div><div class="value">${printableValue(e?.cnic)}</div></div>
              <div class="field"><div class="label">Name</div><div class="value">${printableValue(e?.name)}</div></div>
              <div class="field"><div class="label">Father's Name</div><div class="value">${printableValue(e?.father_name)}</div></div>
              <div class="field"><div class="label">Phone Number</div><div class="value">${printableValue(e?.phone_number)}</div></div>
              <div class="field"><div class="label">Date of Birth</div><div class="value">${printableDate(e?.date_of_birth)}</div></div>
              <div class="field"><div class="label">Gender</div><div class="value">${printableValue(e?.gender)}</div></div>
              <div class="field"><div class="label">Blood Group</div><div class="value">${printableValue(e?.blood_group)}</div></div>
              <div class="field"><div class="label">Marital Status</div><div class="value">${printableValue(e?.marital_status)}</div></div>
              <div class="field"><div class="label">Emergency Contact No</div><div class="value">${printableValue(e?.emergency_contact_no)}</div></div>
              <div class="field full"><div class="label">Permanent Address</div><div class="value">${printableValue(e?.permanent_address)}</div></div>
              <div class="field full"><div class="label">Current Address</div><div class="value">${printableValue(e?.current_address)}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Employment Details</div>
            <div class="grid">
              <div class="field"><div class="label">Employment Type</div><div class="value">${printableValue(e?.employment_type)}</div></div>
              <div class="field"><div class="label">Head of Department</div><div class="value">${printableValue(e?.hod)}</div></div>
              <div class="field"><div class="label">Department</div><div class="value">${printableValue(e?.department)}</div></div>
              <div class="field"><div class="label">Sub Department</div><div class="value">${printableValue(e?.sub_department)}</div></div>
              <div class="field"><div class="label">Designation</div><div class="value">${printableValue(e?.designation)}</div></div>
              <div class="field"><div class="label">Shift</div><div class="value">${printableValue(e?.shift)}</div></div>
              <div class="field"><div class="label">Date of Joining</div><div class="value">${printableDate(e?.date_of_joining)}</div></div>
              <div class="field"><div class="label">Quit Date</div><div class="value">${printableDate(e?.quit_date)}</div></div>
              <div class="field full"><div class="label">Remarks</div><div class="value">${printableValue(e?.remarks)}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Salary Details</div>
            <div class="grid">
              <div class="field"><div class="label">Monthly Salary (PKR)</div><div class="value">${printableCurrency(e?.monthly_salary)}</div></div>
              <div class="field"><div class="label">Rate Per Day (PKR)</div><div class="value">${printableCurrency(e?.rate_per_day)}</div></div>
              <div class="field"><div class="label">Increment (PKR)</div><div class="value">${printableCurrency(e?.increment)}</div></div>
              <div class="field"><div class="label">Date of Increment</div><div class="value">${printableDate(e?.date_of_increment)}</div></div>
              <div class="field"><div class="label">Total Salary</div><div class="value">${printableCurrency(computedTotalSalary)}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">References</div>
            <div class="grid">
              <div class="field"><div class="label">Reference 1</div><div class="value">${printableValue(e?.reference_1)}</div></div>
              <div class="field"><div class="label">Reference Address 1</div><div class="value">${printableValue(e?.reference_address_1)}</div></div>
              <div class="field"><div class="label">Reference 2</div><div class="value">${printableValue(e?.reference_2)}</div></div>
              <div class="field"><div class="label">Reference Address 2</div><div class="value">${printableValue(e?.reference_address_2)}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Previous Employment</div>
            <div class="grid">
              <div class="field"><div class="label">Previous Employer</div><div class="value">${printableValue(e?.previous_employer)}</div></div>
              <div class="field"><div class="label">Address</div><div class="value">${printableValue(e?.previous_employer_address)}</div></div>
              <div class="field"><div class="label">Designation</div><div class="value">${printableValue(e?.previous_designation)}</div></div>
              <div class="field"><div class="label">Period of Service</div><div class="value">${printableValue(e?.previous_period_of_service)}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="signatures">
              <div class="sig-left">
                <div class="sig-block">
                  <div class="sig-line">____________________</div>
                  <div class="sig-label">HR-Admin Department</div>
                </div>
              </div>
              <div class="sig-center">
                <div class="sig-block">
                  <div class="sig-line">____________________</div>
                  <div class="sig-label">Head of Department</div>
                </div>
              </div>
              <div class="sig-right">
                <div class="sig-block">
                  <div class="sig-line">____________________</div>
                  <div class="sig-label">C.E.O / Director</div>
                </div>
                <div class="sig-block">
                  <div class="sig-line">____________________</div>
                  <div class="sig-label">Head of Audit</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for images to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };

    // Fallback: if onload doesn't fire within 500ms, print anyway
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.print();
      }
    }, 500);
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

      <Card className="fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Employee Performa
            </h3>
            <p className="text-sm text-gray-500">
              Print a single employee profile or a blank template
            </p>
          </div>
          <Button
            icon={<Printer className="h-4 w-4" />}
            onClick={handlePrintPerforma}
            disabled={performaLoading}
          >
            Print Performa
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Select Employee"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            options={[
              { value: '', label: 'Empty (Blank)' },
              ...allEmployees.map((e) => ({
                value: String(e.id),
                label: `${e.employee_no} - ${e.name}`,
              })),
            ]}
          />
          <Input
            label="Generated On"
            value={new Date().toLocaleDateString()}
            disabled
          />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Preview
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Employee No</span>
              <span className="font-medium text-gray-900">
                {selectedEmployee?.employee_no || '________'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-gray-900">
                {selectedEmployee?.name || '________'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department</span>
              <span className="font-medium text-gray-900">
                {selectedEmployee?.department || '________'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Designation</span>
              <span className="font-medium text-gray-900">
                {selectedEmployee?.designation || '________'}
              </span>
            </div>
          </div>
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
