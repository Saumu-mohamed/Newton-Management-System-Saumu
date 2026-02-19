import { useState } from 'react';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  BookOpen,
  Plus,
  Eye,
  Edit,
  UserCog,
  Trash2 } from
'lucide-react';
import { AddDepartmentModal, EditDepartmentModal, ViewDepartmentModal, ConfirmModal } from '@/components/modals';
const departments = [
{ id: 1, name: 'Computer Science', faculty: 'Engineering', head: 'Dr. James Kiprop', students: 320, lecturers: 18, courses: 24, status: 'Active' },
{ id: 2, name: 'Electrical Engineering', faculty: 'Engineering', head: 'Prof. Susan Wanjiku', students: 280, lecturers: 15, courses: 22, status: 'Active' },
{ id: 3, name: 'Civil Engineering', faculty: 'Engineering', head: 'Dr. Peter Kamau', students: 245, lecturers: 14, courses: 20, status: 'Active' },
{ id: 4, name: 'Accounting', faculty: 'Business', head: 'Dr. Grace Muthoni', students: 380, lecturers: 12, courses: 18, status: 'Active' },
{ id: 5, name: 'Marketing', faculty: 'Business', head: 'Mr. John Otieno', students: 290, lecturers: 10, courses: 15, status: 'Active' },
{ id: 6, name: 'Medicine', faculty: 'Health Sciences', head: 'Prof. Mary Njeri', students: 180, lecturers: 22, courses: 30, status: 'Active' },
{ id: 7, name: 'Nursing', faculty: 'Health Sciences', head: 'Dr. Anne Wambui', students: 220, lecturers: 16, courses: 20, status: 'Active' },
{ id: 8, name: 'Mathematics', faculty: 'Science', head: 'Prof. David Mwangi', students: 150, lecturers: 12, courses: 16, status: 'Active' }];
export default function DepartmentsPage() {
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isViewDeptOpen, setIsViewDeptOpen] = useState(false);
  const [isDeleteDeptOpen, setIsDeleteDeptOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewDept, setViewDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const totalStudents = departments.reduce((sum, d) => sum + d.students, 0);
  const totalLecturers = departments.reduce((sum, d) => sum + d.lecturers, 0);
  const handleEditDept = (dept) => {
    setSelectedDept(dept);
    setIsEditDeptOpen(true);
  };
  const handleViewDept = (dept) => {
    setViewDept(dept);
    setIsViewDeptOpen(true);
  };
  const handleDeleteDept = (dept) => {
    setDeleteDept(dept);
    setIsDeleteDeptOpen(true);
  };
  const confirmDeleteDept = async () => {
    if (deleteDept) {
      toast.success('Department Deleted', { description: `${deleteDept.name} has been deleted successfully` });
    }
  };
  const deptColumns = [
  { key: 'name', label: 'Department', sortable: true },
  { key: 'faculty', label: 'Faculty' },
  { key: 'head', label: 'Head of Dept' },
  { key: 'students', label: 'Students', sortable: true },
  { key: 'lecturers', label: 'Lecturers', sortable: true },
  { key: 'courses', label: 'Courses' },
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
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewDept(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditDept(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteDept(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
  }];
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground">Manage academic departments and faculties</p>
        </div>
        <Button size="sm" onClick={() => setIsAddDeptOpen(true)}>
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Department</span>
        </Button>
      </div>
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{departments.length}</p>
                <p className="text-xs text-muted-foreground">Departments</p>
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
                <p className="text-xl sm:text-2xl font-bold">{totalStudents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
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
                <p className="text-xl sm:text-2xl font-bold">{totalLecturers}</p>
                <p className="text-xs text-muted-foreground">Total Lecturers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <BookOpen className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{departments.reduce((sum, d) => sum + d.courses, 0)}</p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Departments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <DataTable
            columns={deptColumns}
            data={departments}
            searchPlaceholder="Search departments..."
            pageSize={10} />
        </CardContent>
      </Card>
      {/* Add Department Modal */}
      <AddDepartmentModal
        open={isAddDeptOpen}
        onOpenChange={setIsAddDeptOpen} />
      {/* Edit Department Modal */}
      <EditDepartmentModal
        open={isEditDeptOpen}
        onOpenChange={setIsEditDeptOpen}
        department={selectedDept} />
      {/* View Department Modal */}
      <ViewDepartmentModal
        open={isViewDeptOpen}
        onOpenChange={setIsViewDeptOpen}
        department={viewDept} />
      {/* Delete Department Confirmation */}
      <ConfirmModal
        open={isDeleteDeptOpen}
        onOpenChange={setIsDeleteDeptOpen}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteDept?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteDept} />
    </div>);
}