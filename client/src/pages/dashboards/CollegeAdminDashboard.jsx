import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  UserCog,
  Users,
  Wallet
} from 'lucide-react';
import { AreaChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ConfirmModal } from '@/components/modals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  approveCollegeApproval,
  getCollegeAdminDashboard,
  notifyProbationStudent
} from '@/services/collegeAdminDashboardService';

function EmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function CollegeAdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getCollegeAdminDashboard();
        setDashboardData(data);
        setError('');
      } catch (fetchError) {
        console.error('Failed to load college admin dashboard:', fetchError);
        setError(fetchError?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const overview = dashboardData?.overview || {};
  const kpis = dashboardData?.kpis || {};
  const enrollmentByFaculty = dashboardData?.enrollmentByFaculty || [];
  const enrollmentByDepartment = dashboardData?.enrollmentByDepartment || [];
  const feeCollectionData = dashboardData?.feeCollectionData || [];
  const graduationRateData = dashboardData?.graduationRateData || [];
  const probationStudents = dashboardData?.probationStudents || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const pendingApprovalsData = dashboardData?.pendingApprovals || [];
  const lecturerWorkload = dashboardData?.lecturerWorkload || [];
  const feeClearanceSummary = dashboardData?.feeClearanceSummary || [];

  const totalStudents = kpis.totalStudents || 0;
  const totalTarget = kpis.totalTarget || 0;
  const enrollmentPercentage = kpis.enrollmentPercentage || 0;
  const activeCourses = kpis.activeCourses || 0;
  const graduationRate = kpis.graduationRate || 0;
  const probationCount = kpis.probationCount || 0;
  const activeCoursesChange = activeCourses > 0 ? `${activeCourses.toLocaleString()} active courses returned` : 'No course data returned';
  const graduationRateChange = graduationRateData.length > 0 ? `${graduationRateData.length} trend points returned` : 'No graduation trend data returned';
  const probationChange = probationCount > 0 ? `${probationCount.toLocaleString()} flagged students returned` : 'No warnings returned';

  const handleApproval = async (item) => {
    try {
      const response = await approveCollegeApproval(item.id);

      setDashboardData((current) => current ? {
        ...current,
        pendingApprovals: (current.pendingApprovals || []).filter((approval) => approval.id !== item.id)
      } : current);

      toast.success('Approved', {
        description: response?.message || `${item.type} from ${item.from} has been approved.`
      });
    } catch (approvalError) {
      toast.error('Approval Failed', {
        description: approvalError?.response?.data?.message || 'Failed to approve request.'
      });
    } finally {
      setIsConfirmOpen(false);
      setConfirmConfig(null);
    }
  };

  const handleReview = (item) => {
    setConfirmConfig({
      title: `Review ${item.type}`,
      description: `Reviewing ${item.type} from ${item.from}. Would you like to approve this request?`,
      confirmText: 'Approve',
      onConfirm: () => handleApproval(item)
    });
    setIsConfirmOpen(true);
  };

  const handleSendWarning = async (row) => {
    try {
      const response = await notifyProbationStudent(row.studentId);
      toast.success('Email Sent', {
        description: response?.message || `Warning email sent to ${row.name}`
      });
    } catch (notifyError) {
      toast.error('Email Failed', {
        description: notifyError?.response?.data?.message || 'Failed to send warning email.'
      });
    }
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
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleSendWarning(row)}>
            <Mail className="h-3 w-3" />
          </Button>
        </div>
    }
  ];

  const departmentColumns = [
    { key: 'department', label: 'Department', sortable: true },
    { key: 'faculty', label: 'Faculty' },
    { key: 'students', label: 'Students', sortable: true },
    { key: 'lecturers', label: 'Lecturers', sortable: true },
    {
      key: 'ratio',
      label: 'Student:Lecturer',
      render: (_, row) => row.lecturers > 0 ? `${Math.round(row.students / row.lecturers)}:1` : 'Unassigned'
    }
  ];

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
    }
  ];

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">College Admin Dashboard</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            {overview.campusName || 'College Admin'}
            <span className="w-1 h-1 rounded-full bg-border" />
            {overview.subtitle || 'Backend-connected dashboard overview'}
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

      {loading && (
        <Card className="border-none shadow-premium">
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading college admin dashboard...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="py-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid-cards">
        <StatsCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          change={totalTarget > 0 ? `${enrollmentPercentage.toFixed(0)}% of target` : 'No enrollment target returned'}
          changeType="positive"
          icon={Users} />
        <StatsCard
          title="Active Courses"
          value={activeCourses.toLocaleString()}
          change={activeCoursesChange}
          changeType="positive"
          icon={BookOpen} />
        <StatsCard
          title="Graduation Rate"
          value={`${graduationRate}%`}
          change={graduationRateChange}
          changeType="positive"
          icon={GraduationCap} />
        <StatsCard
          title="On Probation"
          value={probationCount.toLocaleString()}
          change={probationChange}
          changeType="negative"
          icon={AlertTriangle} />
      </div>

      <Card className="glass-premium overflow-hidden border-none shadow-premium">
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Enrollment Target Progress</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Academic Intake Status</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1 font-bold bg-primary/10 text-primary border-none">
              {enrollmentPercentage.toFixed(0)}% ACHIEVED
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          {enrollmentByFaculty.length > 0 ? (
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
                    value={faculty.target > 0 ? faculty.students / faculty.target * 100 : 0}
                    className="h-2.5 shadow-inner bg-muted" />
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-primary">
                      {faculty.target > 0 ? (faculty.students / faculty.target * 100).toFixed(0) : 0}% CAPACITY
                    </span>
                    <span className="text-muted-foreground tracking-widest uppercase">Target Meta</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="No faculty enrollment data available from the backend yet." />
          )}
        </CardContent>
      </Card>

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
              {pendingApprovalsData.length === 0 && (
                <EmptyState message="No pending approvals were returned by the backend." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-premium">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Fee Clearance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {feeClearanceSummary.length > 0 ? feeClearanceSummary.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-black ${item.color}`}>{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2 shadow-inner" />
              </div>
            )) : <EmptyState message="No fee clearance summary is available yet." />}
          </CardContent>
        </Card>

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
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) =>
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
            ) : <EmptyState message="No upcoming academic events were found in the backend." />}
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
