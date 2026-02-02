import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select } from '../../components/ui';
import { employeeApi, salaryApi } from '../../api';
import { Employee, SalaryCreate } from '../../types';
import toast from 'react-hot-toast';
import { Calculator, Save } from 'lucide-react';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
];

export function SalaryFormPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [form, setForm] = useState<SalaryCreate>({
    employee_id: 0,
    month: new Date().toISOString().slice(0, 7),
    rate_of_pay: 0,
    month_days: 30,
    overtime_hours: 0,
    total_days_worked: 0,
    advance: 0,
    notes: '',
    signature: '',
    status: 'pending',
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeApi.getAll(0, 500);
        setEmployees(data.employees || []);
      } catch (error) {
        toast.error('Failed to load employees');
        console.error(error);
      }
    };
    loadEmployees();
  }, []);

  const employeeOptions = useMemo(
    () => [
      { value: '', label: 'Select Employee' },
      ...employees.map((e) => ({ value: e.id.toString(), label: `${e.name} (${e.employee_no})` })),
    ],
    [employees]
  );

  const updateField = (key: keyof SalaryCreate, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = async () => {
    if (!form.employee_id || !form.month || !form.rate_of_pay) {
      toast.error('Please select employee, month, and rate of pay');
      return;
    }

    try {
      setCalculating(true);
      const result = await salaryApi.calculate({
        employee_id: form.employee_id,
        month: form.month,
        rate_of_pay: form.rate_of_pay,
        advance: form.advance || 0,
      });

      setForm((prev) => ({
        ...prev,
        total_days_worked: result.total_days_worked,
        overtime_hours: result.overtime_hours,
      }));

      toast.success('Attendance data calculated');
    } catch (error) {
      toast.error('Failed to calculate salary from attendance');
      console.error(error);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.month || !form.rate_of_pay) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      await salaryApi.create({
        ...form,
        employee_id: Number(form.employee_id),
        rate_of_pay: Number(form.rate_of_pay),
        month_days: Number(form.month_days || 30),
        overtime_hours: Number(form.overtime_hours || 0),
        total_days_worked: Number(form.total_days_worked || 0),
        advance: Number(form.advance || 0),
      });

      toast.success('Salary record created');
      setForm((prev) => ({
        ...prev,
        rate_of_pay: 0,
        overtime_hours: 0,
        total_days_worked: 0,
        advance: 0,
        notes: '',
        signature: '',
        status: 'pending',
      }));
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create salary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Salary Form</h1>
          <p className="text-gray-600">Create salary record for employees</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleCalculate} disabled={calculating}>
            <Calculator className="h-4 w-4 mr-2" />
            {calculating ? 'Calculating...' : 'Auto Calculate'}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Salary'}
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Select
            label="Employee"
            options={employeeOptions}
            value={form.employee_id ? String(form.employee_id) : ''}
            onChange={(e) => updateField('employee_id', Number(e.target.value))}
            placeholder="Select Employee"
          />

          <Input
            label="Month"
            type="month"
            value={form.month}
            onChange={(e) => updateField('month', e.target.value)}
          />

          <Input
            label="Rate of Pay"
            type="number"
            min={0}
            step={0.01}
            value={form.rate_of_pay}
            onChange={(e) => updateField('rate_of_pay', Number(e.target.value))}
          />

          <Input
            label="Month Days"
            type="number"
            min={1}
            max={31}
            value={form.month_days || 30}
            onChange={(e) => updateField('month_days', Number(e.target.value))}
          />

          <Input
            label="Overtime (Hours)"
            type="number"
            min={0}
            step={0.1}
            value={form.overtime_hours || 0}
            onChange={(e) => updateField('overtime_hours', Number(e.target.value))}
          />

          <Input
            label="Total Days of Work"
            type="number"
            min={0}
            value={form.total_days_worked || 0}
            onChange={(e) => updateField('total_days_worked', Number(e.target.value))}
          />

          <Input
            label="Advance"
            type="number"
            min={0}
            step={0.01}
            value={form.advance || 0}
            onChange={(e) => updateField('advance', Number(e.target.value))}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={form.status || 'pending'}
            onChange={(e) => updateField('status', e.target.value)}
          />

          <Input
            label="Signature"
            value={form.signature || ''}
            onChange={(e) => updateField('signature', e.target.value)}
          />

          <Input
            label="Notes"
            value={form.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
}
