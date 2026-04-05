import { useEffect, useMemo, useState } from 'react';
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
import {
  createAcademicCourse,
  deleteAcademicCourse,
  getAcademicCourses,
  updateAcademicCourse } from
'@/services/academicService';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isViewCourseOpen, setIsViewCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getAcademicCourses();
      setCourses(data.courses || []);
    } catch (error) {
      toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load courses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const totalStudents = useMemo(() => courses.reduce((sum, course) => sum + Number(course.students || 0), 0), [courses]);
  const totalCredits = useMemo(() => courses.reduce((sum, course) => sum + Number(course.credits || 0), 0), [courses]);

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
    if (!deleteCourse) return;
    try {
      await deleteAcademicCourse(deleteCourse.id);
      toast.success('Course Deleted', { description: `${deleteCourse.name} has been deleted successfully` });
      setIsDeleteCourseOpen(false);
      setDeleteCourse(null);
      await loadCourses();
    } catch (error) {
      toast.error('Delete Failed', { description: error?.response?.data?.message || 'Failed to delete course.' });
    }
  };

  const handleCreateCourse = async (data) => {
    try {
      await createAcademicCourse(data);
      await loadCourses();
    } catch (error) {
      toast.error('Create Failed', { description: error?.response?.data?.message || 'Failed to create course.' });
      throw error;
    }
  };

  const handleUpdateCourse = async (data) => {
    try {
      await updateAcademicCourse(data.id, data);
      await loadCourses();
    } catch (error) {
      toast.error('Update Failed', { description: error?.response?.data?.message || 'Failed to update course.' });
      throw error;
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
    render: (value) => <Badge variant={value === 'Active' ? 'default' : 'secondary'}>{value}</Badge>
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

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div><div><p className="text-xl sm:text-2xl font-bold">{courses.length}</p><p className="text-xs text-muted-foreground">Total Courses</p></div></div></CardContent></Card>
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-600" /></div><div><p className="text-xl sm:text-2xl font-bold">{totalStudents}</p><p className="text-xs text-muted-foreground">Total Enrollments</p></div></div></CardContent></Card>
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><Clock className="h-5 w-5 text-green-600" /></div><div><p className="text-xl sm:text-2xl font-bold">{totalCredits}</p><p className="text-xs text-muted-foreground">Total Credits</p></div></div></CardContent></Card>
        <Card className="transition-all hover:shadow-md"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><BookOpen className="h-5 w-5 text-yellow-600" /></div><div><p className="text-xl sm:text-2xl font-bold">{courses.filter((course) => course.status === 'Active').length}</p><p className="text-xs text-muted-foreground">Active This Semester</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-medium">All Courses</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? <div className="py-8 text-sm text-muted-foreground">Loading courses...</div> :
          <DataTable columns={courseColumns} data={courses} searchPlaceholder="Search courses..." pageSize={10} />}
        </CardContent>
      </Card>

      <AddCourseModal open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen} onSubmit={handleCreateCourse} />
      <EditCourseModal open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen} course={selectedCourse} onSubmit={handleUpdateCourse} />
      <ViewCourseModal open={isViewCourseOpen} onOpenChange={setIsViewCourseOpen} course={viewCourse} />
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
