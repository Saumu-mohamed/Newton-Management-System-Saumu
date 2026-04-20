import { useEffect, useState } from 'react';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  GraduationCap,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText } from
'lucide-react';
import {
  ViewStudentModal,
  EditStudentModal,
  AddStudentModal,
  ConfirmModal } from
'@/components/modals';
import { exportToCSV } from '@/lib/export-utils';
import {
  createAcademicStudent,
  deleteAcademicStudent,
  getAcademicStudents,
  getAcademicCourses,
  updateAcademicStudent } from
'@/services/academicService';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const [studentData, courseData] = await Promise.all([
      getAcademicStudents(),
      getAcademicCourses()
      ]);
      const nextStudents = studentData || [];
      const courseNames = (courseData?.courses || []).map((course) => course.name).filter(Boolean);
      const studentCourses = nextStudents.map((student) => student.course).filter(Boolean);
      const campuses = nextStudents.map((student) => student.campus).filter(Boolean);
      setStudents(nextStudents);
      setCourseOptions(Array.from(new Set([...courseNames, ...studentCourses])));
      setCampusOptions(Array.from(new Set(campuses.length ? campuses : ['Main'])));
    } catch (error) {
      toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleView = (student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const handleDelete = (student) => {
    setDeleteItem(student);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteAcademicStudent(deleteItem.id);
      toast.success('Student Deleted', { description: `${deleteItem.name} has been removed.` });
      setIsDeleteOpen(false);
      setDeleteItem(null);
      await loadStudents();
    } catch (error) {
      toast.error('Delete Failed', { description: error?.response?.data?.message || 'Failed to delete student.' });
    }
  };

  const handleSave = async (data) => {
    try {
      await updateAcademicStudent(data.id, {
        ...data,
        registrationNumber: data.regNo,
        program: data.course,
        faculty: selectedStudent?.faculty || 'General'
      });
      await loadStudents();
    } catch (error) {
      toast.error('Update Failed', { description: error?.response?.data?.message || 'Failed to update student.' });
      throw error;
    }
  };

  const handleAdd = async (data) => {
    try {
      await createAcademicStudent({
        ...data,
        registrationNumber: data.regNo,
        program: data.course,
        faculty: 'General',
        totalFee: 120000
      });
      await loadStudents();
    } catch (error) {
      toast.error('Create Failed', { description: error?.response?.data?.message || 'Failed to create student.' });
      throw error;
    }
  };

  const studentColumns = [
  { key: 'regNo', label: 'Reg No', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'course', label: 'Course' },
  { key: 'year', label: 'Year', sortable: true },
  { key: 'campus', label: 'Campus' },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground">Manage all enrolled students</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV({ data: students, filename: 'students-list' })}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Student</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
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
                <p className="text-xl sm:text-2xl font-bold">{students.filter((s) => s.status === 'Active').length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{students.filter((s) => s.status === 'Probation').length}</p>
                <p className="text-xs text-muted-foreground">On Probation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{new Set(students.map((student) => student.campus)).size}</p>
                <p className="text-xs text-muted-foreground">Campuses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Students</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ?
          <div className="py-8 text-sm text-muted-foreground">Loading students...</div> :
          <DataTable
            columns={studentColumns}
            data={students}
            searchPlaceholder="Search students..."
            pageSize={10}
            exportable />
          }
        </CardContent>
      </Card>

      <ViewStudentModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        student={selectedStudent} />
      <EditStudentModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        student={selectedStudent}
        onSave={handleSave}
        courses={courseOptions}
        campuses={campusOptions} />
      <AddStudentModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd}
        courses={courseOptions}
        campuses={campusOptions} />
      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteItem?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete} />
    </div>);
}
