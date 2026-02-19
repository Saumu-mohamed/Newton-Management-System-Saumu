import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Download,
  FileText,
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  Building2,
  Clock,
  PieChart,
  Loader2 } from
'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
// Sample data generators for each report type
const generateReportData = (reportName) => {
  switch (reportName) {
    case 'Enrollment Report':
      return {
        data: [
        { campus: 'Main Campus', faculty: 'Science', program: 'Computer Science', intake: 'Jan 2024', students: 245, male: 150, female: 95 },
        { campus: 'Main Campus', faculty: 'Science', program: 'Mathematics', intake: 'Jan 2024', students: 120, male: 65, female: 55 },
        { campus: 'Main Campus', faculty: 'Business', program: 'Accounting', intake: 'Jan 2024', students: 180, male: 85, female: 95 },
        { campus: 'City Campus', faculty: 'Engineering', program: 'Civil Engineering', intake: 'Jan 2024', students: 150, male: 110, female: 40 },
        { campus: 'City Campus', faculty: 'Arts', program: 'Communication', intake: 'Jan 2024', students: 95, male: 40, female: 55 }],
        columns: [
        { key: 'campus', label: 'Campus' },
        { key: 'faculty', label: 'Faculty' },
        { key: 'program', label: 'Program' },
        { key: 'intake', label: 'Intake' },
        { key: 'students', label: 'Total Students' },
        { key: 'male', label: 'Male' },
        { key: 'female', label: 'Female' }]
      };
    case 'Academic Performance':
      return {
        data: [
        { program: 'Computer Science', enrolled: 245, passed: 220, failed: 15, avgGPA: 3.2, distinction: 45 },
        { program: 'Mathematics', enrolled: 120, passed: 105, failed: 10, avgGPA: 3.0, distinction: 20 },
        { program: 'Accounting', enrolled: 180, passed: 165, failed: 8, avgGPA: 3.1, distinction: 35 },
        { program: 'Civil Engineering', enrolled: 150, passed: 130, failed: 12, avgGPA: 2.9, distinction: 25 },
        { program: 'Communication', enrolled: 95, passed: 88, failed: 5, avgGPA: 3.3, distinction: 18 }],
        columns: [
        { key: 'program', label: 'Program' },
        { key: 'enrolled', label: 'Enrolled' },
        { key: 'passed', label: 'Passed' },
        { key: 'failed', label: 'Failed' },
        { key: 'avgGPA', label: 'Avg GPA' },
        { key: 'distinction', label: 'Distinction' }]
      };
    case 'Fee Collection Report':
      return {
        data: [
        { date: '2024-01-15', faculty: 'Science', collected: 2450000, mpesa: 1500000, bank: 800000, cash: 150000 },
        { date: '2024-01-14', faculty: 'Business', collected: 1890000, mpesa: 1200000, bank: 600000, cash: 90000 },
        { date: '2024-01-13', faculty: 'Engineering', collected: 2100000, mpesa: 1400000, bank: 650000, cash: 50000 },
        { date: '2024-01-12', faculty: 'Arts', collected: 980000, mpesa: 650000, bank: 280000, cash: 50000 }],
        columns: [
        { key: 'date', label: 'Date' },
        { key: 'faculty', label: 'Faculty' },
        { key: 'collected', label: 'Total Collected (KES)' },
        { key: 'mpesa', label: 'M-Pesa (KES)' },
        { key: 'bank', label: 'Bank Transfer (KES)' },
        { key: 'cash', label: 'Cash (KES)' }]
      };
    case 'Outstanding Balances':
      return {
        data: [
        { regNo: 'CS/2021/001', name: 'John Doe', program: 'Computer Science', totalFees: 150000, paid: 100000, balance: 50000 },
        { regNo: 'ENG/2021/002', name: 'Jane Smith', program: 'Engineering', totalFees: 180000, paid: 120000, balance: 60000 },
        { regNo: 'BUS/2022/003', name: 'Mike Johnson', program: 'Business Admin', totalFees: 120000, paid: 80000, balance: 40000 },
        { regNo: 'CS/2020/004', name: 'Sarah Wilson', program: 'Computer Science', totalFees: 150000, paid: 75000, balance: 75000 }],
        columns: [
        { key: 'regNo', label: 'Reg No' },
        { key: 'name', label: 'Student Name' },
        { key: 'program', label: 'Program' },
        { key: 'totalFees', label: 'Total Fees (KES)' },
        { key: 'paid', label: 'Paid (KES)' },
        { key: 'balance', label: 'Balance (KES)' }]
      };
    case 'Staff Directory':
      return {
        data: [
        { staffId: 'STF001', name: 'Dr. James Omondi', department: 'Computer Science', role: 'Lecturer', email: 'j.omondi@university.ac.ke' },
        { staffId: 'STF002', name: 'Prof. Mary Wanjiku', department: 'Mathematics', role: 'HOD', email: 'm.wanjiku@university.ac.ke' },
        { staffId: 'STF003', name: 'Mr. Peter Kamau', department: 'Administration', role: 'Registrar', email: 'p.kamau@university.ac.ke' },
        { staffId: 'STF004', name: 'Ms. Grace Akinyi', department: 'Finance', role: 'Accountant', email: 'g.akinyi@university.ac.ke' }],
        columns: [
        { key: 'staffId', label: 'Staff ID' },
        { key: 'name', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'role', label: 'Role' },
        { key: 'email', label: 'Email' }]
      };
    default:
      return {
        data: [{ message: 'Sample data for ' + reportName }],
        columns: [{ key: 'message', label: 'Message' }]
      };
  }
};
const reportCategories = [
{
  title: 'Student Reports',
  icon: GraduationCap,
  color: 'text-blue-600',
  bgColor: 'bg-blue-500/10',
  reports: [
  { name: 'Enrollment Report', description: 'Student enrollment by campus, faculty, and intake', format: 'PDF/Excel' },
  { name: 'Academic Performance', description: 'GPA distribution and grade analysis', format: 'PDF/Excel' },
  { name: 'Attendance Report', description: 'Student attendance across all units', format: 'Excel' },
  { name: 'Graduation Eligibility', description: 'Students eligible for graduation', format: 'PDF' }]
},
{
  title: 'Financial Reports',
  icon: Wallet,
  color: 'text-green-600',
  bgColor: 'bg-green-500/10',
  reports: [
  { name: 'Fee Collection Report', description: 'Daily, weekly, monthly collection summary', format: 'PDF/Excel' },
  { name: 'Outstanding Balances', description: 'Students with pending fee balances', format: 'Excel' },
  { name: 'Payment Methods', description: 'Breakdown by M-Pesa, Bank, Cash', format: 'PDF' },
  { name: 'Revenue by Faculty', description: 'Fee collection per faculty/department', format: 'PDF/Excel' }]
},
{
  title: 'Staff Reports',
  icon: Users,
  color: 'text-purple-600',
  bgColor: 'bg-purple-500/10',
  reports: [
  { name: 'Staff Directory', description: 'Complete list of all staff members', format: 'Excel' },
  { name: 'Lecturer Workload', description: 'Units and students per lecturer', format: 'PDF/Excel' },
  { name: 'Department Summary', description: 'Staff count by department', format: 'PDF' }]
},
{
  title: 'Campus Reports',
  icon: Building2,
  color: 'text-yellow-600',
  bgColor: 'bg-yellow-500/10',
  reports: [
  { name: 'Campus Comparison', description: 'Multi-campus enrollment and revenue', format: 'PDF/Excel' },
  { name: 'Capacity Utilization', description: 'Enrollment vs capacity analysis', format: 'PDF' },
  { name: 'Resource Allocation', description: 'Staff and facility distribution', format: 'Excel' }]
}];
const recentReports = [
{ name: 'Monthly Enrollment Report', generated: '2024-01-15 10:30', by: 'John Kamau', size: '2.4 MB', type: 'Enrollment Report' },
{ name: 'Fee Collection - January', generated: '2024-01-14 16:00', by: 'Grace Muthoni', size: '1.8 MB', type: 'Fee Collection Report' },
{ name: 'Academic Performance Q4', generated: '2024-01-10 09:15', by: 'Peter Ochieng', size: '3.2 MB', type: 'Academic Performance' }];
export default function ReportsPage() {
  const [generatingReport, setGeneratingReport] = useState(null);
  const handleGenerateReport = async (reportName, format = 'csv') => {
    setGeneratingReport(reportName);
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { data, columns } = generateReportData(reportName);
    const filename = reportName.toLowerCase().replace(/\s+/g, '-');
    if (format === 'pdf') {
      exportToPDF({ data, columns, filename, title: reportName });
    } else {
      exportToCSV({ data, columns, filename });
    }
    setGeneratingReport(null);
  };
  const handleDownload = (reportName, type) => {
    handleGenerateReport(type, 'csv');
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download system reports</p>
        </div>
        <Button size="sm" onClick={() => toast.info('Custom Report', { description: 'Custom report builder coming soon' })}>
          <PieChart className="h-4 w-4 mr-2" />
          Custom Report
        </Button>
      </div>
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Available Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Downloads This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Scheduled Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Generated Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, idx) =>
            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">Generated {report.generated} by {report.by}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{report.size}</Badge>
                  <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(report.name, report.type)}
                  disabled={generatingReport === report.type}>
                    {generatingReport === report.type ?
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> :
                  <Download className="h-3 w-3 mr-1" />
                  }
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Report Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportCategories.map((category) =>
        <Card key={category.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <CardTitle className="text-base">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.reports.map((report, idx) =>
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{report.format}</Badge>
                      {report.format.includes('Excel') &&
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerateReport(report.name, 'csv')}
                    disabled={generatingReport === report.name}
                    title="Download CSV">
                          {generatingReport === report.name ?
                    <Loader2 className="h-3 w-3 animate-spin" /> :
                    <Download className="h-3 w-3" />
                    }
                        </Button>
                  }
                      {report.format.includes('PDF') &&
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerateReport(report.name, 'pdf')}
                    disabled={generatingReport === report.name}
                    title="Download PDF">
                          {generatingReport === report.name ?
                    <Loader2 className="h-3 w-3 animate-spin" /> :
                    <FileText className="h-3 w-3" />
                    }
                        </Button>
                  }
                    </div>
                  </div>
              )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>);
}