import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { Calendar, FileText, Printer } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  StatCard,
  Table,
  Badge,
} from '../../../components/ui';
import { attendanceApi, employeeApi } from '../../../api';
import { Attendance, DailyAttendanceSummary, Employee } from '../../../types';
import toast from 'react-hot-toast';

type ReportType = 'daily' | 'monthly';
type StatusFilter = '' | 'present' | 'absent' | 'half_leave' | 'full_leave';
type AttendanceStatus = 'present' | 'absent' | 'half_leave' | 'full_leave';
type AttendanceReportRow = Omit<Attendance, 'id'> & {
  id: string | number;
  status: AttendanceStatus;
};

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

export function AttendanceReports() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [loading, setLoading] = useState(false);

  // Daily report data
  const [dailySummary, setDailySummary] = useState<DailyAttendanceSummary | null>(null);
  const [dailyRecords, setDailyRecords] = useState<Attendance[]>([]);
  const [dailyEmployees, setDailyEmployees] = useState<Employee[]>([]);

  // Monthly report data
  const [monthlyData, setMonthlyData] = useState<
    { date: string; present: number; absent: number }[]
  >([]);
  const [monthlyRecords, setMonthlyRecords] = useState<Attendance[]>([]);
  const [monthlyEmployees, setMonthlyEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const loadAllEmployees = useCallback(
    async (departmentFilter?: string) => {
      const limit = 500;
      let skip = 0;
      let employees: Employee[] = [];

      while (true) {
        const response = await employeeApi.getAll(skip, limit, departmentFilter ? { department: departmentFilter } : undefined);
        employees = employees.concat(response.employees);
        if (employees.length >= response.total || response.employees.length < limit) {
          break;
        }
        skip += limit;
      }

      return employees;
    },
    []
  );

  const loadAllAttendance = useCallback(
    async (params: { start_date: string; end_date: string; department?: string }) => {
      const limit = 500;
      let skip = 0;
      let records: Attendance[] = [];

      while (true) {
        const response = await attendanceApi.getAll(skip, limit, params);
        records = records.concat(response.records);
        if (records.length >= response.total || response.records.length < limit) {
          break;
        }
        skip += limit;
      }

      return { records, total: records.length };
    },
    []
  );

  const fetchDailyReport = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, records, employees] = await Promise.all([
        attendanceApi.getSummary(selectedDate),
        attendanceApi.getByDate(selectedDate, 0, 500),
        loadAllEmployees(department || undefined),
      ]);
      setDailySummary(summary);
      setDailyRecords(
        department
          ? records.records.filter((r) => r.department === department)
          : records.records
      );
      setDailyEmployees(employees);
    } catch (error) {
      toast.error('Failed to load daily report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, department]);

  const fetchMonthlyReport = useCallback(async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));

      const [employees, attendanceData] = await Promise.all([
        loadAllEmployees(department || undefined),
        loadAllAttendance({
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          department: department || undefined,
        }),
      ]);

      setTotalEmployees(employees.length);
      setMonthlyEmployees(employees);
      setMonthlyRecords(attendanceData.records);

      // Calculate daily stats for the month
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyStats = days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayRecords = attendanceData.records.filter(
          (r) => r.attendance_date === dateStr
        );
        return {
          date: dateStr,
          present: dayRecords.length,
          absent: employees.length - dayRecords.length,
        };
      });

      setMonthlyData(dailyStats);
    } catch (error) {
      toast.error('Failed to load monthly report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, department]);

  useEffect(() => {
    if (reportType === 'daily') {
      fetchDailyReport();
    } else {
      fetchMonthlyReport();
    }
  }, [reportType, fetchDailyReport, fetchMonthlyReport]);


  const handlePrint = () => {
    const records = reportType === 'daily' ? filteredDailyRows : filteredMonthlyRows;
    
    if (records.length === 0) {
      toast.error('No data to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = records
      .map(
        (r) => `
      <tr>
        <td>${format(new Date(r.attendance_date), 'MMM d, yyyy')}</td>
        <td>${r.employee_no}</td>
        <td>${r.employee_name}</td>
        <td>${r.department || '-'}</td>
        <td>${getStatusText(r)}</td>
        <td>${r.time_in ? r.time_in.slice(0, 5) : '-'}</td>
        <td>${r.time_out ? r.time_out.slice(0, 5) : '-'}</td>
        <td>${r.total_work_minutes ? `${Math.floor(r.total_work_minutes / 60)}h ${r.total_work_minutes % 60}m` : '-'}</td>
        <td>${r.overtime ? `+${Math.floor(r.overtime_minutes / 60)}h ${r.overtime_minutes % 60}m` : '-'}</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report</title>
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
        <h1>Attendance Report</h1>
        <p>Report Type: ${reportType === 'daily' ? `Daily - ${selectedDate}` : `Monthly - ${selectedMonth}`}</p>
        <p>Total Records: ${records.length}</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee No</th>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Total Hours</th>
              <th>Overtime</th>
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

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time.slice(0, 5);
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRecordStatus = (record: Attendance): AttendanceStatus => {
    if (record.leave_type === 'half_leave') return 'half_leave';
    if (record.leave_type === 'full_leave') return 'full_leave';
    return 'present';
  };

  const getStatusText = (row: AttendanceReportRow) => {
    if (row.status === 'absent') return 'Absent';
    if (row.status === 'half_leave') return 'Half Leave';
    if (row.status === 'full_leave') return 'Full Leave';
    return 'Present';
  };

  const dailyRows = useMemo<AttendanceReportRow[]>(() => {
    if (dailyEmployees.length === 0) return [];
    const recordMap = new Map(
      dailyRecords.map((record) => [record.employee_no, record])
    );

    return dailyEmployees.map((employee) => {
      const record = recordMap.get(employee.employee_no);
      if (record) {
        return {
          ...record,
          status: getRecordStatus(record),
        };
      }

      return {
        id: `absent-${employee.employee_no}-${selectedDate}`,
        employee_no: employee.employee_no,
        employee_name: employee.name,
        department: employee.department,
        designation: employee.designation,
        attendance_date: selectedDate,
        time_in: null,
        time_out: null,
        total_work_minutes: 0,
        overtime: false,
        overtime_minutes: 0,
        leave_type: null,
        device_id: null,
        status: 'absent',
      };
    });
  }, [dailyEmployees, dailyRecords, selectedDate]);

  const monthlyRows = useMemo<AttendanceReportRow[]>(() => {
    if (monthlyEmployees.length === 0) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const recordMap = new Map(
      monthlyRecords.map((record) => [
        `${record.employee_no}-${record.attendance_date}`,
        record,
      ])
    );

    const rows: AttendanceReportRow[] = [];

    days.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      monthlyEmployees.forEach((employee) => {
        const record = recordMap.get(`${employee.employee_no}-${dateStr}`);
        if (record) {
          rows.push({
            ...record,
            status: getRecordStatus(record),
          });
        } else {
          rows.push({
            id: `absent-${employee.employee_no}-${dateStr}`,
            employee_no: employee.employee_no,
            employee_name: employee.name,
            department: employee.department,
            designation: employee.designation,
            attendance_date: dateStr,
            time_in: null,
            time_out: null,
            total_work_minutes: 0,
            overtime: false,
            overtime_minutes: 0,
            leave_type: null,
            device_id: null,
            status: 'absent',
          });
        }
      });
    });

    return rows;
  }, [monthlyEmployees, monthlyRecords, selectedMonth]);

  const filteredDailyRows = useMemo(() => {
    if (!statusFilter) return dailyRows;
    return dailyRows.filter((row) => row.status === statusFilter);
  }, [dailyRows, statusFilter]);

  const filteredMonthlyRows = useMemo(() => {
    if (!statusFilter) return monthlyRows;
    return monthlyRows.filter((row) => row.status === statusFilter);
  }, [monthlyRows, statusFilter]);

  const columns = [
    {
      key: 'attendance_date',
      header: 'Date',
      render: (item: AttendanceReportRow) =>
        format(new Date(item.attendance_date), 'MMM d, yyyy'),
    },
    { key: 'employee_no', header: 'Emp No' },
    { key: 'employee_name', header: 'Name' },
    { key: 'department', header: 'Department' },
    {
      key: 'status',
      header: 'Status',
      render: (item: AttendanceReportRow) => (
        <Badge
          variant={
            item.status === 'present'
              ? 'success'
              : item.status === 'half_leave' || item.status === 'full_leave'
              ? 'warning'
              : 'danger'
          }
        >
          {getStatusText(item)}
        </Badge>
      ),
    },
    {
      key: 'time_in',
      header: 'Time In',
      render: (item: AttendanceReportRow) => formatTime(item.time_in),
    },
    {
      key: 'time_out',
      header: 'Time Out',
      render: (item: AttendanceReportRow) => formatTime(item.time_out),
    },
    {
      key: 'total_work_minutes',
      header: 'Total',
      render: (item: AttendanceReportRow) =>
        item.total_work_minutes ? formatMinutes(item.total_work_minutes) : '-',
    },
    {
      key: 'overtime',
      header: 'Overtime',
      render: (item: AttendanceReportRow) => (
        <Badge variant={item.overtime ? 'success' : 'default'}>
          {item.overtime ? `+${formatMinutes(item.overtime_minutes)}` : 'No'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 mt-1">
            Generate and export attendance reports
          </p>
        </div>
        <Button
          icon={<Printer className="h-4 w-4" />}
          onClick={handlePrint}
          disabled={loading}
        >
          Print
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            options={[
              { value: 'daily', label: 'Daily Report' },
              { value: 'monthly', label: 'Monthly Report' },
            ]}
          />
          {reportType === 'daily' ? (
            <div className="relative">
              <Calendar className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
              <Input
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
              />
            </div>
          ) : (
            <Input
              label="Select Month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          )}
          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departments}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'present', label: 'Present' },
              { value: 'absent', label: 'Absent' },
              { value: 'half_leave', label: 'Half Leave' },
              { value: 'full_leave', label: 'Full Leave' },
            ]}
          />
        </div>
      </Card>

      {/* Summary Cards - Daily */}
      {reportType === 'daily' && dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={dailySummary.total_employees}
            icon={<FileText className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Present"
            value={dailySummary.present}
            icon={<FileText className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Absent"
            value={dailySummary.absent}
            icon={<FileText className="h-6 w-6" />}
            color="red"
          />
          <StatCard
            title="Overtime"
            value={dailySummary.overtime_count}
            icon={<FileText className="h-6 w-6" />}
            color="purple"
          />
        </div>
      )}

      {/* Summary Cards - Monthly */}
      {reportType === 'monthly' && monthlyRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Records"
            value={monthlyRecords.length}
            icon={<FileText className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon={<FileText className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Avg Daily Attendance"
            value={
              monthlyData.length > 0
                ? Math.round(
                    monthlyData.reduce((sum, d) => sum + d.present, 0) /
                      monthlyData.filter((d) => new Date(d.date) <= new Date()).length
                  )
                : 0
            }
            icon={<FileText className="h-6 w-6" />}
            color="yellow"
          />
          <StatCard
            title="Overtime Records"
            value={monthlyRecords.filter((r) => r.overtime).length}
            icon={<FileText className="h-6 w-6" />}
            color="purple"
          />
        </div>
      )}

      {/* Monthly Chart */}
      {reportType === 'monthly' && monthlyData.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Attendance Overview
          </h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {monthlyData.map((day) => {
                const percentage =
                  totalEmployees > 0
                    ? Math.round((day.present / totalEmployees) * 100)
                    : 0;
                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center"
                    title={`${format(new Date(day.date), 'MMM d')}: ${day.present} present`}
                  >
                    <div
                      className="w-6 rounded-t transition-all"
                      style={{
                        height: `${Math.max(percentage, 5)}px`,
                        backgroundColor:
                          percentage >= 80
                            ? '#22c55e'
                            : percentage >= 50
                            ? '#eab308'
                            : '#ef4444',
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {format(new Date(day.date), 'd')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Records Table */}
      <Card padding="none">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {reportType === 'daily' ? 'Daily Records' : 'Monthly Records'}
          </h3>
        </div>
        <Table
          columns={columns}
          data={reportType === 'daily' ? filteredDailyRows : filteredMonthlyRows}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No records found"
        />
      </Card>
    </div>
  );
}
