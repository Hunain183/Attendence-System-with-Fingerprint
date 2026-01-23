import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { Button, Input, Select, Table, Card, Badge } from '../../components/ui';
import { attendanceApi } from '../../api';
import { Attendance, AttendanceFilters } from '../../types';
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

export function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AttendanceFilters>({
    start_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getAll(0, 100, filters);
      setAttendance(data.records);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load attendance records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleReset = () => {
    setFilters({
      start_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
    });
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
      render: (item: Attendance) => (
        <span className="font-mono">{formatTime(item.time_in)}</span>
      ),
    },
    {
      key: 'time_out',
      header: 'Time Out',
      render: (item: Attendance) => (
        <span className="font-mono">{formatTime(item.time_out)}</span>
      ),
    },
    {
      key: 'total_work_minutes',
      header: 'Total Hours',
      render: (item: Attendance) =>
        item.total_work_minutes ? formatMinutes(item.total_work_minutes) : '-',
    },
    {
      key: 'overtime',
      header: 'Overtime',
      render: (item: Attendance) =>
        item.overtime ? (
          <Badge variant="success">
            +{formatMinutes(item.overtime_minutes)}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Attendance) => (
        <Badge
          variant={
            item.time_out
              ? 'success'
              : item.time_in
              ? 'warning'
              : 'default'
          }
        >
          {item.time_out ? 'Complete' : item.time_in ? 'In Progress' : 'Absent'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
          <p className="text-gray-500 mt-1">
            View attendance records ({total} records)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchAttendance}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
              <Input
                label="Start Date"
                type="date"
                name="start_date"
                value={filters.start_date || ''}
                onChange={handleFilterChange}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-8 h-5 w-5 text-gray-400" />
              <Input
                label="End Date"
                type="date"
                name="end_date"
                value={filters.end_date || ''}
                onChange={handleFilterChange}
                className="pl-10"
              />
            </div>
            <Select
              label="Department"
              name="department"
              value={filters.department || ''}
              onChange={handleFilterChange}
              options={departments}
            />
            <Input
              label="Employee No"
              name="employee_no"
              value={filters.employee_no || ''}
              onChange={handleFilterChange}
              placeholder="Filter by employee"
            />
          </div>
          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button variant="ghost" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={attendance}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No attendance records found for the selected filters"
        />
      </Card>
    </div>
  );
}
