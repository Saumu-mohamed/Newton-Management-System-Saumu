import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/export-utils';
import { AreaChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Send,
  Users
} from 'lucide-react';
import {
  approveRegistratorOverride,
  generateRegistratorGraduationList,
  getRegistratorDashboard,
  reviewRegistratorStudentRegistration
} from '@/services/registratorDashboardService';

function EmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getRegistratorDashboard();
      setDashboardData(data);
      setError('');
    } catch (fetchError) {
      console.error('Failed to load registrator dashboard:', fetchError);
      setError(fetchError?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleReviewRegistration = async (row) => {
    try {
      const result = await reviewRegistratorStudentRegistration(row.id);
      toast.success('Registration Reviewed', {
        description: result.message
      });
      await fetchDashboard();
    } catch (actionError) {
      toast.error('Review Failed', {
        description: actionError?.response?.data?.message || 'Failed to review registration.'
      });
    }
  };

  const handleOverrideViolation = async (row) => {
    try {
      const result = await approveRegistratorOverride(row.id);
      toast.success('Override Applied', {
        description: result.message
      });
      await fetchDashboard();
    } catch (actionError) {
      toast.error('Override Failed', {
        description: actionError?.response?.data?.message || 'Failed to apply override.'
      });
    }
  };

  const handleGenerateGraduationList = async () => {
    try {
      const result = await generateRegistratorGraduationList();
      toast.success('Graduation List Generated', {
        description: result.message
      });
      await fetchDashboard();
    } catch (actionError) {
      toast.error('Generation Failed', {
        description: actionError?.response?.data?.message || 'Failed to generate graduation list.'
      });
    }
  };

  const overview = dashboardData?.overview || {};
  const kpis = dashboardData?.kpis || {};
  const registrationTrend = dashboardData?.registrationTrend || [];
  const registrationStatus = dashboardData?.registrationStatus || [];
  const admissionsByIntake = dashboardData?.admissionsByIntake || [];
  const pendingRegistrations = dashboardData?.pendingRegistrations || [];
  const prerequisiteViolations = dashboardData?.prerequisiteViolations || [];
  const transcriptRequests = dashboardData?.transcriptRequests || [];
  const graduationEligible = dashboardData?.graduationEligible || [];
  const semesterCalendar = dashboardData?.semesterCalendar || [];
  const academicAlerts = dashboardData?.academicAlerts || [];

  const registrationColumns = [
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    { key: 'semester', label: 'Semester' },
    { key: 'units', label: 'Units', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) =>
        <div className="flex items-center gap-1">
          <StatusBadge status={value} />
          {row.daysLate > 0 &&
            <span className="text-xs text-destructive">({row.daysLate}d late)</span>
          }
        </div>
    },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/registrations')}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => handleReviewRegistration(row)}>
            Review
          </Button>
        </div>
    }
  ];

  const violationColumns = [
    { key: 'student', label: 'Student', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    { key: 'unit', label: 'Requested Unit' },
    { key: 'prerequisite', label: 'Missing Prerequisite' },
    {
      key: 'status',
      label: 'Status',
      render: (value) =>
        <Badge variant={value === 'Blocked' ? 'destructive' : 'default'}>
          {value}
        </Badge>
    },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <Button size="sm" variant="outline" className="h-7" onClick={() => handleOverrideViolation(row)}>
          Override
        </Button>
    }
  ];

  const transcriptColumns = [
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    { key: 'type', label: 'Type' },
    { key: 'purpose', label: 'Purpose' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'requestDate', label: 'Request Date', sortable: true },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <div className="flex gap-1">
          {row.status === 'Ready' ?
            <Button size="sm" variant="default" className="h-7" onClick={() => navigate('/transcripts')}>
              <Send className="h-3 w-3 mr-1" />
              Release
            </Button> :
            <Button size="sm" variant="outline" className="h-7" onClick={() => navigate('/transcripts')}>
              Process
            </Button>
          }
        </div>
    }
  ];

  const graduationColumns = [
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    { key: 'program', label: 'Program' },
    { key: 'credits', label: 'Credits', sortable: true },
    { key: 'cgpa', label: 'CGPA', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) =>
        <Badge variant={value === 'Eligible' ? 'default' : 'secondary'}>
          {value}
        </Badge>
    }
  ];

  const handleExportData = () => {
    exportToCSV({ data: pendingRegistrations, filename: 'registration-data' });
  };

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">{overview.title || 'Registrar Dashboard'}</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            {overview.subtitle || 'Academic Records & Enrollment Management'}
            <span className="w-1 h-1 rounded-full bg-border" />
            Live academic workflow
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="rounded-xl border-border/40 hover:bg-muted/50" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/calendar')}>
            <Calendar className="h-4 w-4 mr-2" />
            Academic Calendar
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="border-none shadow-premium">
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading registrator dashboard...
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
          title="Registered Students"
          value={(kpis.registeredStudents || 0).toLocaleString()}
          change={`${(kpis.completedPercentage || 0).toFixed(0)}% complete`}
          changeType="positive"
          icon={Users} />
        <StatsCard
          title="Pending Registrations"
          value={(kpis.pendingRegistrations || 0).toLocaleString()}
          change="Requires registrar review"
          changeType="negative"
          icon={Clock} />
        <StatsCard
          title="Transcript Requests"
          value={(kpis.transcriptRequests || 0).toLocaleString()}
          change="Live document workflow"
          changeType="neutral"
          icon={FileText} />
        <StatsCard
          title="Graduation Eligible"
          value={(kpis.graduationEligible || 0).toLocaleString()}
          change="Computed from academic records"
          changeType="positive"
          icon={GraduationCap} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Prerequisite Violations"
          value={(kpis.prerequisiteViolations || 0).toLocaleString()}
          change="Requires attention"
          changeType="negative"
          icon={AlertTriangle} />
        <StatsCard
          title="Academic Warnings"
          value={(prerequisiteViolations.filter((item) => item.status === 'Warning').length || 0).toLocaleString()}
          change="Derived from current registrations"
          changeType="negative"
          icon={AlertCircle} />
        <StatsCard
          title="Active Courses"
          value={(kpis.activeCourses || 0).toLocaleString()}
          change="In registration records"
          changeType="neutral"
          icon={BookOpen} />
        <StatsCard
          title="Days to Deadline"
          value={(kpis.daysToDeadline || 0).toLocaleString()}
          change="Current workflow countdown"
          changeType="neutral"
          icon={Calendar} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AreaChartCard
          title="Registration Velocity"
          data={registrationTrend}
          dataKey="registrations"
          xAxisKey="week" />
        <PieChartCard title="Status Distribution" data={registrationStatus} />
        <BarChartCard
          title="Intake Comparison"
          data={admissionsByIntake}
          dataKeys={['admitted', 'current']}
          xAxisKey="intake" />
      </div>

      <Tabs defaultValue="registrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registrations">Pending Registrations</TabsTrigger>
          <TabsTrigger value="violations">Prerequisite Violations</TabsTrigger>
          <TabsTrigger value="transcripts">Transcript Requests</TabsTrigger>
          <TabsTrigger value="graduation">Graduation Eligibility</TabsTrigger>
        </TabsList>
        <TabsContent value="registrations">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Pending Registrations</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Students awaiting unit verification</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-bold">{pendingRegistrations.length} PENDING VERIFICATION</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={registrationColumns}
                data={pendingRegistrations}
                searchPlaceholder="Search students..."
                pageSize={5}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="violations">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Prerequisite Violations
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Students blocked by missing unit requirements</p>
                </div>
                <Badge variant="destructive" className="px-3 py-1 font-bold">{prerequisiteViolations.length} ACTIVE BLOCKS</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={violationColumns}
                data={prerequisiteViolations}
                searchPlaceholder="Search violations..."
                pageSize={5} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transcripts">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Transcript Requests</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Academic records and certification pipeline</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-bold">
                    {transcriptRequests.filter((t) => t.status === 'Ready').length} READY
                  </Badge>
                  <Badge variant="secondary" className="font-bold">
                    {transcriptRequests.filter((t) => t.status === 'Processing').length} PROCESSING
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={transcriptColumns}
                data={transcriptRequests}
                searchPlaceholder="Search requests..."
                pageSize={5}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="graduation">
          <Card className="border-none shadow-premium bg-linear-to-br from-card to-primary/5">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Graduation Eligibility
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Computed from final-year academic records</p>
                </div>
                <Button className="rounded-xl h-9 font-bold text-xs shadow-lg shadow-primary/20" onClick={handleGenerateGraduationList}>
                  GENERATE FINAL LIST
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={graduationColumns}
                data={graduationEligible}
                searchPlaceholder="Search students..."
                pageSize={5}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Critical Academic Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {academicAlerts.length > 0 ? academicAlerts.map((alert) => (
              <div key={alert.title} className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.type === 'warning' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/10' :
                alert.type === 'success' ? 'bg-green-600/10 text-green-700 border-green-600/10' :
                  'bg-primary/10 text-primary border-primary/10'} transition-all hover:shadow-md`}>
                {alert.type === 'warning' ? <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" /> :
                  alert.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" /> :
                    <GraduationCap className="h-5 w-5 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">{alert.title}</p>
                  <p className="text-sm font-medium opacity-90 leading-tight mt-0.5">{alert.desc}</p>
                </div>
              </div>
            )) : <EmptyState message="No academic alerts are available from the backend." />}
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium">
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Registrar's Calendar
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5 h-7 px-2">
                EDIT TIMELINE
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {semesterCalendar.length > 0 ? semesterCalendar.map((item) =>
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-transparent hover:border-border/40 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-8 rounded-full ${item.status === 'Completed' ? 'bg-green-500' : 'bg-primary'}`} />
                  <div>
                    <p className="text-sm font-bold tracking-tight">{item.event}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{item.date}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'Completed' ? 'secondary' : 'outline'} className="text-[10px] font-black h-5">
                  {item.status.toUpperCase()}
                </Badge>
              </div>
            ) : <EmptyState message="No registrar calendar events were found in the backend." />}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-premium bg-muted/20">
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg font-bold">Student Success Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {admissionsByIntake.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {admissionsByIntake.slice(0, 4).map((intake) =>
                <div key={intake.intake} className="space-y-3 p-5 rounded-2xl bg-white border border-border/40 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black tracking-tighter text-primary uppercase">{intake.intake} INTAKE</span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {intake.current} ACTIVE • {intake.admitted} ADMITTED
                    </span>
                  </div>
                  <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-1000"
                      style={{ width: `${intake.admitted > 0 ? intake.current / intake.admitted * 100 : 0}%` }} />
                    {intake.graduated > 0 &&
                      <div
                        className="absolute top-0 right-0 h-full bg-green-500 transition-all duration-1000"
                        style={{ width: `${intake.admitted > 0 ? intake.graduated / intake.admitted * 100 : 0}%` }} />
                    }
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                    <span className="text-primary">RETENTION: {intake.admitted > 0 ? (intake.current / intake.admitted * 100).toFixed(0) : 0}%</span>
                    {intake.graduated > 0 && <span className="text-green-600">GRADUATION: {(intake.graduated / intake.admitted * 100).toFixed(0)}%</span>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="No intake comparison data is available from the backend yet." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
