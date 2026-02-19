import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { AreaChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '@/lib/export-utils';
import {
  Users,
  FileText,
  GraduationCap,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  BookOpen,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Send
} from
  'lucide-react';
// Mock data for registrar
const registrationTrend = [
  { week: 'Week 1', registrations: 450, target: 500 },
  { week: 'Week 2', registrations: 820, target: 800 },
  { week: 'Week 3', registrations: 1200, target: 1000 },
  { week: 'Week 4', registrations: 380, target: 400 },
  { week: 'Week 5', registrations: 120, target: 100 }];
const registrationStatus = [
  { name: 'Completed', value: 3200 },
  { name: 'Pending', value: 450 },
  { name: 'Late', value: 120 },
  { name: 'Incomplete', value: 80 }];
const admissionsByIntake = [
  { intake: 'Jan 2024', admitted: 1250, graduated: 0, current: 1250 },
  { intake: 'Sep 2023', admitted: 1100, graduated: 0, current: 1080 },
  { intake: 'Jan 2023', admitted: 980, graduated: 0, current: 920 },
  { intake: 'Sep 2022', admitted: 1050, graduated: 450, current: 580 },
  { intake: 'Jan 2022', admitted: 920, graduated: 820, current: 85 }];
const pendingRegistrations = [
  { id: 1, name: 'Mary Akinyi', regNo: 'CS/2024/001', semester: 'Semester 2', units: 6, status: 'Pending', daysLate: 0 },
  { id: 2, name: 'James Otieno', regNo: 'ENG/2023/045', semester: 'Semester 4', units: 5, status: 'Incomplete', daysLate: 0 },
  { id: 3, name: 'Grace Njeri', regNo: 'BUS/2024/089', semester: 'Semester 2', units: 7, status: 'Pending', daysLate: 0 },
  { id: 4, name: 'John Mwangi', regNo: 'MED/2023/012', semester: 'Semester 6', units: 4, status: 'Late', daysLate: 3 },
  { id: 5, name: 'Susan Wanjiku', regNo: 'CS/2023/067', semester: 'Semester 4', units: 6, status: 'Late', daysLate: 5 }];
const prerequisiteViolations = [
  { id: 1, student: 'Peter Kamau', regNo: 'CS/2023/034', unit: 'CS 401', prerequisite: 'CS 301', status: 'Blocked' },
  { id: 2, student: 'Jane Wambui', regNo: 'ENG/2023/056', unit: 'ENG 350', prerequisite: 'ENG 250', status: 'Warning' },
  { id: 3, student: 'David Ochieng', regNo: 'BUS/2024/012', unit: 'ACC 301', prerequisite: 'ACC 201', status: 'Blocked' },
  { id: 4, student: 'Mary Njeri', regNo: 'MED/2023/089', unit: 'MED 400', prerequisite: 'MED 350', status: 'Warning' }];
const transcriptRequests = [
  { id: 1, name: 'Peter Kamau', regNo: 'CS/2020/001', type: 'Official', purpose: 'Employment', status: 'Processing', requestDate: '2024-01-10' },
  { id: 2, name: 'Susan Wanjiku', regNo: 'BUS/2019/045', type: 'Certified', purpose: 'Further Studies', status: 'Ready', requestDate: '2024-01-08' },
  { id: 3, name: 'David Ochieng', regNo: 'ENG/2021/089', type: 'Official', purpose: 'HELB', status: 'Pending', requestDate: '2024-01-12' },
  { id: 4, name: 'Grace Njeri', regNo: 'MED/2018/034', type: 'Official', purpose: 'Licensing', status: 'Completed', requestDate: '2024-01-05' },
  { id: 5, name: 'James Omondi', regNo: 'CS/2019/078', type: 'Certified', purpose: 'Employment', status: 'Processing', requestDate: '2024-01-11' }];
const graduationEligible = [
  { id: 1, name: 'Faith Achieng', regNo: 'CS/2020/045', program: 'BSc Computer Science', credits: 180, cgpa: 3.65, status: 'Eligible' },
  { id: 2, name: 'John Mwangi', regNo: 'ENG/2020/012', program: 'BEng Civil', credits: 180, cgpa: 3.42, status: 'Eligible' },
  { id: 3, name: 'Susan Njeri', regNo: 'BUS/2020/089', program: 'BCom Accounting', credits: 175, cgpa: 3.28, status: 'Pending Credits' },
  { id: 4, name: 'Peter Ochieng', regNo: 'MED/2018/023', program: 'MBChB', credits: 360, cgpa: 3.71, status: 'Eligible' }];
const semesterCalendar = [
  { id: 1, event: 'Registration Opens', date: 'Jan 8, 2024', status: 'Completed' },
  { id: 2, event: 'Late Registration Deadline', date: 'Feb 15, 2024', status: 'Completed' },
  { id: 3, event: 'CAT 1 Period', date: 'Feb 26 - Mar 1, 2024', status: 'Upcoming' },
  { id: 4, event: 'Mid-Semester Break', date: 'Mar 25 - 29, 2024', status: 'Upcoming' },
  { id: 5, event: 'CAT 2 Period', date: 'Apr 15 - 19, 2024', status: 'Upcoming' },
  { id: 6, event: 'Final Exams', date: 'May 13 - 24, 2024', status: 'Upcoming' },
  { id: 7, event: 'Results Release', date: 'Jun 10, 2024', status: 'Upcoming' }];

export default function RegistrarDashboard() {
  const navigate = useNavigate();

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
          <Button size="sm" variant="outline" className="h-7" onClick={() => navigate('/registrations')}>
            Review
          </Button>
        </div>
    }];

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
        <Button size="sm" variant="outline" className="h-7" onClick={() => toast.warning('Override Applied', { description: `Prerequisite override granted for ${row.student}` })}>
          Override
        </Button>
    }];

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
    }];

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
    }];
  const totalRegistered = registrationStatus.reduce((sum, s) => sum + s.value, 0);
  const completedPercentage = registrationStatus[0].value / totalRegistered * 100;
  const handleExportData = () => {
    exportToCSV({ data: pendingRegistrations, filename: 'registration-data' });
  };
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">Registrar Dashboard</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            Academic Records & Enrollment Management
            <span className="w-1 h-1 rounded-full bg-border" />
            Academic Year 2023/2024
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
      {/* KPI Cards */}
      <div className="grid-cards">
        <StatsCard
          title="Registered Students"
          value="3,200"
          change={`${completedPercentage.toFixed(0)}% complete`}
          changeType="positive"
          icon={Users} />
        <StatsCard
          title="Pending Registrations"
          value="450"
          change="120 late submissions"
          changeType="negative"
          icon={Clock} />
        <StatsCard
          title="Transcript Requests"
          value="28"
          change="12 ready for pickup"
          changeType="neutral"
          icon={FileText} />
        <StatsCard
          title="Graduation Eligible"
          value="892"
          change="For June 2024"
          changeType="positive"
          icon={GraduationCap} />
      </div>
      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Prerequisite Violations"
          value="45"
          change="Requires attention"
          changeType="negative"
          icon={AlertTriangle} />
        <StatsCard
          title="Academic Warnings"
          value="67"
          change="Letters dispatched"
          changeType="negative"
          icon={AlertCircle} />
        <StatsCard
          title="Active Courses"
          value="186"
          change="This semester"
          changeType="neutral"
          icon={BookOpen} />
        <StatsCard
          title="Days to Deadline"
          value="12"
          change="Late reg. period"
          changeType="neutral"
          icon={Calendar} />
      </div>
      {/* Charts */}
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
      {/* Tabbed Content */}
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
                  <p className="text-xs text-muted-foreground mt-0.5">Candidates for June 2024 Conferment</p>
                </div>
                <Button className="rounded-xl h-9 font-bold text-xs shadow-lg shadow-primary/20" onClick={() => toast.success('Generating List', { description: 'Graduation list is being generated...' })}>
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
      {/* Alerts & Calendar */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Academic Alerts */}
        <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Critical Academic Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Registration Deadline', desc: 'Late registration closes in 12 days. 450 students pending.', icon: Clock, color: 'bg-destructive/10 text-destructive border-destructive/10' },
              { title: 'Prerequisite Blocks', desc: '45 Students missing requirements. Review before exams.', icon: AlertTriangle, color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/10' },
              { title: 'Graduation Pipeline', desc: 'Final graduation list submission due by March 30, 2024.', icon: GraduationCap, color: 'bg-primary/10 text-primary border-primary/10' },
              { title: 'Results Verified', desc: 'Semester 1 2023/2024 results verified and published.', icon: CheckCircle, color: 'bg-green-600/10 text-green-700 border-green-600/10' }
            ].map((alert) => (
              <div key={alert.title} className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.color.split(' ').slice(1).join(' ')} ${alert.color.split(' ')[0]} transition-all hover:shadow-md`}>
                <alert.icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">{alert.title}</p>
                  <p className="text-sm font-medium opacity-90 leading-tight mt-0.5">{alert.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Semester Calendar */}
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
            {semesterCalendar.map((item) =>
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-transparent hover:border-border/40 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-8 rounded-full ${item.status === 'Completed' ? 'bg-green-500' : 'bg-primary'}`
                  } />
                  <div>
                    <p className="text-sm font-bold tracking-tight">{item.event}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{item.date}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'Completed' ? 'secondary' : 'outline'} className="text-[10px] font-black h-5">
                  {item.status.toUpperCase()}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Student Lifecycle Overview */}
      <Card className="border-none shadow-premium bg-muted/20">
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg font-bold">Student Success Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
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
                    style={{ width: `${intake.current / intake.admitted * 100}%` }} />
                  {intake.graduated > 0 &&
                    <div
                      className="absolute top-0 right-0 h-full bg-green-500 transition-all duration-1000"
                      style={{ width: `${intake.graduated / intake.admitted * 100}%` }} />
                  }
                </div>
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                  <span className="text-primary">RETENTION: {(intake.current / intake.admitted * 100).toFixed(0)}%</span>
                  {intake.graduated > 0 && <span className="text-green-600">GRADUATION: {(intake.graduated / intake.admitted * 100).toFixed(0)}%</span>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>);
}