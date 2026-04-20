import { useEffect, useMemo, useState } from 'react';
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
import {
  createAcademicDepartment,
  deleteAcademicDepartment,
  getAcademicDepartments,
  updateAcademicDepartment } from
'@/services/academicService';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isViewDeptOpen, setIsViewDeptOpen] = useState(false);
  const [isDeleteDeptOpen, setIsDeleteDeptOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewDept, setViewDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getAcademicDepartments();
      setDepartments(data.departments || []);
    } catch (error) {
      toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load departments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const totalStudents = useMemo(() => departments.reduce((sum, department) => sum + Number(department.students || 0), 0), [departments]);
  const totalLecturers = useMemo(() => departments.reduce((sum, department) => sum + Number(department.lecturers || 0), 0), [departments]);

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
    if (!deleteDept) return;
    try {
      await deleteAcademicDepartment(deleteDept.id);
      toast.success('Department Deleted', { description: `${deleteDept.name} has been deleted successfully` });
      setIsDeleteDeptOpen(false);
      setDeleteDept(null);
      await loadDepartments();
    } catch (error) {
      toast.error('Delete Failed', { description: error?.response?.data?.message || 'Failed to delete department.' });
    }
  };

  const handleCreateDepartment = async (data) => {
    try {
      await createAcademicDepartment(data);
      await loadDepartments();
    } catch (error) {
      toast.error('Create Failed', { description: error?.response?.data?.message || 'Failed to create department.' });
      throw error;
    }
  };

  const handleUpdateDepartment = async (data) => {
    try {
      await updateAcademicDepartment(data.id, data);
      await loadDepartments();
    } catch (error) {
      toast.error('Update Failed', { description: error?.response?.data?.message || 'Failed to update department.' });
      throw error;
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

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div><div><p className="text-xl sm:text-2xl font-bold">{departments.length}</p><p className="text-xs text-muted-foreground">Departments</p></div></div></CardContent></Card>
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-600" /></div><div><p className="text-xl sm:text-2xl font-bold">{totalStudents.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Students</p></div></div></CardContent></Card>
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><UserCog className="h-5 w-5 text-green-600" /></div><div><p className="text-xl sm:text-2xl font-bold">{totalLecturers}</p><p className="text-xs text-muted-foreground">Total Lecturers</p></div></div></CardContent></Card>
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><BookOpen className="h-5 w-5 text-yellow-600" /></div><div><p className="text-xl sm:text-2xl font-bold">{departments.reduce((sum, department) => sum + Number(department.courses || 0), 0)}</p><p className="text-xs text-muted-foreground">Total Courses</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Departments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? <div className="py-8 text-sm text-muted-foreground">Loading departments...</div> :
          <DataTable columns={deptColumns} data={departments} searchPlaceholder="Search departments..." pageSize={10} />}
        </CardContent>
      </Card>

      <AddDepartmentModal open={isAddDeptOpen} onOpenChange={setIsAddDeptOpen} onSubmit={handleCreateDepartment} />
      <EditDepartmentModal open={isEditDeptOpen} onOpenChange={setIsEditDeptOpen} department={selectedDept} onSubmit={handleUpdateDepartment} />
      <ViewDepartmentModal open={isViewDeptOpen} onOpenChange={setIsViewDeptOpen} department={viewDept} />
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
