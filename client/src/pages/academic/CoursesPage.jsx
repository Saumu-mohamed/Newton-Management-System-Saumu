import { useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BookOpen,
  Plus,
  Eye,
  Edit,
  Users,
  Clock,
  Trash2 } from
'lucide-react';
import { AddCourseModal, EditCourseModal, ViewCourseModal, ConfirmModal } from '@/components/modals';
const courses = [
{ id: 1, code: 'CS 301', name: 'Database Systems', department: 'Computer Science', credits: 3, students: 85, lecturer: 'Dr. J. Kiprop', semester: 'Sem 2', status: 'Active' },
{ id: 2, code: 'CS 305', name: 'Software Engineering', department: 'Computer Science', credits: 3, students: 72, lecturer: 'Prof. M. Ochieng', semester: 'Sem 2', status: 'Active' },
{ id: 3, code: 'CS 310', name: 'Computer Networks', department: 'Computer Science', credits: 3, students: 68, lecturer: 'Dr. P. Wanjiku', semester: 'Sem 2', status: 'Active' },
{ id: 4, code: 'ENG 201', name: 'Electrical Circuits', department: 'Electrical Eng.', credits: 4, students: 92, lecturer: 'Prof. S. Wanjiku', semester: 'Sem 2', status: 'Active' },
{ id: 5, code: 'BUS 101', name: 'Intro to Accounting', department: 'Business', credits: 3, students: 120, lecturer: 'Dr. G. Muthoni', semester: 'Sem 2', status: 'Active' },
{ id: 6, code: 'MED 401', name: 'Clinical Medicine I', department: 'Medicine', credits: 6, students: 45, lecturer: 'Prof. M. Njeri', semester: 'Sem 2', status: 'Active' },
{ id: 7, code: 'MA 201', name: 'Statistics', department: 'Mathematics', credits: 3, students: 180, lecturer: 'Prof. D. Mwangi', semester: 'Sem 2', status: 'Active' },
{ id: 8, code: 'GS 300', name: 'Communication Skills', department: 'General Studies', credits: 2, students: 250, lecturer: 'Ms. A. Njeri', semester: 'Sem 2', status: 'Active' }];
export default function CoursesPage() {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isViewCourseOpen, setIsViewCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditCourseOpen(true);
  };
  const handleViewCourse = (course) => {
    setViewCourse(course);
    setIsViewCourseOpen(true);
  };
  const handleDeleteCourse = (course) => {
    setDeleteCourse(course);
    setIsDeleteCourseOpen(true);
  };
  const confirmDeleteCourse = async () => {
    if (deleteCourse) {
      toast.success('Course Deleted', { description: `${deleteCourse.name} has been deleted successfully` });
    }
  };
  const courseColumns = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Course Name', sortable: true },
  { key: 'department', label: 'Department' },
  { key: 'credits', label: 'Credits', sortable: true },
  { key: 'students', label: 'Students', sortable: true },
  { key: 'lecturer', label: 'Lecturer' },
  { key: 'semester', label: 'Semester' },
  {
    key: 'status',
    label: 'Status',
    render: (value) =>
    <Badge variant={value === 'Active' ? 'default' : 'secondary'}>{value}</Badge>
  },
  {
    key: 'actions',
    label: '',
    render: (_, row) =>
    <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewCourse(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditCourse(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteCourse(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
  }];
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">Manage all academic courses and units</p>
        </div>
        <Button size="sm" onClick={() => setIsAddCourseOpen(true)}>
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Course</span>
        </Button>
      </div>
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
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
                <p className="text-xl sm:text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalCredits}</p>
                <p className="text-xs text-muted-foreground">Total Credits</p>
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
                <p className="text-xl sm:text-2xl font-bold">{courses.filter((c) => c.status === 'Active').length}</p>
                <p className="text-xs text-muted-foreground">Active This Semester</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Courses</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <DataTable
            columns={courseColumns}
            data={courses}
            searchPlaceholder="Search courses..."
            pageSize={10} />
        </CardContent>
      </Card>
      {/* Add Course Modal */}
      <AddCourseModal
        open={isAddCourseOpen}
        onOpenChange={setIsAddCourseOpen} />
      {/* Edit Course Modal */}
      <EditCourseModal
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        course={selectedCourse} />
      {/* View Course Modal */}
      <ViewCourseModal
        open={isViewCourseOpen}
        onOpenChange={setIsViewCourseOpen}
        course={viewCourse} />
      {/* Delete Course Confirmation */}
      <ConfirmModal
        open={isDeleteCourseOpen}
        onOpenChange={setIsDeleteCourseOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteCourse?.name}" (${deleteCourse?.code})? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteCourse} />
    </div>);
}