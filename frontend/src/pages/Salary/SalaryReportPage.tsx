import { useEffect, useState } from 'react';
import { Card, Input, Select, Button, Table, Badge } from '../../components/ui';
import { salaryApi } from '../../api';
import { Salary } from '../../types';
import toast from 'react-hot-toast';
import { Download, RefreshCw } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
];

export function SalaryReportPage() {
  const [records, setRecords] = useState<Salary[]>([]);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const data = await salaryApi.getAll({
        month: month || undefined,
        status: status || undefined,
        limit: 500,
      });
      setRecords(data);
    } catch (error) {
      toast.error('Failed to load salary report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const exportToCSV = () => {
    if (records.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Name',
      'Designation',
      'Rate of Pay',
      'Month Days',
      'Overtime (Hours)',
      'Total Days of Work',
      'Amount',
      'Advance',
      'Net Amount',
      'Signature',
    ];

    const rows = records.map((r) => [
      r.employee_name || '',
      r.designation || '',
      r.rate_of_pay,
      r.month_days,
      r.overtime_hours,
      r.total_days_worked,
      r.amount,
      r.advance,
      r.net_amount,
      r.signature || '',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-report-${month || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const columns = [
    { key: 'employee_name', header: 'Name' },
    { key: 'designation', header: 'Designation' },
    { key: 'rate_of_pay', header: 'Rate of Pay' },
    { key: 'month_days', header: 'Month Days' },
    { key: 'overtime_hours', header: 'Overtime (Hours)' },
    { key: 'total_days_worked', header: 'Total Days of Work' },
    { key: 'amount', header: 'Amount' },
    { key: 'advance', header: 'Advance' },
    { key: 'net_amount', header: 'Net Amount' },
    { key: 'signature', header: 'Signature' },
    {
      key: 'status',
      header: 'Status',
      render: (item: Salary) => (
        <Badge
          variant={
            item.status === 'paid'
              ? 'success'
              : item.status === 'approved'
              ? 'info'
              : 'warning'
          }
        >
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Salary Report</h1>
          <p className="text-gray-600">Monthly salary report for employees</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchSalaries}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={fetchSalaries} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={records}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No salary records found"
      />
    </div>
  );
}
