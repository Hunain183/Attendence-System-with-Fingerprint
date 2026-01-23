import { useState } from 'react';
import { Fingerprint, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';
import { employeeApi } from '../../api';
import { Employee } from '../../types';
import toast from 'react-hot-toast';

interface FingerprintModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  employee: Employee | null;
}

export function FingerprintModal({
  isOpen,
  onClose,
  employee,
}: FingerprintModalProps) {
  const [loading, setLoading] = useState(false);
  const [fingerprintTemplate, setFingerprintTemplate] = useState('');

  const handleEnroll = async () => {
    if (!employee || !fingerprintTemplate.trim()) {
      toast.error('Please enter a fingerprint template');
      return;
    }

    try {
      setLoading(true);
      await employeeApi.enrollFingerprint({
        employee_no: employee.employee_no,
        fingerprint_template: fingerprintTemplate.trim(),
      });
      toast.success('Fingerprint enrolled successfully');
      setFingerprintTemplate('');
      onClose(true);
    } catch (error) {
      const message =
        (error as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail || 'Failed to enroll fingerprint';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFingerprintTemplate('');
    onClose();
  };

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll Fingerprint"
      size="md"
    >
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-primary-100 rounded-full">
            <Fingerprint className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{employee.name}</p>
            <p className="text-sm text-gray-500">{employee.employee_no}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Instructions:</p>
            <ol className="list-decimal ml-4 mt-1 space-y-1">
              <li>Connect the fingerprint scanner device</li>
              <li>Place the employee's finger on the scanner</li>
              <li>Wait for the template to be captured</li>
              <li>Paste the fingerprint template below</li>
            </ol>
          </div>
        </div>

        {/* Current Status */}
        {employee.has_fingerprint && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Fingerprint className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700">
              Fingerprint already enrolled. Enrolling a new one will replace it.
            </span>
          </div>
        )}

        {/* Fingerprint Input */}
        <Input
          label="Fingerprint Template"
          value={fingerprintTemplate}
          onChange={(e) => setFingerprintTemplate(e.target.value)}
          placeholder="Paste fingerprint template from device SDK..."
          helperText="This is the base64 encoded fingerprint template from your scanner device"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            loading={loading}
            disabled={!fingerprintTemplate.trim()}
            icon={<Fingerprint className="h-4 w-4" />}
          >
            Enroll Fingerprint
          </Button>
        </div>
      </div>
    </Modal>
  );
}
