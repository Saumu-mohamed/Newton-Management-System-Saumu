import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/export-utils';
import { BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ClipboardList,
  Download,
  Edit,
  Eye,
  FileText,
  GraduationCap,
  Send,
  Upload,
  Users
} from 'lucide-react';
import { getLecturerDashboard, queueLecturerStudentAlerts } from '@/services/lecturerDashboardService';

function EmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getLecturerDashboard();
      setDashboardData(data);
      setError('');
    } catch (fetchError) {
      console.error('Failed to load lecturer dashboard:', fetchError);
      setError(fetchError?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQueueAlerts = async () => {
    try {
      const result = await queueLecturerStudentAlerts();
      toast.success('Alerts Queued', {
        description: result.message
      });
      await fetchDashboard();
    } catch (actionError) {
      toast.error('Queue Failed', {
        description: actionError?.response?.data?.message || 'Failed to queue student alerts.'
      });
    }
  };

  const profile = dashboardData?.profile || {};
  const kpis = dashboardData?.kpis || {};
  const assignedUnits = dashboardData?.assignedUnits || [];
  const classPerformance = dashboardData?.classPerformance || [];
  const gradeDistribution = dashboardData?.gradeDistribution || [];
  const pendingGrades = dashboardData?.pendingGrades || [];
  const todaySchedule = dashboardData?.todaySchedule || [];
  const weekSchedule = dashboardData?.weekSchedule || [];
  const classList = dashboardData?.classList || [];
  const studentAlerts = dashboardData?.studentAlerts || [];
  const highlightedUnit = dashboardData?.highlightedUnit || 'Current Class';
  const highlightedUnitName = dashboardData?.highlightedUnitName || 'No assigned unit yet';

  const unitColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Unit Name', sortable: true },
    { key: 'students', label: 'Students', sortable: true },
    {
      key: 'catSubmitted',
      label: 'CAT Status',
      render: (value) =>
        <div className="flex items-center gap-1">
          {value ?
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 text-xs">Submitted</span>
            </> :
            <>
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600 text-xs">Pending</span>
            </>
          }
        </div>
    },
    {
      key: 'examSubmitted',
      label: 'Exam Status',
      render: (value) =>
        <div className="flex items-center gap-1">
          {value ?
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 text-xs">Submitted</span>
            </> :
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Pending</span>
            </>
          }
        </div>
    },
    { key: 'deadline', label: 'Deadline' },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/my-classes')}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant={row.catSubmitted ? 'outline' : 'default'} className="h-7" onClick={() => navigate('/grades')}>
            {row.catSubmitted ? 'View Grades' : 'Enter Grades'}
          </Button>
        </div>
    }
  ];

  const classListColumns = [
    { key: 'regNo', label: 'Reg No' },
    { key: 'name', label: 'Student Name', sortable: true },
    {
      key: 'cat1',
      label: 'CAT 1',
      sortable: true,
      render: (value) => value !== null ? value : <span className="text-muted-foreground">-</span>
    },
    {
      key: 'cat2',
      label: 'CAT 2',
      sortable: true,
      render: (value) => value !== null ? value : <span className="text-muted-foreground">-</span>
    },
    {
      key: 'attendance',
      label: 'Attendance %',
      sortable: true,
      render: (value) =>
        <span className={value < 75 ? 'text-destructive font-medium' : ''}>
          {value}%
        </span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) =>
        <Badge variant={
          value === 'Regular' ? 'secondary' :
            value === 'At Risk' ? 'default' :
              'destructive'
        }>
          {value}
        </Badge>
    },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/grades')}>
          <Edit className="h-3 w-3" />
        </Button>
    }
  ];

  const alertColumns = [
    { key: 'student', label: 'Student', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    { key: 'unit', label: 'Unit' },
    { key: 'issue', label: 'Issue' },
    {
      key: 'action',
      label: 'Action Required',
      render: (value) =>
        <Badge variant={
          value === 'Contact Required' ? 'destructive' :
            value === 'Warning Issued' ? 'default' :
              'secondary'
        }>
          {value}
        </Badge>
    }
  ];

  const handleDownloadClassLists = () => {
    exportToCSV({ data: classList, filename: 'class-lists' });
  };

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">Lecturer Dashboard</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            Welcome back, <span className="font-semibold text-foreground">{profile.name || 'Lecturer'}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            {profile.department || 'Academic Department'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="rounded-xl border-border/40 hover:bg-muted/50" onClick={handleDownloadClassLists}>
            <Download className="h-4 w-4 mr-2" />
            Class Lists
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/grades')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Grades
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="border-none shadow-premium">
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading lecturer dashboard...
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
          title="Assigned Units"
          value={(kpis.assignedUnits || 0).toString()}
          change="Current teaching load"
          changeType="neutral"
          icon={BookOpen} />
        <StatsCard
          title="Total Students"
          value={(kpis.totalStudents || 0).toString()}
          change="Across all units"
          changeType="neutral"
          icon={Users} />
        <StatsCard
          title="Pending Grades"
          value={(kpis.pendingGrades || 0).toString()}
          change="Awaiting submission"
          changeType="negative"
          icon={ClipboardList} />
        <StatsCard
          title="Classes Today"
          value={(kpis.todayClasses || 0).toString()}
          change="Live schedule data"
          changeType="neutral"
          icon={Calendar} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">My Academic Units</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Backend-driven teaching assignments</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-bold">{assignedUnits.length} ACTIVE UNITS</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={unitColumns}
                data={assignedUnits}
                searchable={false}
                pageSize={5} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Today's Schedule
              </CardTitle>
              <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5 text-primary">{todaySchedule.length} SESSIONS</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedule.length > 0 ? todaySchedule.map((item, index) =>
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${index === 0 ? 'bg-white border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5' : 'bg-white/50 border-transparent hover:border-border/40'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold tracking-tight">{item.unit}</span>
                  <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest">{item.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/80">
                  <div className="flex items-center gap-1.5">
                    <Clock className={`h-3.5 w-3.5 ${index === 0 ? 'text-primary' : ''}`} />
                    {item.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className={`h-3.5 w-3.5 ${index === 0 ? 'text-primary' : ''}`} />
                    {item.room}
                  </div>
                </div>
              </div>
            ) : <EmptyState message="No teaching sessions were found for today's schedule." />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classPerformance.length > 0 ? (
          <BarChartCard
            title="Class Performance (Average %)"
            data={classPerformance}
            dataKeys={['average']}
            xAxisKey="unit" />
        ) : (
          <Card className="border-border/40 bg-card/50"><CardContent className="pt-6"><EmptyState message="No graded class performance data is available yet." /></CardContent></Card>
        )}
        {gradeDistribution.length > 0 ? (
          <PieChartCard title="Grade Distribution (All Units)" data={gradeDistribution} />
        ) : (
          <Card className="border-border/40 bg-card/50"><CardContent className="pt-6"><EmptyState message="No published grades were returned by the backend yet." /></CardContent></Card>
        )}
        <Card className="border-none shadow-premium bg-linear-to-br from-card to-muted/10">
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary animate-pulse" />
                Pending Entries
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingGrades.length > 0 ? pendingGrades.map((grade) =>
              <div
                key={grade.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${grade.urgency === 'High' ? 'bg-destructive/5 border-destructive/10' :
                  grade.urgency === 'Medium' ? 'bg-yellow-500/5 border-yellow-500/10' :
                    'bg-white/50 border-transparent hover:border-border/40'}`}>
                <div className="flex flex-col">
                  <p className="text-sm font-bold tracking-tight">{grade.unit}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">{grade.type} • {grade.students} STUDENTS</p>
                </div>
                <Badge variant={
                  grade.urgency === 'High' ? 'destructive' :
                    grade.urgency === 'Medium' ? 'default' :
                      'secondary'
                } className="text-[10px] font-black h-6 px-2">
                  DUE: {grade.due}
                </Badge>
              </div>
            ) : <EmptyState message="No pending grade entries were found in the backend." />}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classlist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classlist">Class List</TabsTrigger>
          <TabsTrigger value="alerts">Student Alerts</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="classlist">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">{highlightedUnit} - {highlightedUnitName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Current class list and assessment snapshot</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl h-9 font-bold text-xs" onClick={() => exportToCSV({ data: classList, filename: 'class-list' })}>
                    <Download className="h-4 w-4 mr-2" />
                    EXPORT
                  </Button>
                  <Button className="rounded-xl h-9 font-bold text-xs shadow-lg shadow-primary/20" onClick={() => navigate('/grades')}>
                    <Upload className="h-4 w-4 mr-2" />
                    UPLOAD MARKS
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={classListColumns}
                data={classList}
                searchPlaceholder="Search students..."
                pageSize={6}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Performance Alerts
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Students requiring immediate attention or follow-up</p>
                </div>
                <Badge variant="destructive" className="px-3 py-1 font-bold">{studentAlerts.length} ACTIVE ALERTS</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={alertColumns}
                data={studentAlerts}
                searchPlaceholder="Search alerts..."
                pageSize={5} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Teaching Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekSchedule.length > 0 ? (
                <div className="space-y-4">
                  {weekSchedule.map((day) =>
                    <div key={day.day} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-transparent hover:border-border/40 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-6">
                        <div className="w-28">
                          <p className="font-bold text-sm tracking-tight">{day.day}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3" />
                            {day.classes} CLASSES
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {day.hours} HOURS
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={day.hours / 8 * 100} className="w-32 h-2.5 shadow-inner" />
                        <span className="text-[10px] font-black text-primary w-8">{(day.hours / 8 * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState message="No weekly teaching schedule was found in the backend." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-premium bg-muted/20">
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg font-bold">Grading Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {classPerformance.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {classPerformance.map((unit) =>
                <div key={unit.unit} className="p-5 rounded-2xl bg-white border border-border/40 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-bold tracking-tight text-primary">{unit.unit}</span>
                    <Badge variant="secondary" className="text-[10px] font-black">{unit.submitted} STUDENTS</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-green-500/5 border border-green-500/10">
                      <p className="text-sm font-black text-green-600 tracking-tighter">{unit.highest}</p>
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">High</p>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-sm font-black text-primary tracking-tighter">{unit.average}</p>
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Avg</p>
                    </div>
                    <div className="p-2 rounded-xl bg-destructive/5 border border-destructive/10">
                      <p className="text-sm font-black text-destructive tracking-tighter">{unit.lowest}</p>
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Low</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="No grading performance records are available from the backend yet." />
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-premium bg-muted/30">
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/grades')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Upload Grades</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={handleDownloadClassLists}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Class Lists</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => exportToCSV({ data: classPerformance, filename: 'performance-report' })}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Performance</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/schedule')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Schedule</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={handleQueueAlerts}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Email Students</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/my-classes')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">My Classes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
