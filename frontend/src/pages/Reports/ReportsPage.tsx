import { useState, useEffect, useCallback } from 'react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { Download, Calendar, FileText } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  StatCard,
  Table,
  Badge,
} from '../../components/ui';
import { attendanceApi, employeeApi } from '../../api';
import { Attendance, DailyAttendanceSummary } from '../../types';
import toast from 'react-hot-toast';

type ReportType = 'daily' | 'monthly';

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

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  // Daily report data
  const [dailySummary, setDailySummary] = useState<DailyAttendanceSummary | null>(null);
  const [dailyRecords, setDailyRecords] = useState<Attendance[]>([]);

  // Monthly report data
  const [monthlyData, setMonthlyData] = useState<
    { date: string; present: number; absent: number }[]
  >([]);
  const [monthlyRecords, setMonthlyRecords] = useState<Attendance[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const fetchDailyReport = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, records] = await Promise.all([
        attendanceApi.getSummary(selectedDate),
        attendanceApi.getByDate(selectedDate, 0, 500),
      ]);
      setDailySummary(summary);
      setDailyRecords(
        department
          ? records.records.filter((r) => r.department === department)
          : records.records
      );
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

      const [employeesData, attendanceData] = await Promise.all([
        employeeApi.getAll(0, 1),
        attendanceApi.getAll(0, 1000, {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          department: department || undefined,
        }),
      ]);

      setTotalEmployees(employeesData.total);
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
          absent: employeesData.total - dayRecords.length,
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

  const exportToCSV = () => {
    const records = reportType === 'daily' ? dailyRecords : monthlyRecords;

    if (records.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Employee No',
      'Name',
      'Department',
      'Time In',
      'Time Out',
      'Total Hours',
      'Overtime',
    ];

    const rows = records.map((r) => [
      r.attendance_date,
      r.employee_no,
      r.employee_name,
      r.department || '',
      r.time_in || '',
      r.time_out || '',
      r.total_work_minutes
        ? `${Math.floor(r.total_work_minutes / 60)}h ${r.total_work_minutes % 60}m`
        : '',
      r.overtime ? `${r.overtime_minutes} mins` : 'No',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${reportType}-${
      reportType === 'daily' ? selectedDate : selectedMonth
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported successfully');
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

  const columns = [
    {
      key: 'attendance_date',
      header: 'Date',
      render: (item: Attendance) =>
        format(new Date(item.attendance_date), 'MMM d, yyyy'),
    },
    { key: 'employee_no', header: 'Emp No' },
    { key: 'employee_name', header: 'Name' },
    { key: 'department', header: 'Department' },
    {
      key: 'time_in',
      header: 'Time In',
      render: (item: Attendance) => formatTime(item.time_in),
    },
    {
      key: 'time_out',
      header: 'Time Out',
      render: (item: Attendance) => formatTime(item.time_out),
    },
    {
      key: 'total_work_minutes',
      header: 'Total',
      render: (item: Attendance) =>
        item.total_work_minutes ? formatMinutes(item.total_work_minutes) : '-',
    },
    {
      key: 'overtime',
      header: 'Overtime',
      render: (item: Attendance) => (
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
          icon={<Download className="h-4 w-4" />}
          onClick={exportToCSV}
          disabled={loading}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          data={reportType === 'daily' ? dailyRecords : monthlyRecords}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No records found"
        />
      </Card>
    </div>
  );
}
