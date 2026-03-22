import { useState } from 'react';
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
  Trash2
} from
  'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from
  '@/components/ui/select';
import { exportToCSV } from '@/lib/export-utils';
import { AddUserModal, EditUserModal, ViewUserModal, ConfirmModal } from '@/components/modals';
import { Input } from '@/components/ui/input';
const allUsers = [
  { id: 1, name: 'James Ochieng', email: 'james.ochieng@cms.edu', role: 'Student', campus: 'Main', department: 'Computer Science', status: 'Active', createdAt: '2023-09-01' },
  { id: 2, name: 'Dr. Susan Wanjiku', email: 'susan.wanjiku@cms.edu', role: 'Lecturer', campus: 'Mombasa', department: 'Engineering', status: 'Active', createdAt: '2022-01-15' },
  { id: 3, name: 'Peter Kamau', email: 'peter.kamau@cms.edu', role: 'Finance Officer', campus: 'Main', department: 'Administration', status: 'Active', createdAt: '2021-06-20' },
  { id: 4, name: 'Grace Njeri', email: 'grace.njeri@cms.edu', role: 'Registrar', campus: 'Kisumu', department: 'Administration', status: 'Inactive', createdAt: '2020-03-10' },
  { id: 5, name: 'David Mwangi', email: 'david.mwangi@cms.edu', role: 'Student', campus: 'Nakuru', department: 'Business', status: 'Suspended', createdAt: '2023-09-01' },
  { id: 6, name: 'Faith Achieng', email: 'faith.achieng@cms.edu', role: 'Student', campus: 'Main', department: 'Computer Science', status: 'Active', createdAt: '2023-01-15' },
  { id: 7, name: 'John Kiprop', email: 'john.kiprop@cms.edu', role: 'Lecturer', campus: 'Main', department: 'Mathematics', status: 'Active', createdAt: '2019-08-01' },
  { id: 8, name: 'Mary Wambui', email: 'mary.wambui@cms.edu', role: 'College Admin', campus: 'Mombasa', department: 'Administration', status: 'Active', createdAt: '2018-02-20' },
  { id: 9, name: 'Samuel Otieno', email: 'samuel.otieno@cms.edu', role: 'Student', campus: 'Main', department: 'Health Sciences', status: 'Active', createdAt: '2022-09-01' },
  { id: 10, name: 'Anne Muthoni', email: 'anne.muthoni@cms.edu', role: 'Staff', campus: 'Main', department: 'Library', status: 'Active', createdAt: '2020-11-15' }];
export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
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
    if (deleteUser) {
      toast.success('User Deleted', { description: `${deleteUser.name} has been deleted successfully` });
    }
  };
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
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => toast.success('Password Reset', { description: `Reset email sent to ${row.email}` })}>
            <Key className="h-4 w-4" />
          </Button>
          {row.status === 'Active' ?
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => toast.warning('User Blocked', { description: `${row.name} has been blocked` })}>
              <Lock className="h-4 w-4" />
            </Button> :
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-600" onClick={() => toast.success('User Activated', { description: `${row.name} has been activated` })}>
              <Unlock className="h-4 w-4" />
            </Button>
          }
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteUser(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
    }];
  const filteredUsers = allUsers.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    return true;
  });
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-sm text-muted-foreground">Manage all system users across campuses</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input id="user-import" type="file" className="hidden" onChange={() => toast.success('Import Successful', { description: 'User list imported successfully' })} />
          <Button variant="outline" size="sm" onClick={() => document.getElementById('user-import').click()}>
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCSV({ data: allUsers, filename: 'users-list' })}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add User</span>
          </Button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{allUsers.length}</p>
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
                <p className="text-xl sm:text-2xl font-bold">{allUsers.filter((u) => u.status === 'Active').length}</p>
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
                <p className="text-xl sm:text-2xl font-bold">{allUsers.filter((u) => u.status === 'Inactive').length}</p>
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
                <p className="text-xl sm:text-2xl font-bold">{allUsers.filter((u) => u.status === 'Suspended').length}</p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Lecturer">Lecturer</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Finance Officer">Finance Officer</SelectItem>
                <SelectItem value="Registrar">Registrar</SelectItem>
                <SelectItem value="College Admin">College Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto ">
          <DataTable
            columns={userColumns}
            data={filteredUsers}
            searchPlaceholder="Search users..."
            pageSize={10}
            exportable />
        </CardContent>
      </Card>
      {/* Add User Modal */}
      <AddUserModal
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen} />
      {/* Edit User Modal */}
      <EditUserModal
        open={isEditUserOpen}
        onOpenChange={setIsEditUserOpen}
        user={selectedUser} />
      {/* View User Modal */}
      <ViewUserModal
        open={isViewUserOpen}
        onOpenChange={setIsViewUserOpen}
        user={viewUser} />
      {/* Delete User Confirmation */}
      <ConfirmModal
        open={isDeleteUserOpen}
        onOpenChange={setIsDeleteUserOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteUser} />
    </div>);
}