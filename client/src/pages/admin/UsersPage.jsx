import { useEffect, useState } from 'react';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Eye,
  Edit,
  Key,
  Lock,
  Unlock,
  Filter,
  Trash2,
  Loader2 } from
'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { exportToCSV, importFromCSV, triggerFileUpload } from '@/lib/export-utils';
import { AddUserModal, EditUserModal, ViewUserModal, ConfirmModal } from '@/components/modals';
import {
  createUser as createUserRequest,
  deleteUser as deleteUserRequest,
  getUsers as getUsersRequest,
  importUsers as importUsersRequest,
  resetUserPassword,
  updateUser as updateUserRequest,
  updateUserStatus as updateUserStatusRequest } from
'@/services/userManagementService';

const roleOptions = ['Student', 'Lecturer', 'Finance Officer', 'Registrar', 'College Admin'];
const statusOptions = ['Active', 'Suspended'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsersRequest();
      setUsers(response.users || []);
      setStats(response.stats || null);
    } catch (error) {
      toast.error('Load Failed', {
        description: error?.response?.data?.message || 'Failed to load users.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleViewUser = (user) => {
    setViewUser(user);
    setIsViewUserOpen(true);
  };

  const handleDeleteUser = (user) => {
    setDeleteUser(user);
    setIsDeleteUserOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUser) return;

    await deleteUserRequest(deleteUser.id);
    toast.success('User Deleted', { description: `${deleteUser.name} has been deleted successfully.` });
    setIsDeleteUserOpen(false);
    setDeleteUser(null);
    await loadUsers();
  };

  const handleCreateUser = async (payload) => {
    const response = await createUserRequest(payload);
    toast.success('User Created', {
      description: response.tempPassword ?
      `Temporary password: ${response.tempPassword}` :
      `${payload.name} has been added successfully.`
    });
    await loadUsers();
  };

  const handleUpdateUser = async (payload) => {
    const response = await updateUserRequest(payload.id, payload);
    toast.success('User Updated', {
      description: `${response.user?.name || payload.name} has been updated successfully.`
    });
    await loadUsers();
  };

  const handleResetPassword = async (user) => {
    try {
      const response = await resetUserPassword(user.id);
      toast.success('Password Reset', {
        description: response.tempPassword ?
        `Temporary password: ${response.tempPassword}` :
        `Temporary password reset for ${user.email}.`
      });
    } catch (error) {
      toast.error('Reset Failed', {
        description: error?.response?.data?.message || 'Failed to reset password.'
      });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const shouldActivate = user.status !== 'Active';
      const response = await updateUserStatusRequest(user.id, shouldActivate);
      toast.success(shouldActivate ? 'User Activated' : 'User Suspended', {
        description: response?.message || `${user.name} status updated.`
      });
      await loadUsers();
    } catch (error) {
      toast.error('Status Update Failed', {
        description: error?.response?.data?.message || 'Failed to update user status.'
      });
    }
  };

  const handleImportUsers = () => {
    setImporting(true);

    triggerFileUpload('.csv', (file) => {
      importFromCSV(
        file,
        async (rows) => {
          try {
            const payload = rows.map((row) => ({
              name: row.name || row.Name || '',
              email: row.email || row.Email || '',
              role: row.role || row.Role || '',
              campus: row.campus || row.Campus || '',
              department: row.department || row.Department || '',
              status: row.status || row.Status || 'Active'
            })).filter((row) => row.name && row.email && row.role);

            const response = await importUsersRequest(payload);
            toast.success('Import Complete', {
              description: `${response.users?.length || 0} users imported successfully.`
            });
            if (response.skipped?.length) {
              toast.info('Import Skipped Rows', {
                description: `${response.skipped.length} rows were skipped due to validation or duplicates.`
              });
            }
            await loadUsers();
          } catch (error) {
            toast.error('Import Failed', {
              description: error?.response?.data?.message || 'Failed to import users.'
            });
          } finally {
            setImporting(false);
          }
        },
        () => setImporting(false)
      );
    });

    setTimeout(() => setImporting(false), 500);
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    return true;
  });

  const userColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Role',
    render: (value) =>
    <Badge variant={value === 'Student' ? 'secondary' : value === 'Lecturer' ? 'default' : 'outline'}>
        {value}
      </Badge>
  },
  { key: 'campus', label: 'Campus' },
  { key: 'department', label: 'Department' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <StatusBadge status={value} />
  },
  { key: 'createdAt', label: 'Created', sortable: true },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) =>
    <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewUser(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditUser(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleResetPassword(row)}>
            <Key className="h-4 w-4" />
          </Button>
          {row.status === 'Active' ?
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleToggleStatus(row)}>
              <Lock className="h-4 w-4" />
            </Button> :
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-600" onClick={() => handleToggleStatus(row)}>
              <Unlock className="h-4 w-4" />
            </Button>
        }
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteUser(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
  }];

  const totalUsers = stats?.total ?? users.length;
  const activeUsers = stats?.active ?? users.filter((user) => user.status === 'Active').length;
  const suspendedUsers = stats?.suspended ?? users.filter((user) => user.status === 'Suspended').length;
  const inactiveUsers = Math.max(totalUsers - activeUsers - suspendedUsers, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-sm text-muted-foreground">Manage all system users across campuses</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImportUsers} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Upload className="h-4 w-4 sm:mr-2" />}
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCSV({ data: filteredUsers, filename: 'users-list' })}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add User</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{inactiveUsers}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{suspendedUsers}</p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((role) =>
                <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) =>
                <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ?
          <div className="py-10 text-sm text-muted-foreground">Loading users...</div> :
          <DataTable
            columns={userColumns}
            data={filteredUsers}
            searchPlaceholder="Search users..."
            pageSize={10}
            exportable />
          }
        </CardContent>
      </Card>

      <AddUserModal
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSubmit={handleCreateUser} />
      <EditUserModal
        open={isEditUserOpen}
        onOpenChange={setIsEditUserOpen}
        user={selectedUser}
        onSubmit={handleUpdateUser} />
      <ViewUserModal
        open={isViewUserOpen}
        onOpenChange={setIsViewUserOpen}
        user={viewUser} />
      <ConfirmModal
        open={isDeleteUserOpen}
        onOpenChange={setIsDeleteUserOpen}
        title="Delete User"
        description={deleteUser ? `Delete ${deleteUser.name}? This action cannot be undone.` : 'Delete this user?'}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteUser} />
    </div>);
}
