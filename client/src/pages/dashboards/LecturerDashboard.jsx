import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { exportToCSV, triggerFileUpload, importFromCSV } from '@/lib/export-utils';
import {
  BookOpen,
  Users,
  ClipboardList,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  GraduationCap,
  AlertTriangle,
  Download,
  Upload,
  Eye,
  Edit,
  Send } from
'lucide-react';
// Mock data for lecturer dashboard
const classPerformance = [
{ unit: 'CS 301', average: 68, highest: 92, lowest: 32, submitted: 85 },
{ unit: 'CS 305', average: 72, highest: 95, lowest: 38, submitted: 70 },
{ unit: 'CS 401', average: 65, highest: 88, lowest: 28, submitted: 42 },
{ unit: 'CS 410', average: 78, highest: 96, lowest: 45, submitted: 38 }];
const gradeDistribution = [
{ name: 'A (70-100)', value: 18 },
{ name: 'B (60-69)', value: 35 },
{ name: 'C (50-59)', value: 28 },
{ name: 'D (40-49)', value: 12 },
{ name: 'E (<40)', value: 7 }];
const assignedUnits = [
{ id: 1, code: 'CS 301', name: 'Database Systems', students: 85, catSubmitted: true, examSubmitted: false, deadline: 'Mar 15, 2024', semester: 'Sem 2 2023/24' },
{ id: 2, code: 'CS 305', name: 'Software Engineering', students: 72, catSubmitted: false, examSubmitted: false, deadline: 'Mar 18, 2024', semester: 'Sem 2 2023/24' },
{ id: 3, code: 'CS 401', name: 'Machine Learning', students: 45, catSubmitted: false, examSubmitted: false, deadline: 'Mar 20, 2024', semester: 'Sem 2 2023/24' },
{ id: 4, code: 'CS 410', name: 'Cloud Computing', students: 38, catSubmitted: true, examSubmitted: false, deadline: 'Mar 15, 2024', semester: 'Sem 2 2023/24' }];
const classLists = [
{ id: 1, regNo: 'CS/2023/001', name: 'Faith Achieng', cat1: 28, cat2: 25, attendance: 92, status: 'Regular' },
{ id: 2, regNo: 'CS/2023/012', name: 'Peter Kamau', cat1: 18, cat2: null, attendance: 78, status: 'At Risk' },
{ id: 3, regNo: 'CS/2023/034', name: 'Grace Wanjiku', cat1: 30, cat2: 28, attendance: 95, status: 'Regular' },
{ id: 4, regNo: 'CS/2023/045', name: 'John Mwangi', cat1: 15, cat2: 12, attendance: 65, status: 'Probation' },
{ id: 5, regNo: 'CS/2023/056', name: 'Susan Njeri', cat1: 25, cat2: 27, attendance: 88, status: 'Regular' },
{ id: 6, regNo: 'CS/2023/067', name: 'James Ochieng', cat1: 22, cat2: 20, attendance: 82, status: 'Regular' }];
const pendingGrades = [
{ id: 1, unit: 'CS 305', type: 'CAT 2', students: 72, due: '2 days', urgency: 'High' },
{ id: 2, unit: 'CS 401', type: 'Assignment 3', students: 45, due: '5 days', urgency: 'Medium' },
{ id: 3, unit: 'CS 305', type: 'Mid-Semester', students: 72, due: '1 week', urgency: 'Low' },
{ id: 4, unit: 'CS 401', type: 'CAT 1', students: 45, due: '3 days', urgency: 'High' }];
const todaySchedule = [
{ id: 1, time: '8:00 AM - 10:00 AM', unit: 'CS 301', room: 'LH 201', type: 'Lecture', status: 'Upcoming' },
{ id: 2, time: '10:00 AM - 1:00 PM', unit: 'CS 305', room: 'Lab 3', type: 'Practical', status: 'Upcoming' },
{ id: 3, time: '2:00 PM - 4:00 PM', unit: 'CS 401', room: 'LH 105', type: 'Lecture', status: 'Upcoming' },
{ id: 4, time: '4:00 PM - 5:00 PM', unit: 'CS 410', room: 'Lab 1', type: 'Tutorial', status: 'Upcoming' }];
const weekSchedule = [
{ day: 'Monday', classes: 3, hours: 6 },
{ day: 'Tuesday', classes: 2, hours: 4 },
{ day: 'Wednesday', classes: 4, hours: 8 },
{ day: 'Thursday', classes: 2, hours: 4 },
{ day: 'Friday', classes: 1, hours: 2 }];
const studentAlerts = [
{ id: 1, student: 'John Mwangi', regNo: 'CS/2023/045', issue: 'Prerequisite Failure', unit: 'CS 401', action: 'Contact Required' },
{ id: 2, student: 'Peter Kamau', regNo: 'CS/2023/012', issue: 'Low Attendance (65%)', unit: 'CS 305', action: 'Warning Issued' },
{ id: 3, student: 'Mary Akinyi', regNo: 'CS/2023/078', issue: 'Missing CAT 2', unit: 'CS 301', action: 'Follow Up' },
{ id: 4, student: 'David Njeri', regNo: 'CS/2023/089', issue: 'Academic Probation', unit: 'CS 410', action: 'Counseling' }];
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
            <span className="text-muted-foreground text-xs">Not Due</span>
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
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info('View Unit', { description: `Viewing ${row.code} - ${row.name}` })}>
          <Eye className="h-3 w-3" />
        </Button>
        <Button size="sm" variant={row.catSubmitted ? 'outline' : 'default'} className="h-7" onClick={() => toast.info(row.catSubmitted ? 'View Grades' : 'Enter Grades', { description: `Opening grade entry for ${row.code}` })}>
          {row.catSubmitted ? 'View Grades' : 'Enter Grades'}
        </Button>
      </div>
}];
const classListColumns = [
{ key: 'regNo', label: 'Reg No' },
{ key: 'name', label: 'Student Name', sortable: true },
{ key: 'cat1', label: 'CAT 1 (30)', sortable: true },
{
  key: 'cat2',
  label: 'CAT 2 (30)',
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
  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info('Edit Grades', { description: `Editing grades for ${row.name}` })}>
        <Edit className="h-3 w-3" />
      </Button>
}];
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
}];
export default function LecturerDashboard() {
  const navigate = useNavigate();
  const totalStudents = assignedUnits.reduce((sum, u) => sum + u.students, 0);
  const pendingCount = pendingGrades.length;
  const todayClasses = todaySchedule.length;
  const handleDownloadClassLists = () => {
    exportToCSV({ data: classLists, filename: 'class-lists' });
  };
  const handleUploadGrades = () => {
    triggerFileUpload('.csv', (file) => {
      importFromCSV(file, (grades) => {
        toast.success('Upload Complete', { description: `${grades.length} grades imported successfully` });
      });
    });
  };
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="h1-page">Lecturer Dashboard</h1>
          <p className="body-md text-muted-foreground">Welcome back, Dr. James Kiprop • School of Computing</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownloadClassLists}>
            <Download className="h-4 w-4 mr-2" />
            Download Class Lists
          </Button>
          <Button size="sm" onClick={() => navigate('/grades')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Grades
          </Button>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid-cards">
        <StatsCard
          title="Assigned Units"
          value={assignedUnits.length.toString()}
          change="This semester"
          changeType="neutral"
          icon={BookOpen} />
        <StatsCard
          title="Total Students"
          value={totalStudents.toString()}
          change="Across all units"
          changeType="neutral"
          icon={Users} />
        <StatsCard
          title="Pending Grades"
          value={pendingCount.toString()}
          change="2 due this week"
          changeType="negative"
          icon={ClipboardList} />
        <StatsCard
          title="Classes Today"
          value={todayClasses.toString()}
          change="Next: 8:00 AM"
          changeType="neutral"
          icon={Calendar} />
      </div>
      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Assigned Units */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">My Units - Semester 2 2023/24</CardTitle>
                <Badge variant="secondary">{assignedUnits.length} units</Badge>
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
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Today's Schedule</CardTitle>
              <Badge variant="outline">{todayClasses} classes</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySchedule.map((item, index) =>
            <div
              key={item.id}
              className={`p-3 rounded-lg border ${
              index === 0 ? 'bg-primary/5 border-primary/20' : ''}`
              }>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.unit}</span>
                  <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.time}
                  <span>•</span>
                  {item.room}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Charts and Pending Grades */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BarChartCard
          title="Class Performance (Average %)"
          data={classPerformance}
          dataKeys={['average']}
          xAxisKey="unit" />
        <PieChartCard title="Grade Distribution (All Units)" data={gradeDistribution} />
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Pending Grade Entries
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingGrades.map((grade) =>
            <div
              key={grade.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
              grade.urgency === 'High' ? 'bg-destructive/5 border-destructive/20' :
              grade.urgency === 'Medium' ? 'bg-yellow-500/5 border-yellow-500/20' :
              'bg-muted/50'}`
              }>
                <div>
                  <p className="text-sm font-medium">{grade.unit} - {grade.type}</p>
                  <p className="text-xs text-muted-foreground">{grade.students} students</p>
                </div>
                <div className="text-right">
                  <Badge variant={
                grade.urgency === 'High' ? 'destructive' :
                grade.urgency === 'Medium' ? 'default' :
                'secondary'
                }>
                    Due in {grade.due}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Tabbed Content */}
      <Tabs defaultValue="classlist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classlist">Class List (CS 301)</TabsTrigger>
          <TabsTrigger value="alerts">Student Alerts</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="classlist">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">CS 301 - Database Systems Class List</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success('Exporting', { description: 'Exporting class list...' })}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" onClick={() => toast.info('Upload Marks', { description: 'Opening marks upload form...' })}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Marks
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={classListColumns}
                data={classLists}
                searchPlaceholder="Search students..."
                pageSize={6}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Student Performance Alerts
                </CardTitle>
                <Badge variant="destructive">{studentAlerts.length} alerts</Badge>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Weekly Teaching Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekSchedule.map((day) =>
                <div key={day.day} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <p className="font-medium">{day.day}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{day.classes} classes</span>
                        <span>•</span>
                        <span>{day.hours} hours</span>
                      </div>
                    </div>
                    <Progress value={day.hours / 8 * 100} className="w-32 h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Grading Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Grading Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {classPerformance.map((unit) =>
            <div key={unit.unit} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{unit.unit}</span>
                  <Badge variant="secondary">{unit.submitted} students</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-green-500/10">
                    <p className="text-green-600 font-medium">{unit.highest}</p>
                    <p className="text-muted-foreground">Highest</p>
                  </div>
                  <div className="p-2 rounded bg-primary/10">
                    <p className="text-primary font-medium">{unit.average}</p>
                    <p className="text-muted-foreground">Average</p>
                  </div>
                  <div className="p-2 rounded bg-destructive/10">
                    <p className="text-destructive font-medium">{unit.lowest}</p>
                    <p className="text-muted-foreground">Lowest</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/grades')}>
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload Grades</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleDownloadClassLists}>
              <Download className="h-5 w-5" />
              <span className="text-xs">Class Lists</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => {
              exportToCSV({ data: classPerformance, filename: 'performance-report' });
            }}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/schedule')}>
              <Calendar className="h-5 w-5" />
              <span className="text-xs">View Timetable</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => toast.success('Email', { description: 'Email composition coming soon' })}>
              <Send className="h-5 w-5" />
              <span className="text-xs">Email Students</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/my-classes')}>
              <GraduationCap className="h-5 w-5" />
              <span className="text-xs">My Classes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
}