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
import { useState } from 'react';
import { ViewCourseModal } from '@/components/modals';
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
  Smartphone,
  MapPin,
  Eye
} from
  'lucide-react';
// Mock data for student dashboard
const gpaProgress = [
  { semester: 'Sem 1', gpa: 3.2, credits: 18 },
  { semester: 'Sem 2', gpa: 3.4, credits: 18 },
  { semester: 'Sem 3', gpa: 3.1, credits: 21 },
  { semester: 'Sem 4', gpa: 3.5, credits: 21 },
  { semester: 'Sem 5', gpa: 3.6, credits: 18 }];
const semesterPerformance = [
  { unit: 'CS 301', score: 78 },
  { unit: 'CS 305', score: 72 },
  { unit: 'CS 310', score: 85 },
  { unit: 'CS 315', score: 68 },
  { unit: 'GS 300', score: 82 }];
const registeredUnits = [
  { id: 1, code: 'CS 301', name: 'Database Systems', lecturer: 'Dr. J. Kiprop', credits: 3, day: 'Monday', time: '8:00 AM', room: 'LH 201', status: 'Active', department: 'Computer Science', students: 120, semester: 'Semester 6', description: 'Concepts of database management systems, relational databases, and SQL.' },
  { id: 2, code: 'CS 305', name: 'Software Engineering', lecturer: 'Prof. M. Ochieng', credits: 3, day: 'Tuesday', time: '10:00 AM', room: 'LH 105', status: 'Active', department: 'Computer Science', students: 115, semester: 'Semester 6', description: 'Principles of software development, modeling, and project management.' },
  { id: 3, code: 'CS 310', name: 'Computer Networks', lecturer: 'Dr. P. Wanjiku', credits: 3, day: 'Wednesday', time: '2:00 PM', room: 'Lab 3', status: 'Active', department: 'Computer Science', students: 105, semester: 'Semester 6', description: 'Data communication principles, network protocols, and architectures.' },
  { id: 4, code: 'CS 315', name: 'Operating Systems', lecturer: 'Dr. K. Mwangi', credits: 3, day: 'Thursday', time: '8:00 AM', room: 'LH 201', status: 'Active', department: 'Computer Science', students: 118, semester: 'Semester 6', description: 'Internal structure of operating systems, memory management, and process scheduling.' },
  { id: 5, code: 'GS 300', name: 'Communication Skills', lecturer: 'Ms. A. Njeri', credits: 2, day: 'Friday', time: '10:00 AM', room: 'LH 301', status: 'Active', department: 'General Studies', students: 300, semester: 'Semester 6', description: 'Developing effective oral and written communication skills for academic and professional contexts.' }];
const recentResults = [
  { id: 1, unit: 'CS 201', name: 'Data Structures', cat: 25, exam: 53, total: 78, grade: 'A', points: 4.0 },
  { id: 2, unit: 'CS 205', name: 'OOP with Java', cat: 22, exam: 48, total: 70, grade: 'B+', points: 3.5 },
  { id: 3, unit: 'CS 210', name: 'Web Development', cat: 28, exam: 52, total: 80, grade: 'A', points: 4.0 },
  { id: 4, unit: 'MA 201', name: 'Statistics', cat: 20, exam: 45, total: 65, grade: 'B', points: 3.0 },
  { id: 5, unit: 'CS 215', name: 'Computer Architecture', cat: 24, exam: 48, total: 72, grade: 'B+', points: 3.5 }];
const paymentHistory = [
  { id: 1, date: '2024-01-10', description: 'Tuition Fee - Sem 2', amount: 45000, method: 'M-Pesa', reference: 'QKL2X4Y8N', status: 'Completed' },
  { id: 2, date: '2023-12-15', description: 'Library Fee', amount: 5000, method: 'M-Pesa', reference: 'RHJ7K9M2P', status: 'Completed' },
  { id: 3, date: '2023-11-20', description: 'Tuition Fee - Sem 1', amount: 50000, method: 'Bank', reference: 'BNK89012345', status: 'Completed' },
  { id: 4, date: '2023-09-05', description: 'Registration Fee', amount: 10000, method: 'M-Pesa', reference: 'ABC1D2E3F', status: 'Completed' }];
const upcomingDeadlines = [
  { id: 1, title: 'Fee Payment Deadline', date: 'Mar 15, 2024', type: 'finance', urgent: true, description: 'Final deadline for semester fees' },
  { id: 2, title: 'CS 305 Assignment', date: 'Mar 18, 2024', type: 'academic', urgent: false, description: 'Submit via e-learning portal' },
  { id: 3, title: 'CAT 2 Exams Begin', date: 'Mar 25, 2024', type: 'exam', urgent: false, description: 'All registered units' },
  { id: 4, title: 'Unit Registration Closes', date: 'Mar 30, 2024', type: 'deadline', urgent: true, description: 'Last day for add/drop' }];
const examSchedule = [
  { id: 1, date: 'May 13, 2024', time: '8:00 AM', unit: 'CS 301', venue: 'Exam Hall A', seat: 'A-45' },
  { id: 2, date: 'May 15, 2024', time: '2:00 PM', unit: 'CS 305', venue: 'Exam Hall B', seat: 'B-23' },
  { id: 3, date: 'May 17, 2024', time: '8:00 AM', unit: 'CS 310', venue: 'Exam Hall A', seat: 'A-45' },
  { id: 4, date: 'May 20, 2024', time: '2:00 PM', unit: 'CS 315', venue: 'Exam Hall C', seat: 'C-12' },
  { id: 5, date: 'May 22, 2024', time: '8:00 AM', unit: 'GS 300', venue: 'Exam Hall B', seat: 'B-23' }];
const notifications = [
  { id: 1, title: 'Fee Balance Reminder', message: 'Your fee balance of KES 45,000 is due by Mar 15', time: '2 hours ago', type: 'warning' },
  { id: 2, title: 'Exam Timetable Published', message: 'Final exam schedule for Sem 2 2023/24 is now available', time: '1 day ago', type: 'info' },
  { id: 3, title: 'CS 305 Assignment Posted', message: 'New assignment due Mar 18, 2024', time: '2 days ago', type: 'info' },
  { id: 4, title: 'Results Released', message: 'Sem 1 2023/24 results are now available', time: '1 week ago', type: 'success' }];
const pendingDocuments = [
  { id: 1, document: 'Student ID Card', status: 'Ready for Collection', location: 'Registry Office' },
  { id: 2, document: 'Exam Card', status: 'Pending Fee Clearance', location: 'Finance Office' },
  { id: 3, document: 'Medical Insurance Card', status: 'Processing', location: 'Student Welfare' }];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

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
  const feeBalance = 45000;
  const totalFees = 120000;
  const feePercentage = (totalFees - feeBalance) / totalFees * 100;
  const currentCGPA = 3.45;
  const totalCredits = 96;
  const handleDownloadTranscript = () => {
    const transcriptData = {
      studentName: 'Faith Achieng',
      studentId: 'CS/2023/045',
      program: 'BSc Computer Science',
      faculty: 'School of Computing',
      dateOfAdmission: 'September 2021',
      status: 'In Progress',
      semesters: gpaProgress.map((s, i) => ({
        name: s.semester,
        courses: recentResults.map((r) => ({
          code: r.unit,
          name: r.name,
          credits: 3,
          grade: r.grade,
          points: r.points
        })),
        gpa: s.gpa
      })),
      cgpa: currentCGPA,
      totalCredits: totalCredits
    };
    printTranscript(transcriptData);
  };
  const handlePrintFeeStatement = () => {
    printFeeStatement({
      studentName: 'Faith Achieng',
      studentId: 'CS/2023/045',
      program: 'BSc Computer Science',
      academicYear: '2023/2024',
      feeItems: [
        { item: 'Tuition Fee', amount: 100000, paid: 55000 },
        { item: 'Library Fee', amount: 5000, paid: 5000 },
        { item: 'Registration Fee', amount: 10000, paid: 10000 },
        { item: 'Medical Fee', amount: 5000, paid: 5000 }],
      payments: paymentHistory.map((p) => ({
        date: p.date,
        reference: p.reference,
        method: p.method,
        amount: p.amount
      }))
    });
  };
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="h1-page">My Dashboard</h1>
          <p className="body-md text-muted-foreground">Welcome back, Faith Achieng • CS/2023/045 • Year 3</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownloadTranscript}>
            <Download className="h-4 w-4 mr-2" />
            Download Transcript
          </Button>
          <Button size="sm" onClick={() => navigate('/results')}>
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
          change="Due: Mar 15, 2024"
          changeType="negative"
          icon={Wallet} />
        <StatsCard
          title="Registered Units"
          value="5"
          change="14 credits this semester"
          changeType="neutral"
          icon={BookOpen} />
        <StatsCard
          title="Current CGPA"
          value={currentCGPA.toFixed(2)}
          change="2nd Class Upper Division"
          changeType="positive"
          icon={GraduationCap} />
        <StatsCard
          title="Upcoming Exams"
          value="5"
          change="Starting May 13"
          changeType="neutral"
          icon={Calendar} />
      </div>
      {/* Fee Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Fee Payment Progress - Semester 2 2023/24</CardTitle>
            <Button size="sm" onClick={() => navigate('/fees')}>
              <Smartphone className="h-4 w-4 mr-2" />
              Pay via M-Pesa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>KES {(totalFees - feeBalance).toLocaleString()} paid</span>
              <span className="text-muted-foreground">KES {totalFees.toLocaleString()} total</span>
            </div>
            <Progress value={feePercentage} className="h-3" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{feePercentage.toFixed(0)}% paid</span>
              <span className="text-destructive font-medium">Balance: KES {feeBalance.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Academic Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current CGPA</p>
                <p className="text-3xl font-bold">{currentCGPA.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">2nd Class Upper Division</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-3xl font-bold">{totalCredits}</p>
                <p className="text-xs text-muted-foreground mt-1">of 144 required</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress value={totalCredits / 144 * 100} className="h-2 mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Semester Status</p>
                <p className="text-3xl font-bold">6</p>
                <p className="text-xs text-muted-foreground mt-1">of 8 semesters</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <Progress value={75} className="h-2 mt-3" />
          </CardContent>
        </Card>
      </div>
      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Registered Units */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Registered Units - Semester 6</CardTitle>
                <Badge variant="secondary">5 units • 14 credits</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={unitColumns}
                data={registeredUnits}
                searchable={false}
                pageSize={6} />
            </CardContent>
          </Card>
        </div>
        {/* Sidebar - Deadlines & Notifications */}
        <div className="space-y-4">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.map((item) =>
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-2 rounded-lg ${item.urgent ? 'bg-destructive/5 border border-destructive/10' : ''}`
                  }>
                  {item.type === 'finance' && <Wallet className="h-4 w-4 text-destructive mt-0.5" />}
                  {item.type === 'academic' && <FileText className="h-4 w-4 text-primary mt-0.5" />}
                  {item.type === 'exam' && <Calendar className="h-4 w-4 text-yellow-500 mt-0.5" />}
                  {item.type === 'deadline' && <Clock className="h-4 w-4 text-orange-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  {item.urgent &&
                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                  }
                </div>
              )}
            </CardContent>
          </Card>
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Notifications</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toast.info('All Notifications', { description: 'Full notification center coming soon' })}>View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.slice(0, 3).map((notification) =>
                <div key={notification.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'warning' ? 'bg-yellow-500' :
                    notification.type === 'success' ? 'bg-green-500' :
                      'bg-primary'}`
                  } />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <AreaChartCard
          title="GPA Progress Over Semesters"
          data={gpaProgress}
          dataKey="gpa"
          xAxisKey="semester" />
        <BarChartCard
          title="Current Semester Performance"
          data={semesterPerformance}
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
                <CardTitle className="text-base font-medium">Semester 5 Results</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">GPA: 3.6</Badge>
                  <Button variant="outline" size="sm" onClick={() => {
                    exportToCSV({ data: recentResults, filename: 'semester-results' });
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
                data={recentResults}
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
                data={paymentHistory}
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
                <CardTitle className="text-base font-medium">Final Exam Timetable - May 2024</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Timetable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={examColumns}
                data={examSchedule}
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
              {pendingDocuments.map((doc) =>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/fees')}>
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Pay Fees</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/my-courses')}>
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Register Units</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/results')}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">View Results</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleDownloadTranscript}>
              <Download className="h-5 w-5" />
              <span className="text-xs">Transcript</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/timetable')}>
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Timetable</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handlePrintFeeStatement}>
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Fee Statement</span>
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