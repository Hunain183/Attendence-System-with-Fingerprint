import { useEffect, useState } from 'react';
import { Card, Input, Select, Button, Table, Badge } from '../../components/ui';
import { salaryApi } from '../../api';
import { Salary } from '../../types';
import toast from 'react-hot-toast';
import { Printer, RefreshCw } from 'lucide-react';

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = records
      .map(
        (r) => `
      <tr>
        <td>${r.employee_name || '-'}</td>
        <td>${r.designation || '-'}</td>
        <td>${r.rate_of_pay}</td>
        <td>${r.month_days}</td>
        <td>${r.overtime_hours}</td>
        <td>${r.total_days_worked}</td>
        <td>${r.amount}</td>
        <td>${r.advance}</td>
        <td>${r.net_amount}</td>
        <td>${r.signature || '-'}</td>
        <td>${r.status}</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Report</title>
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
        <h1>Salary Report</h1>
        <p>Month: ${month || 'All'} | Total Records: ${records.length}</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Rate of Pay</th>
              <th>Month Days</th>
              <th>Overtime (Hours)</th>
              <th>Total Days of Work</th>
              <th>Amount</th>
              <th>Advance</th>
              <th>Net Amount</th>
              <th>Signature</th>
              <th>Status</th>
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
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
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
