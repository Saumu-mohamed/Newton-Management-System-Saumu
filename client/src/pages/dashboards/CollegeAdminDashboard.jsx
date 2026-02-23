import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { AreaChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  Building2,
  Calendar,
  FileText,
  UserCog,
  BarChart3,
  Wallet,
  Eye,
  Mail
} from
  'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/modals';

// Mock data for college admin
const enrollmentByFaculty = [
  { faculty: 'Engineering', students: 1250, target: 1400 },
  { faculty: 'Business', students: 980, target: 1000 },
  { faculty: 'Arts & Humanities', students: 720, target: 800 },
  { faculty: 'Science', students: 890, target: 950 },
  { faculty: 'Health Sciences', students: 560, target: 600 }];
const enrollmentByDepartment = [
  { department: 'Computer Science', faculty: 'Engineering', students: 320, lecturers: 18 },
  { department: 'Electrical Eng.', faculty: 'Engineering', students: 280, lecturers: 15 },
  { department: 'Civil Engineering', faculty: 'Engineering', students: 245, lecturers: 14 },
  { department: 'Accounting', faculty: 'Business', students: 380, lecturers: 12 },
  { department: 'Marketing', faculty: 'Business', students: 290, lecturers: 10 },
  { department: 'Medicine', faculty: 'Health Sciences', students: 180, lecturers: 22 },
  { department: 'Nursing', faculty: 'Health Sciences', students: 220, lecturers: 16 }];
const feeCollectionData = [
  { name: 'Fully Paid', value: 62 },
  { name: 'Partial', value: 23 },
  { name: 'Overdue', value: 10 },
  { name: 'Pending', value: 5 }];
const graduationRateData = [
  { year: '2020', rate: 82 },
  { year: '2021', rate: 85 },
  { year: '2022', rate: 87 },
  { year: '2023', rate: 89 },
  { year: '2024', rate: 91 }];
const probationStudents = [
  { id: 1, name: 'Peter Kamau', regNo: 'CS/2023/001', department: 'Computer Science', gpa: 1.8, status: 'Probation', semester: 3 },
  { id: 2, name: 'Jane Wambui', regNo: 'BUS/2022/045', department: 'Business Admin', gpa: 1.9, status: 'Warning', semester: 5 },
  { id: 3, name: 'Kevin Ochieng', regNo: 'ENG/2023/089', department: 'Civil Engineering', gpa: 1.7, status: 'Probation', semester: 4 },
  { id: 4, name: 'Mary Akinyi', regNo: 'MED/2022/012', department: 'Medicine', gpa: 1.85, status: 'Warning', semester: 6 },
  { id: 5, name: 'David Mwangi', regNo: 'CS/2023/056', department: 'Computer Science', gpa: 1.65, status: 'Probation', semester: 2 }];
const upcomingEvents = [
  { id: 1, event: 'Mid-Semester Exams', date: 'Mar 15 - 22, 2024', type: 'exam', location: 'All Campuses' },
  { id: 2, event: 'CAT 2 Deadline', date: 'Mar 10, 2024', type: 'deadline', location: 'Academic Block' },
  { id: 3, event: 'Faculty Board Meeting', date: 'Mar 5, 2024', type: 'meeting', location: 'Admin Building' },
  { id: 4, event: 'Graduation Rehearsal', date: 'Apr 20, 2024', type: 'event', location: 'Main Grounds' },
  { id: 5, event: 'Open Day', date: 'Apr 25, 2024', type: 'event', location: 'Main Campus' }];
const pendingApprovalsData = [
  { id: 1, type: 'Leave Request', from: 'Dr. J. Ochieng', department: 'Computer Science', date: '2024-01-15', status: 'Pending' },
  { id: 2, type: 'Course Addition', from: 'HOD Engineering', department: 'Engineering', date: '2024-01-14', status: 'Urgent' },
  { id: 3, type: 'Budget Request', from: 'Dean Arts', department: 'Arts & Humanities', date: '2024-01-13', status: 'Pending' },
  { id: 4, type: 'Staff Promotion', from: 'HR Department', department: 'Admin', date: '2024-01-12', status: 'Review' }];
const lecturerWorkload = [
  { id: 1, name: 'Dr. James Kiprop', department: 'Computer Science', units: 4, students: 240, workload: 'High' },
  { id: 2, name: 'Prof. Mary Ochieng', department: 'Business', units: 3, students: 180, workload: 'Normal' },
  { id: 3, name: 'Dr. Peter Wanjiku', department: 'Engineering', units: 5, students: 320, workload: 'Overloaded' },
  { id: 4, name: 'Dr. Susan Njeri', department: 'Medicine', units: 3, students: 90, workload: 'Normal' }];

export default function CollegeAdminDashboard() {
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const handleReview = (item) => {
    setConfirmConfig({
      title: `Review ${item.type}`,
      description: `Reviewing ${item.type} from ${item.from}. Would you like to approve this request?`,
      confirmText: 'Approve',
      onConfirm: () => {
        toast.success('Approved', { description: `${item.type} from ${item.from} has been approved.` });
      }
    });
    setIsConfirmOpen(true);
  };

  const probationColumns = [
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    { key: 'department', label: 'Department' },
    { key: 'semester', label: 'Semester' },
    { key: 'gpa', label: 'GPA', sortable: true },
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
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/students')}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.success('Email Sent', { description: `Warning email sent to ${row.name}` })}>
            <Mail className="h-3 w-3" />
          </Button>
        </div>
    }];

  const departmentColumns = [
    { key: 'department', label: 'Department', sortable: true },
    { key: 'faculty', label: 'Faculty' },
    { key: 'students', label: 'Students', sortable: true },
    { key: 'lecturers', label: 'Lecturers', sortable: true },
    {
      key: 'ratio',
      label: 'Student:Lecturer',
      render: (_, row) => `${Math.round(row.students / row.lecturers)}:1`
    }];

  const lecturerColumns = [
    { key: 'name', label: 'Lecturer', sortable: true },
    { key: 'department', label: 'Department' },
    { key: 'units', label: 'Units', sortable: true },
    { key: 'students', label: 'Total Students', sortable: true },
    {
      key: 'workload',
      label: 'Workload',
      render: (value) =>
        <Badge variant={value === 'Overloaded' ? 'destructive' : value === 'High' ? 'default' : 'secondary'}>
          {value}
        </Badge>
    }];
  const totalStudents = enrollmentByFaculty.reduce((sum, f) => sum + f.students, 0);
  const totalTarget = enrollmentByFaculty.reduce((sum, f) => sum + f.target, 0);
  const enrollmentPercentage = totalStudents / totalTarget * 100;
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">College Admin Dashboard</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            Main Campus
            <span className="w-1 h-1 rounded-full bg-border" />
            Academic & Administrative Overview
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="rounded-xl border-border/40 hover:bg-muted/50" onClick={() => navigate('/reports')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Full Analytics
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/calendar')}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Board
          </Button>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid-cards">
        <StatsCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          change={`${enrollmentPercentage.toFixed(0)}% of target`}
          changeType="positive"
          icon={Users} />
        <StatsCard
          title="Active Courses"
          value="186"
          change="12 new this semester"
          changeType="positive"
          icon={BookOpen} />
        <StatsCard
          title="Graduation Rate"
          value="91%"
          change="+2% from last year"
          changeType="positive"
          icon={GraduationCap} />
        <StatsCard
          title="On Probation"
          value="47"
          change="Requires attention"
          changeType="negative"
          icon={AlertTriangle} />
      </div>
      {/* Enrollment Progress */}
      <Card className="glass-premium overflow-hidden border-none shadow-premium">
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Enrollment Target Progress</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Academic Intake Status 2024/2025</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1 font-bold bg-primary/10 text-primary border-none">{enrollmentPercentage.toFixed(0)}% ACHIEVED</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="grid gap-6 md:grid-cols-2">
            {enrollmentByFaculty.map((faculty) =>
              <div key={faculty.faculty} className="space-y-3 p-4 rounded-2xl bg-white/50 border border-border/20 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight">{faculty.faculty}</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase">
                    {faculty.students} / {faculty.target} STUDENTS
                  </span>
                </div>
                <Progress
                  value={faculty.students / faculty.target * 100}
                  className="h-2.5 shadow-inner bg-muted" />
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-primary">{(faculty.students / faculty.target * 100).toFixed(0)}% CAPACITY</span>
                  <span className="text-muted-foreground tracking-widest uppercase">Target Meta</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BarChartCard
          title="Enrollment by Faculty"
          data={enrollmentByFaculty}
          dataKeys={['students']}
          xAxisKey="faculty" />
        <PieChartCard title="Fee Collection Status (%)" data={feeCollectionData} />
        <AreaChartCard
          title="Graduation Rate Trend (%)"
          data={graduationRateData}
          dataKey="rate"
          xAxisKey="year" />
      </div>
      {/* Tabbed Content */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="probation">Academic Warnings</TabsTrigger>
          <TabsTrigger value="lecturers">Lecturer Workload</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Department Overview</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/departments')}>Manage Departments</Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={departmentColumns}
                data={enrollmentByDepartment}
                searchPlaceholder="Search departments..."
                pageSize={7}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="probation">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Students on Probation/Warning
                </CardTitle>
                <Badge variant="destructive">{probationStudents.length} students</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={probationColumns}
                data={probationStudents}
                searchPlaceholder="Search students..."
                pageSize={5}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lecturers">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Lecturer Workload Analysis</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/staff')}>View All Staff</Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={lecturerColumns}
                data={lecturerWorkload}
                searchPlaceholder="Search lecturers..."
                pageSize={5} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approvals">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingApprovalsData.map((item) =>
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'Urgent' ? 'bg-destructive' :
                      item.status === 'Review' ? 'bg-yellow-500' :
                        'bg-primary'}`
                    } />
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.from} • {item.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    <Button size="sm" variant="outline" className="h-7" onClick={() => handleReview(item)}>
                      Review
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fee Clearance Summary */}
        <Card className="border-none shadow-premium">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Fee Clearance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: 'Fully Cleared', value: 62, color: 'text-green-600', bg: 'bg-green-600' },
              { label: 'Partial Payment', value: 23, color: 'text-primary', bg: 'bg-primary' },
              { label: 'Overdue', value: 10, color: 'text-destructive', bg: 'bg-destructive' },
              { label: 'Pending', value: 5, color: 'text-muted-foreground', bg: 'bg-muted-foreground' }
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-black ${item.color}`}>{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2 shadow-inner" />
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Upcoming Events */}
        <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Administrative Calendar
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5 h-7 px-2" onClick={() => navigate('/calendar')}>
                VIEW ALL
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) =>
              <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-transparent hover:border-border/40 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-1.5 h-8 rounded-full ${event.type === 'exam' ?
                      'bg-destructive' :
                      event.type === 'deadline' ?
                        'bg-yellow-500' :
                        event.type === 'meeting' ?
                          'bg-primary' :
                          'bg-green-500'}`
                    } />
                  <div>
                    <span className="text-sm font-bold block">{event.event}</span>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{event.location}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-border/40 px-2 py-0 h-5">{event.date}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Quick Navigation */}
      <Card className="border-none shadow-premium bg-muted/30">
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg font-bold">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/students')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Students</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/staff')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Lecturers</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/courses')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Courses</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/departments')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Depts</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/reports')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Reports</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/calendar')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Board</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={confirmConfig?.title}
        description={confirmConfig?.description}
        confirmText={confirmConfig?.confirmText}
        onConfirm={confirmConfig?.onConfirm}
      />
    </div>);
}