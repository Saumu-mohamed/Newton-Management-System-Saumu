import { useState } from 'react';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Users,
  UserCog,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download } from
'lucide-react';
import {
  ViewStaffModal,
  EditStaffModal,
  AddStaffModal,
  ConfirmModal } from
'@/components/modals';
const initialStaffList = [
{ id: 1, name: 'Dr. James Kiprop', email: 'j.kiprop@cms.edu', phone: '+254 722 123 456', department: 'Computer Science', position: 'Senior Lecturer', status: 'Active' },
{ id: 2, name: 'Prof. Susan Wanjiku', email: 's.wanjiku@cms.edu', phone: '+254 733 234 567', department: 'Electrical Eng.', position: 'Professor', status: 'Active' },
{ id: 3, name: 'Dr. Peter Kamau', email: 'p.kamau@cms.edu', phone: '+254 722 345 678', department: 'Civil Engineering', position: 'HOD', status: 'Active' },
{ id: 4, name: 'Grace Muthoni', email: 'g.muthoni@cms.edu', phone: '+254 711 456 789', department: 'Finance', position: 'Finance Officer', status: 'Active' },
{ id: 5, name: 'Peter Ochieng', email: 'p.ochieng@cms.edu', phone: '+254 722 567 890', department: 'Registry', position: 'Registrar', status: 'Active' },
{ id: 6, name: 'Mary Wanjiku', email: 'm.wanjiku@cms.edu', phone: '+254 733 678 901', department: 'Administration', position: 'College Admin', status: 'Active' },
{ id: 7, name: 'Anne Muthoni', email: 'a.muthoni@cms.edu', phone: '+254 722 789 012', department: 'Library', position: 'Librarian', status: 'Active' },
{ id: 8, name: 'Samuel Otieno', email: 's.otieno@cms.edu', phone: '+254 711 890 123', department: 'IT', position: 'IT Administrator', status: 'Active' }];
export default function StaffPage() {
  const [staffList, setStaffList] = useState(initialStaffList);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const handleView = (staff) => {
    setSelectedStaff(staff);
    setIsViewOpen(true);
  };
  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setIsEditOpen(true);
  };
  const handleDelete = (staff) => {
    setDeleteItem(staff);
    setIsDeleteOpen(true);
  };
  const confirmDelete = () => {
    if (deleteItem) {
      setStaffList(staffList.filter((s) => s.id !== deleteItem.id));
      toast.success('Staff Deleted', { description: `${deleteItem.name} has been removed.` });
    }
  };
  const handleSave = (data) => {
    setStaffList(staffList.map((s) => s.id === data.id ? data : s));
  };
  const handleAdd = (data) => {
    const newStaff = { ...data, id: Math.max(...staffList.map((s) => s.id)) + 1 };
    setStaffList([...staffList, newStaff]);
  };
  const staffColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'department', label: 'Department' },
  {
    key: 'position',
    label: 'Position',
    render: (value) => <Badge variant="outline">{value}</Badge>
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: 'actions',
    label: '',
    render: (_, row) =>
    <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
  }];
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Manage all staff members across departments</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Exporting', { description: 'Exporting staff list...' })}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Staff</span>
          </Button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{staffList.length}</p>
                <p className="text-xs text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <UserCog className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{staffList.filter((s) => s.status === 'Active').length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Staff</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <DataTable
            columns={staffColumns}
            data={staffList}
            searchPlaceholder="Search staff..."
            pageSize={10}
            exportable />
        </CardContent>
      </Card>
      {/* Modals */}
      <ViewStaffModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        staff={selectedStaff} />
      <EditStaffModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        staff={selectedStaff}
        onSave={handleSave} />
      <AddStaffModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd} />
      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${deleteItem?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete} />
    </div>);
}