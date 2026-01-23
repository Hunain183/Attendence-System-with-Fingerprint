import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Fingerprint } from 'lucide-react';
import { format } from 'date-fns';
import {
  Button,
  Input,
  Table,
  Card,
  Badge,
  ConfirmDialog,
} from '../../components/ui';
import { EmployeeModal } from './EmployeeModal';
import { FingerprintModal } from './FingerprintModal';
import { employeeApi } from '../../api';
import { Employee, EmployeeFilters } from '../../types';
import toast from 'react-hot-toast';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isFingerprintModalOpen, setIsFingerprintModalOpen] = useState(false);
  const [fingerprintEmployee, setFingerprintEmployee] =
    useState<Employee | null>(null);

  // Delete confirmation
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getAll(0, 100, filters);
      setEmployees(data.employees);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load employees');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleEnrollFingerprint = (employee: Employee) => {
    setFingerprintEmployee(employee);
    setIsFingerprintModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!deleteEmployee) return;

    try {
      setIsDeleting(true);
      await employeeApi.delete(deleteEmployee.id);
      toast.success('Employee deleted successfully');
      setDeleteEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClose = (refresh?: boolean) => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    if (refresh) fetchEmployees();
  };

  const handleFingerprintClose = (refresh?: boolean) => {
    setIsFingerprintModalOpen(false);
    setFingerprintEmployee(null);
    if (refresh) fetchEmployees();
  };

  const columns = [
    { key: 'employee_no', header: 'Employee No' },
    { key: 'name', header: 'Name' },
    { key: 'department', header: 'Department' },
    { key: 'designation', header: 'Designation' },
    {
      key: 'date_of_joining',
      header: 'Joining Date',
      render: (item: Employee) =>
        item.date_of_joining
          ? format(new Date(item.date_of_joining), 'MMM d, yyyy')
          : '-',
    },
    {
      key: 'fingerprint',
      header: 'Fingerprint',
      render: (item: Employee) => (
        <Badge variant={item.has_fingerprint ? 'success' : 'warning'}>
          {item.has_fingerprint ? 'Enrolled' : 'Not Enrolled'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Employee) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEnrollFingerprint(item);
            }}
            title="Enroll Fingerprint"
          >
            <Fingerprint className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditEmployee(item);
            }}
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteEmployee(item);
            }}
            title="Delete"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-500 mt-1">
            Manage employee records ({total} total)
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={handleAddEmployee}>
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or employee number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={employees}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No employees found"
        />
      </Card>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        employee={selectedEmployee}
      />

      {/* Fingerprint Modal */}
      <FingerprintModal
        isOpen={isFingerprintModalOpen}
        onClose={handleFingerprintClose}
        employee={fingerprintEmployee}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteEmployee}
        onClose={() => setDeleteEmployee(null)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteEmployee?.name}? This action cannot be undone and will also delete all attendance records.`}
        confirmText="Delete"
        loading={isDeleting}
      />
    </div>
  );
}
