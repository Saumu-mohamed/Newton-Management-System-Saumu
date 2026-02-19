import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { AreaChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
import {
  Users,
  GraduationCap,
  Building2,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  Activity,
  Server,
  Wifi,
  RefreshCw,
  Download,
  Bell,
  Lock,
  Unlock,
  Key,
  Eye
} from
  'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/modals';
// Mock data for system-wide monitoring
const enrollmentData = [
  { month: 'Jan', students: 1200, lecturers: 45 },
  { month: 'Feb', students: 1350, lecturers: 48 },
  { month: 'Mar', students: 1450, lecturers: 52 },
  { month: 'Apr', students: 1380, lecturers: 50 },
  { month: 'May', students: 1520, lecturers: 55 },
  { month: 'Jun', students: 1680, lecturers: 58 }];
const campusComparison = [
  { campus: 'Main Campus', enrolled: 3200, collected: 45000000, outstanding: 8200000, staff: 185 },
  { campus: 'Mombasa', enrolled: 1800, collected: 28000000, outstanding: 5100000, staff: 98 },
  { campus: 'Kisumu', enrolled: 1200, collected: 19000000, outstanding: 3800000, staff: 72 },
  { campus: 'Nakuru', enrolled: 980, collected: 15000000, outstanding: 2900000, staff: 58 }];
const userDistribution = [
  { name: 'Students', value: 8500 },
  { name: 'Lecturers', value: 450 },
  { name: 'Staff', value: 280 },
  { name: 'Admins', value: 45 }];
const accountStatus = [
  { name: 'Active', value: 8420 },
  { name: 'Inactive', value: 650 },
  { name: 'Suspended', value: 85 },
  { name: 'Pending', value: 120 }];
const pendingApprovals = [
  { id: 1, name: 'Faith Achieng', type: 'Student Registration', campus: 'Main', date: '2024-01-15', priority: 'High' },
  { id: 2, name: 'Dr. Peter Omondi', type: 'Lecturer Onboarding', campus: 'Mombasa', date: '2024-01-14', priority: 'Medium' },
  { id: 3, name: 'Grace Wanjiru', type: 'Fee Waiver Request', campus: 'Main', date: '2024-01-14', priority: 'High' },
  { id: 4, name: 'John Kiprop', type: 'Transfer Request', campus: 'Kisumu', date: '2024-01-13', priority: 'Low' },
  { id: 5, name: 'Mary Njeri', type: 'Document Verification', campus: 'Nakuru', date: '2024-01-12', priority: 'Medium' }];
const recentAuditLogs = [
  { id: 1, action: 'User Login', user: 'admin@cms.edu', ip: '192.168.1.45', time: '2 min ago', status: 'success', details: 'Super Admin access granted' },
  { id: 2, action: 'Password Reset', user: 'student@cms.edu', ip: '192.168.1.102', time: '15 min ago', status: 'success', details: 'Password changed successfully' },
  { id: 3, action: 'Failed Login', user: 'unknown@test.com', ip: '45.23.112.8', time: '1 hour ago', status: 'failed', details: 'Invalid credentials - 3rd attempt' },
  { id: 4, action: 'Role Changed', user: 'lecturer@cms.edu', ip: '192.168.1.78', time: '2 hours ago', status: 'success', details: 'Role upgraded to Senior Lecturer' },
  { id: 5, action: 'Account Blocked', user: 'suspicious@mail.com', ip: '89.45.223.1', time: '3 hours ago', status: 'warning', details: 'Multiple failed attempts detected' },
  { id: 6, action: 'Payment Processed', user: 'finance@cms.edu', ip: '192.168.1.56', time: '4 hours ago', status: 'success', details: 'Bulk payment reconciliation' }];
const systemAlerts = [
  { id: 1, type: 'error', title: 'Failed M-Pesa Callback', message: '3 payment confirmations pending', time: '5 min ago' },
  { id: 2, type: 'warning', title: 'High Server Load', message: 'CPU usage at 85%', time: '15 min ago' },
  { id: 3, type: 'info', title: 'Scheduled Maintenance', message: 'Database backup at 2:00 AM', time: '1 hour ago' },
  { id: 4, type: 'error', title: 'Blocked Account Alert', message: '5 accounts blocked today', time: '2 hours ago' }];
const allUsers = [
  { id: 1, name: 'James Ochieng', email: 'james.ochieng@cms.edu', role: 'Student', campus: 'Main', status: 'Active', lastLogin: '2 hours ago' },
  { id: 2, name: 'Dr. Susan Wanjiku', email: 'susan.wanjiku@cms.edu', role: 'Lecturer', campus: 'Mombasa', status: 'Active', lastLogin: '1 day ago' },
  { id: 3, name: 'Peter Kamau', email: 'peter.kamau@cms.edu', role: 'Finance Officer', campus: 'Main', status: 'Active', lastLogin: '5 hours ago' },
  { id: 4, name: 'Grace Njeri', email: 'grace.njeri@cms.edu', role: 'Registrar', campus: 'Kisumu', status: 'Inactive', lastLogin: '1 week ago' },
  { id: 5, name: 'David Mwangi', email: 'david.mwangi@cms.edu', role: 'Student', campus: 'Nakuru', status: 'Suspended', lastLogin: '2 weeks ago' }];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const handleAction = (row, isApprove) => {
    setConfirmConfig({
      title: isApprove ? 'Confirm Approval' : 'Confirm Rejection',
      description: `Are you sure you want to ${isApprove ? 'approve' : 'reject'} the ${row.type} request from ${row.name}?`,
      confirmText: isApprove ? 'Approve' : 'Reject',
      variant: isApprove ? 'default' : 'destructive',
      onConfirm: () => {
        toast.success(isApprove ? 'Approved' : 'Rejected', {
          description: `${row.name}'s ${row.type} has been ${isApprove ? 'approved' : 'rejected'}`
        });
      }
    });
    setIsConfirmOpen(true);
  };

  const approvalColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Request Type' },
    { key: 'campus', label: 'Campus' },
    { key: 'date', label: 'Date', sortable: true },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) =>
        <Badge variant={value === 'High' ? 'destructive' : value === 'Medium' ? 'default' : 'secondary'}>
          {value}
        </Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) =>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => handleAction(row, true)}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => handleAction(row, false)}>
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
    }];

  const campusColumns = [
    { key: 'campus', label: 'Campus', sortable: true },
    { key: 'enrolled', label: 'Students', sortable: true },
    { key: 'staff', label: 'Staff', sortable: true },
    {
      key: 'collected',
      label: 'Collected',
      render: (value) => `KES ${(value / 1000000).toFixed(1)}M`,
      sortable: true
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      render: (value) =>
        <span className="text-destructive font-medium">KES {(value / 1000000).toFixed(1)}M</span>,
      sortable: true
    }];

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'campus', label: 'Campus' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'lastLogin', label: 'Last Login' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) =>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/profile')}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info('Reset Password', { description: `Password reset email sent to ${row.email}` })}>
            <Key className="h-3 w-3" />
          </Button>
          {row.status === 'Active' ?
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => toast.warning('Account Blocked', { description: `${row.name}'s account has been blocked` })}>
              <Lock className="h-3 w-3" />
            </Button> :
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => toast.success('Account Unblocked', { description: `${row.name}'s account has been unblocked` })}>
              <Unlock className="h-3 w-3" />
            </Button>
          }
        </div>
    }];
  const handleExportReport = () => {
    exportToPDF({
      data: [
        { metric: 'Total Users', value: '9,275', status: 'Active' },
        { metric: 'Active Students', value: '8,420', status: 'Active' },
        { metric: 'Campuses', value: '4', status: 'Operational' },
        { metric: 'Fee Collection', value: 'KES 107M', status: '+18%' }],
      filename: 'system-report',
      title: 'System Report',
      columns: [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
        { key: 'status', label: 'Status' }]
    });
  };
  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="h1-page">Super Admin Dashboard</h1>
          <p className="body-md text-muted-foreground">System-wide monitoring and management controls</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      {/* Real-Time System Status */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <Server className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">System Status</p>
              <p className="text-sm font-semibold text-green-600">All Systems Online</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Wifi className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Sessions</p>
              <p className="text-sm font-semibold">1,245 users online</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Activity className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Server Load</p>
              <p className="text-sm font-semibold text-yellow-600">65% CPU Usage</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Alerts</p>
              <p className="text-sm font-semibold text-destructive">{systemAlerts.length} pending</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* KPI Cards */}
      <div className="grid-cards">
        <StatsCard
          title="Total Users"
          value="9,275"
          change="+12% from last month"
          changeType="positive"
          icon={Users} />
        <StatsCard
          title="Active Students"
          value="8,420"
          change="+156 this week"
          changeType="positive"
          icon={GraduationCap} />
        <StatsCard
          title="Campuses"
          value="4"
          change="All operational"
          changeType="neutral"
          icon={Building2} />
        <StatsCard
          title="Pending Approvals"
          value="23"
          change="4 urgent"
          changeType="negative"
          icon={Clock} />
      </div>
      {/* Secondary KPIs */}
      <div className="grid-cards">
        <StatsCard
          title="Active Accounts"
          value="8,420"
          change="90.8% of total"
          changeType="positive"
          icon={UserCheck}
          iconColor="text-green-600" />
        <StatsCard
          title="Inactive Accounts"
          value="650"
          change="Dormant > 30 days"
          changeType="neutral"
          icon={UserX}
          iconColor="text-yellow-600" />
        <StatsCard
          title="Suspended"
          value="85"
          change="Requires review"
          changeType="negative"
          icon={Shield}
          iconColor="text-destructive" />
        <StatsCard
          title="Fee Collection"
          value="KES 107M"
          change="+18% this month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-green-600" />
      </div>
      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AreaChartCard
          title="Enrollment Trend"
          data={enrollmentData}
          dataKey="students"
          xAxisKey="month" />
        <PieChartCard title="User Distribution" data={userDistribution} />
        <PieChartCard title="Account Status" data={accountStatus} />
      </div>
      {/* Tabbed Content */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="campuses">Multi-Campus</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="approvals">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Pending Approvals</CardTitle>
                <Badge variant="secondary">{pendingApprovals.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={approvalColumns}
                data={pendingApprovals}
                searchPlaceholder="Search approvals..."
                pageSize={5} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">User Management</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    exportToCSV({ data: allUsers, filename: 'users-list' });
                  }}>Export</Button>
                  <Button size="sm" onClick={() => navigate('/users')}>Add User</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={userColumns}
                data={allUsers}
                searchPlaceholder="Search users..."
                pageSize={5}
                exportable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="campuses">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Multi-Campus Comparison</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/campuses')}>View Details</Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={campusColumns}
                data={campusComparison}
                searchable={false}
                pageSize={5} />
              <div className="mt-4">
                <BarChartCard
                  title="Campus Enrollment & Revenue"
                  data={campusComparison}
                  dataKeys={['enrolled']}
                  xAxisKey="campus" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Real-Time System Alerts
                </CardTitle>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemAlerts.map((alert) =>
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${alert.type === 'error' ? 'bg-destructive/5 border-destructive/20' :
                    alert.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                      'bg-primary/5 border-primary/20'}`
                  }>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${alert.type === 'error' ? 'text-destructive' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                      'text-primary'}`
                  } />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => toast.success('Alert Resolved', { description: `${alert.title} has been marked as resolved` })}>
                    Resolve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Audit Logs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Recent Audit Logs</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/audit-logs')}>View All Logs</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAuditLogs.map((log) =>
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' :
                    log.status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'}`
                  } />
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.user} • {log.ip}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
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
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/users')}>
              <UserCheck className="h-5 w-5" />
              <span className="text-xs">Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/campuses')}>
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Manage Campuses</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/audit-logs')}>
              <Shield className="h-5 w-5" />
              <span className="text-xs">Audit Logs</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/reports')}>
              <Download className="h-5 w-5" />
              <span className="text-xs">Reports</span>
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
        variant={confirmConfig?.variant}
        onConfirm={confirmConfig?.onConfirm}
      />
    </div>);
}