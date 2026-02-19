import { useState } from 'react';
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
const initialStudents = [
{ id: 1, regNo: 'CS/2023/001', name: 'Faith Achieng', email: 'f.achieng@cms.edu', course: 'BSc Computer Science', year: 3, campus: 'Main', status: 'Active' },
{ id: 2, regNo: 'CS/2023/012', name: 'Peter Kamau', email: 'p.kamau@cms.edu', course: 'BSc Computer Science', year: 3, campus: 'Main', status: 'Active' },
{ id: 3, regNo: 'ENG/2023/045', name: 'Grace Wanjiku', email: 'g.wanjiku@cms.edu', course: 'BEng Electrical', year: 2, campus: 'Mombasa', status: 'Active' },
{ id: 4, regNo: 'BUS/2024/089', name: 'John Mwangi', email: 'j.mwangi@cms.edu', course: 'BCom Accounting', year: 1, campus: 'Main', status: 'Active' },
{ id: 5, regNo: 'MED/2022/012', name: 'Susan Njeri', email: 's.njeri@cms.edu', course: 'MBBS Medicine', year: 4, campus: 'Main', status: 'Active' },
{ id: 6, regNo: 'CS/2022/067', name: 'James Ochieng', email: 'j.ochieng@cms.edu', course: 'BSc Computer Science', year: 4, campus: 'Kisumu', status: 'Active' },
{ id: 7, regNo: 'ENG/2024/023', name: 'Mary Wambui', email: 'm.wambui@cms.edu', course: 'BEng Civil', year: 1, campus: 'Main', status: 'Active' },
{ id: 8, regNo: 'BUS/2023/056', name: 'David Mwangi', email: 'd.mwangi@cms.edu', course: 'BCom Marketing', year: 2, campus: 'Nakuru', status: 'Probation' }];
export default function StudentsPage() {
  const [students, setStudents] = useState(initialStudents);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
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
  const confirmDelete = () => {
    if (deleteItem) {
      setStudents(students.filter((s) => s.id !== deleteItem.id));
      toast.success('Student Deleted', { description: `${deleteItem.name} has been removed.` });
    }
  };
  const handleSave = (data) => {
    setStudents(students.map((s) => s.id === data.id ? data : s));
  };
  const handleAdd = (data) => {
    const newStudent = { ...data, id: Math.max(...students.map((s) => s.id)) + 1 };
    setStudents([...students, newStudent]);
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground">Manage all enrolled students</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Exporting', { description: 'Exporting student list...' })}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Student</span>
          </Button>
        </div>
      </div>
      {/* Stats */}
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
                <p className="text-xl sm:text-2xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Campuses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Students</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <DataTable
            columns={studentColumns}
            data={students}
            searchPlaceholder="Search students..."
            pageSize={10}
            exportable />
        </CardContent>
      </Card>
      {/* Modals */}
      <ViewStudentModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        student={selectedStudent} />
      <EditStudentModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        student={selectedStudent}
        onSave={handleSave} />
      <AddStudentModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd} />
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