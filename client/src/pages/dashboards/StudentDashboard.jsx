import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { AreaChartCard, BarChartCard } from '@/components/dashboard/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '@/lib/export-utils';
import { printTranscript, printFeeStatement } from '@/lib/print-utils';
import { useEffect, useState } from 'react';
import { ViewCourseModal } from '@/components/modals';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentDashboard } from '@/services/studentDashboardService';
import {
  Wallet,
  BookOpen,
  GraduationCap,
  Calendar,
  Download,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  Bell,
  Smartphone,
  MapPin,
  Eye
} from
  'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const { notifications, loadingNotifications, notificationsError } = useNotifications();

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        if (!ignore) {
          setDashboardLoading(true);
          setDashboardError('');
        }

        const data = await getStudentDashboard();

        if (!ignore) {
          setDashboardData(data);
        }
      } catch (error) {
        if (!ignore) {
          setDashboardData(null);
          setDashboardError(error?.response?.data?.message || 'Failed to load student dashboard.');
        }
      } finally {
        if (!ignore) {
          setDashboardLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const studentProfile = dashboardData?.profile;
  const summary = dashboardData?.summary ?? {
    feeBalance: 0,
    totalFees: 0,
    paidAmount: 0,
    feePercentage: 0,
    registeredUnitsCount: 0,
    currentCgpa: null,
    totalCredits: null,
    upcomingExamsCount: 0,
  };
  const livePaymentHistory = Array.isArray(dashboardData?.paymentHistory) ? dashboardData.paymentHistory : [];
  const liveDeadlines = Array.isArray(dashboardData?.deadlines) ? dashboardData.deadlines : [];
  const liveExamSchedule = Array.isArray(dashboardData?.examSchedule) ? dashboardData.examSchedule : [];
  const liveRegisteredUnits = Array.isArray(dashboardData?.registeredUnits) ? dashboardData.registeredUnits : [];
  const liveGpaProgress = Array.isArray(dashboardData?.gpaProgress) ? dashboardData.gpaProgress : [];
  const liveSemesterPerformance = Array.isArray(dashboardData?.semesterPerformance) ? dashboardData.semesterPerformance : [];
  const liveRecentResults = Array.isArray(dashboardData?.recentResults) ? dashboardData.recentResults : [];
  const liveDocuments = Array.isArray(dashboardData?.documents) ? dashboardData.documents : [];

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setIsViewOpen(true);
  };

  const unitColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Unit Name' },
    { key: 'lecturer', label: 'Lecturer' },
    { key: 'credits', label: 'Credits' },
    { key: 'day', label: 'Day' },
    { key: 'time', label: 'Time' },
    { key: 'room', label: 'Room' },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleViewCourse(row)}>
          <Eye className="h-4 w-4" />
        </Button>
    }];

  const resultsColumns = [
    { key: 'unit', label: 'Code' },
    { key: 'name', label: 'Unit Name' },
    { key: 'cat', label: 'CAT (30)', sortable: true },
    { key: 'exam', label: 'Exam (70)', sortable: true },
    { key: 'total', label: 'Total', sortable: true },
    {
      key: 'grade',
      label: 'Grade',
      render: (value) =>
        <Badge variant={value.startsWith('A') ? 'default' : 'secondary'} className="font-mono">
          {value}
        </Badge>
    },
    { key: 'points', label: 'Points' }];

  const paymentColumns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `KES ${value.toLocaleString()}`
    },
    { key: 'method', label: 'Method' },
    { key: 'reference', label: 'Reference' },
    {
      key: 'status',
      label: 'Status',
      render: (value) =>
        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          {value}
        </Badge>
    }];

  const examColumns = [
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'unit', label: 'Unit' },
    { key: 'venue', label: 'Venue' },
    { key: 'seat', label: 'Seat No.' }];
  const feeBalance = summary.feeBalance;
  const totalFees = summary.totalFees;
  const feePercentage = summary.feePercentage;
  const currentCGPA = summary.currentCgpa;
  const totalCredits = summary.totalCredits;
  const handleDownloadTranscript = () => {
    const transcriptData = {
      studentName: studentProfile?.name || user?.name || 'Student',
      studentId: studentProfile?.registrationNumber || 'N/A',
      program: studentProfile?.program || studentProfile?.course || 'N/A',
      faculty: studentProfile?.faculty || 'N/A',
      dateOfAdmission: 'September 2021',
      status: 'In Progress',
      semesters: liveGpaProgress.map((s) => ({
        name: s.semester,
        courses: liveRecentResults
          .filter((r) => r.semester === s.semester)
          .map((r) => ({
          code: r.unit,
          name: r.name,
          credits: r.credits || 0,
          grade: r.grade,
          points: r.points
        })),
        gpa: s.gpa
      })),
      cgpa: currentCGPA || 0,
      totalCredits: totalCredits || 0
    };
    printTranscript(transcriptData);
  };
  const handlePrintFeeStatement = () => {
    printFeeStatement({
      studentName: studentProfile?.name || user?.name || 'Student',
      studentId: studentProfile?.registrationNumber || 'N/A',
      program: studentProfile?.program || studentProfile?.course || 'N/A',
      academicYear: '2023/2024',
      feeItems: [
        { item: 'Total Fees', amount: totalFees, paid: summary.paidAmount },
      ],
      payments: livePaymentHistory.map((p) => ({
        date: p.date,
        reference: p.reference,
        method: p.method,
        amount: p.amount
      }))
    });
  };
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">My Dashboard</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            Welcome back, <span className="font-semibold text-foreground">{studentProfile?.name || user?.name || 'Student'}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            {studentProfile?.registrationNumber || 'Profile syncing'}
            <span className="w-1 h-1 rounded-full bg-border" />
            {studentProfile?.year ? `Year ${studentProfile.year}` : 'Student'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="rounded-xl border-border/40 hover:bg-muted/50" onClick={handleDownloadTranscript}>
            <Download className="h-4 w-4 mr-2" />
            Download Transcript
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/results')}>
            <FileText className="h-4 w-4 mr-2" />
            View Results
          </Button>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid-cards">
        <StatsCard
          title="Fee Balance"
          value={`KES ${feeBalance.toLocaleString()}`}
          change={feeBalance > 0 ? 'Outstanding balance from backend records' : 'Fully cleared'}
          changeType={feeBalance > 0 ? 'negative' : 'positive'}
          icon={Wallet} />
        <StatsCard
          title="Registered Units"
          value={summary.registeredUnitsCount}
          change={summary.registeredUnitsCount > 0 ? 'Live academic registrations returned' : 'No registered units in backend records'}
          changeType="neutral"
          icon={BookOpen} />
        <StatsCard
          title="Current CGPA"
          value={typeof currentCGPA === 'number' ? currentCGPA.toFixed(2) : 'N/A'}
          change="Computed from backend academic records"
          changeType="positive"
          icon={GraduationCap} />
        <StatsCard
          title="Upcoming Exams"
          value={summary.upcomingExamsCount}
          change={summary.upcomingExamsCount > 0 ? 'From scheduled backend events' : 'No upcoming exam events'}
          changeType="neutral"
          icon={Calendar} />
      </div>
      {dashboardLoading && (
        <Card className="border-dashed">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Loading live student dashboard data...
          </CardContent>
        </Card>
      )}
      {dashboardError && (
        <Card className="border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            {dashboardError}
          </CardContent>
        </Card>
      )}
      {/* Fee Progress */}
      <Card className="glass-premium overflow-hidden">
        <CardHeader className="pb-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold tracking-tight">Fee Payment Progress - Semester 2 2023/24</CardTitle>
            <Button size="sm" variant="default" className="rounded-xl" onClick={() => navigate('/fees')}>
              <Smartphone className="h-4 w-4 mr-2" />
              Pay via M-Pesa
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">KES {summary.paidAmount.toLocaleString()} paid</span>
              <span className="text-muted-foreground">Goal: KES {totalFees.toLocaleString()}</span>
            </div>
            <Progress value={feePercentage} className="h-3 shadow-premium" />
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-primary">{feePercentage.toFixed(0)}% completed</span>
              <span className="text-destructive uppercase tracking-wider">Balance Due: KES {feeBalance.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Academic Summary Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-hover border-none bg-linear-to-br from-green-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-green-600/70">Current CGPA</p>
                <p className="text-3xl font-black text-green-600">{typeof currentCGPA === 'number' ? currentCGPA.toFixed(2) : 'N/A'}</p>
                <p className="text-xs font-medium text-green-600/60 mt-2">Live academic CGPA from backend records</p>
              </div>
              <div className="p-4 rounded-2xl bg-white shadow-xl shadow-green-500/10">
                <GraduationCap className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover border-none bg-linear-to-br from-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Total Credits</p>
                <p className="text-3xl font-black text-primary">{typeof totalCredits === 'number' ? totalCredits : 'N/A'}</p>
                <p className="text-xs font-medium text-primary/60 mt-2">Live credit totals from backend records</p>
              </div>
              <div className="p-4 rounded-2xl bg-white shadow-xl shadow-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
            </div>
            <Progress value={typeof totalCredits === 'number' ? totalCredits / 144 * 100 : 0} className="h-1.5 mt-4 bg-primary/10" />
          </CardContent>
        </Card>
        <Card className="card-hover border-none bg-linear-to-br from-yellow-500/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-600/70">Semester Status</p>
                <p className="text-3xl font-black text-yellow-600">{studentProfile?.year ? `0${studentProfile.year}`.slice(-2) : 'N/A'}</p>
                <p className="text-xs font-medium text-yellow-600/60 mt-2">{studentProfile?.program || 'Program information from backend profile'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white shadow-xl shadow-yellow-500/10">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
            <Progress value={75} className="h-1.5 mt-4 bg-yellow-500/10" />
          </CardContent>
        </Card>
      </div>
      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Registered Units */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Registered Units</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Live academic registrations from the backend</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-bold">
                  {liveRegisteredUnits.length} UNITS • {liveRegisteredUnits.reduce((sum, unit) => sum + Number(unit.credits || 0), 0)} CREDITS
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={unitColumns}
                data={liveRegisteredUnits}
                searchable={false}
                pageSize={6} />
            </CardContent>
          </Card>
        </div>
        {/* Sidebar - Deadlines & Notifications */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Next Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveDeadlines.map((item) =>
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-md ${item.urgent ? 'bg-destructive/5 border border-destructive/10' : 'bg-muted/30 border border-transparent'}`
                  }>
                  <div className={`p-2 rounded-lg ${item.urgent ? 'bg-destructive/10' : 'bg-white shadow-sm'}`}>
                    {item.type === 'finance' && <Wallet className="h-4 w-4 text-destructive" />}
                    {item.type === 'academic' && <FileText className="h-4 w-4 text-primary" />}
                    {item.type === 'exam' && <Calendar className="h-4 w-4 text-yellow-500" />}
                    {item.type === 'deadline' && <Clock className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-medium">{item.date}</p>
                  </div>
                  {item.urgent &&
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-bold uppercase tracking-tighter">Urgent</Badge>
                  }
                </div>
              )}
              {!dashboardLoading && liveDeadlines.length === 0 && (
                <div className="text-sm text-muted-foreground">No upcoming deadlines available from the backend.</div>
              )}
            </CardContent>
          </Card>
          {/* Notifications */}
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/5 px-2 h-7" onClick={() => navigate('/profile')}>View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingNotifications && (
                <div className="text-sm text-muted-foreground">Loading notifications...</div>
              )}
              {notificationsError && (
                <div className="text-sm text-destructive">{notificationsError}</div>
              )}
              {notifications.slice(0, 3).map((notification) =>
                <div key={notification.id} className="flex items-start gap-4 group cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 animate-pulse ${notification.type === 'warning' ? 'bg-yellow-500' :
                    notification.type === 'success' ? 'bg-green-500' :
                      'bg-primary'}`
                  } />
                  <div className="flex-1 border-b border-border/40 pb-3 group-last:border-0 group-last:pb-0">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notification.description}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 mt-1.5 uppercase tracking-wide">{notification.time}</p>
                  </div>
                </div>
              )}
              {!loadingNotifications && !notificationsError && notifications.length === 0 && (
                <div className="text-sm text-muted-foreground">No notifications available from the backend.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <AreaChartCard
          title="GPA Progress Over Semesters"
          data={liveGpaProgress}
          dataKey="gpa"
          xAxisKey="semester" />
        <BarChartCard
          title="Current Semester Performance"
          data={liveSemesterPerformance}
          dataKeys={['score']}
          xAxisKey="unit" />
      </div>
      {/* Tabbed Content */}
      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Results History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="exams">Exam Timetable</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Latest Published Results</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    GPA: {liveGpaProgress.length > 0 ? liveGpaProgress[liveGpaProgress.length - 1].gpa.toFixed(2) : 'N/A'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => {
                    exportToCSV({ data: liveRecentResults, filename: 'semester-results' });
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={resultsColumns}
                data={liveRecentResults}
                searchable={false}
                pageSize={6} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Payment History</CardTitle>
                <Button variant="outline" size="sm" onClick={handlePrintFeeStatement}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={paymentColumns}
                data={livePaymentHistory}
                searchPlaceholder="Search payments..."
                pageSize={5}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exams">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Upcoming Exam Schedule</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Timetable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={examColumns}
                data={liveExamSchedule}
                searchable={false}
                pageSize={6} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Pending Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveDocuments.map((doc) =>
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.document}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {doc.location}
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    doc.status === 'Ready for Collection' ? 'default' :
                      doc.status === 'Processing' ? 'secondary' :
                        'destructive'
                  }>
                    {doc.status}
                  </Badge>
                </div>
              )}
              {!dashboardLoading && liveDocuments.length === 0 && (
                <div className="text-sm text-muted-foreground">No pending documents available from the backend.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Quick Actions */}
      <Card className="border-none shadow-premium bg-muted/30">
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/fees')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Pay Fees</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/my-courses')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Register Units</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/results')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">View Results</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={handleDownloadTranscript}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Transcript</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/timetable')}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Timetable</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={handlePrintFeeStatement}>
              <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Fee Statement</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <ViewCourseModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        course={selectedCourse}
      />
    </div>);
}
