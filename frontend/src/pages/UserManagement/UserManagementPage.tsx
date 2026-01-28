import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input } from '../../components/ui';
import { userApi } from '../../api';
import { UserResponse } from '../../types';
import toast from 'react-hot-toast';

export function UserManagementPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await userApi.approve(userId);
      toast.success('User approved successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handlePromote = async (userId: number) => {
    try {
      await userApi.promote(userId);
      toast.success('User promoted to secondary admin');
      loadUsers();
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  const handleDemote = async (userId: number) => {
    try {
      await userApi.demote(userId);
      toast.success('User demoted to regular user');
      loadUsers();
    } catch (error) {
      toast.error('Failed to demote user');
    }
  };

  const handleDeleteClick = (user: UserResponse) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setDeletePassword('');
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    if (!deletePassword) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    try {
      setDeleting(true);
      await userApi.delete(selectedUser.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      setDeletePassword('');
      loadUsers();
    } catch (error) {
      const errorMsg =
        (error as any)?.response?.data?.detail ||
        'Failed to delete user';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const pendingUsers = users.filter((u) => !u.is_active);
  const activeUsers = users.filter((u) => u.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Manage user accounts, approvals, and permissions
        </p>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Pending Approval
              <Badge variant="warning">{pendingUsers.length}</Badge>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Users awaiting account activation
            </p>
          </div>

          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-600">
                    Registered: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleApprove(user.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Users Section */}
      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Active Users
            <Badge variant="success">{activeUsers.length}</Badge>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Approved users with system access
          </p>
        </div>

        {activeUsers.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No active users</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Username
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {user.username}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.role === 'secondary_admin' ? 'success' : 'info'
                        }
                      >
                        {user.role === 'secondary_admin'
                          ? 'Secondary Admin'
                          : 'User'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {user.role === 'user' && (
                        <Button
                          onClick={() => handlePromote(user.id)}
                          variant="secondary"
                          className="text-sm"
                        >
                          Promote
                        </Button>
                      )}
                      {user.role === 'secondary_admin' && (
                        <Button
                          onClick={() => handleDemote(user.id)}
                          variant="secondary"
                          className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          Demote
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteClick(user)}
                        className="bg-red-600 hover:bg-red-700 text-sm"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete user{' '}
            <strong>{selectedUser?.username}</strong>? This action cannot be undone.
          </p>
          <Input
            label="Enter your password to confirm"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Password"
            disabled={deleting}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
