import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { StatCard, Card, Table, Badge } from '../../components/ui';
import { employeeApi, attendanceApi } from '../../api';
import { Attendance, DailyAttendanceSummary } from '../../types';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DailyAttendanceSummary | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, attendanceData, employeesData] = await Promise.all([
        attendanceApi.getSummary(),
        attendanceApi.getToday(0, 10),
        employeeApi.getAll(0, 1),
      ]);

      setSummary(summaryData);
      setTodayAttendance(attendanceData.records);
      setTotalEmployees(employeesData.total);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time.slice(0, 5); // HH:MM
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const attendanceColumns = [
    { key: 'employee_name', header: 'Employee' },
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
      header: 'Duration',
      render: (item: Attendance) =>
        item.total_work_minutes ? formatMinutes(item.total_work_minutes) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Attendance) => (
        <Badge variant={item.overtime ? 'success' : 'default'}>
          {item.overtime ? 'Overtime' : item.time_out ? 'Complete' : 'In Progress'}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-10 w-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Present Today"
          value={summary?.present || 0}
          icon={<UserCheck className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Absent Today"
          value={summary?.absent || 0}
          icon={<Users className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Overtime"
          value={summary?.overtime_count || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">On Time</p>
              <p className="text-xl font-bold text-gray-900">
                {summary?.on_time || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Late Arrivals</p>
              <p className="text-xl font-bold text-gray-900">
                {summary?.late || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {totalEmployees > 0
                  ? Math.round(((summary?.present || 0) / totalEmployees) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Attendance Table */}
      <Card padding="none">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Attendance
          </h3>
          <p className="text-sm text-gray-500">
            Latest attendance records for today
          </p>
        </div>
        <Table
          columns={attendanceColumns}
          data={todayAttendance}
          keyExtractor={(item) => item.id}
          emptyMessage="No attendance records for today"
        />
      </Card>
    </div>
  );
}
