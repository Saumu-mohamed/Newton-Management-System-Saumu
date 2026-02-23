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
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">Super Admin Dashboard</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            System-Wide Monitoring & Governance
            <span className="w-1 h-1 rounded-full bg-border" />
            Global Instance Status: <span className="text-green-600 font-bold uppercase tracking-tighter">Operational</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="rounded-xl border-border/40 hover:bg-muted/50" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Status
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            System Audit Report
          </Button>
        </div>
      </div>
      {/* Real-Time System Status */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-green-500/5 ring-1 ring-green-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-green-500/10">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-green-600/70 uppercase tracking-widest">Core Engine</p>
              <p className="text-sm font-black text-green-600 tracking-tight">ONLINE</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 ring-1 ring-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-primary/10">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Active Pulse</p>
              <p className="text-sm font-black text-primary tracking-tight">1,245 USERS</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-yellow-500/5 ring-1 ring-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-yellow-500/10">
              <Activity className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-yellow-600/70 uppercase tracking-widest">Compute Load</p>
              <p className="text-sm font-black text-yellow-700 tracking-tight">65% AVG</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-destructive/5 ring-1 ring-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-[10px] font-black text-destructive/70 uppercase tracking-widest">Sec. Alerts</p>
              <p className="text-sm font-black text-destructive tracking-tight">{systemAlerts.length} URGENT</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Identities"
          value="9,275"
          change="+12% YoY growth"
          changeType="positive"
          icon={Users} />
        <StatsCard
          title="Academic Population"
          value="8,420"
          change="892 ready for grad"
          changeType="positive"
          icon={GraduationCap} />
        <StatsCard
          title="Instance Clusters"
          value="4"
          change="All Nodes Healthy"
          changeType="neutral"
          icon={Building2} />
        <StatsCard
          title="Action Pipeline"
          value="23"
          change="4 urgent overrides"
          changeType="negative"
          icon={Clock} />
      </div>
      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Accounts"
          value="8,420"
          change="90.8% Reach"
          changeType="positive"
          icon={UserCheck} />
        <StatsCard
          title="Dormant"
          value="650"
          change="> 30 days"
          changeType="neutral"
          icon={UserX} />
        <StatsCard
          title="Suspended"
          value="85"
          change="Policy violations"
          changeType="negative"
          icon={Shield} />
        <StatsCard
          title="Institutional Revenue"
          value="KES 107M"
          change="+18% variance"
          changeType="positive"
          icon={TrendingUp} />
      </div>
      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AreaChartCard
          title="Campus Enrollment"
          data={enrollmentData}
          dataKey="students"
          xAxisKey="month" />
        <PieChartCard title="Role Distribution" data={userDistribution} />
        <PieChartCard title="Security Status" data={accountStatus} />
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
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Pending Administrative Actions</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Requests requiring super admin authorization</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-bold">{pendingApprovals.length} ACTION REQUIRED</Badge>
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
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">User Identity Management</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Control access and roles across the entire institution</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl h-9 font-bold text-xs" onClick={() => {
                    exportToCSV({ data: allUsers, filename: 'users-list' });
                  }}>EXPORT LIST</Button>
                  <Button className="rounded-xl h-9 font-bold text-xs shadow-lg shadow-primary/20" onClick={() => navigate('/users')}>CREATE ACCOUNT</Button>
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
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Multi-Campus Ecosystem</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Comparative analytics across all institutional branches</p>
                </div>
                <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/5 h-8" onClick={() => navigate('/campuses')}>VIEW FULL REPORT</Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={campusColumns}
                data={campusComparison}
                searchable={false}
                pageSize={4} />
              <div className="mt-8 pt-6 border-t border-border/40">
                <BarChartCard
                  title="Branch Enrollment Matrix"
                  data={campusComparison}
                  dataKeys={['enrolled']}
                  xAxisKey="campus" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts">
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Instance Health Monitoring
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time alerts and system events pipeline</p>
                </div>
                <Badge variant="outline" className="font-bold border-green-500/20 bg-green-500/5 text-green-600">
                  <Activity className="h-3 w-3 mr-1.5 animate-pulse" />
                  LIVE TRAFFIC
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemAlerts.map((alert) =>
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${alert.type === 'error' ? 'bg-destructive/5 border-destructive/10' :
                    alert.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/10' :
                      'bg-primary/5 border-primary/10'}`
                  }>
                  <div className={`p-2 rounded-xl bg-white shadow-sm ring-1 ring-inset ${alert.type === 'error' ? 'ring-destructive/20' : alert.type === 'warning' ? 'ring-yellow-500/20' : 'ring-primary/20'}`}>
                    <AlertTriangle className={`h-4 w-4 ${alert.type === 'error' ? 'text-destructive' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                        'text-primary'}`
                    } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold tracking-tight">{alert.title}</p>
                      <span className="text-[10px] font-black text-muted-foreground uppercase">{alert.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] font-black uppercase tracking-widest hover:bg-white" onClick={() => toast.success('Alert Resolved', { description: `${alert.title} has been marked as resolved` })}>
                        ACKNOWLEDGE
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Audit Logs */}
      <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Global Audit Trail</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Comprehensive immutable log of all system activities</p>
            </div>
            <Button variant="outline" className="rounded-xl h-8 font-bold text-[10px]" onClick={() => navigate('/audit-logs')}>EXTENDED LOGS</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAuditLogs.map((log) =>
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-transparent hover:border-border/40 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-8 rounded-full ${log.status === 'success' ? 'bg-green-500' :
                    log.status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'}`
                  } />
                  <div>
                    <p className="text-sm font-bold tracking-tight">{log.action}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{log.user} • {log.ip}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-primary uppercase">{log.time}</p>
                  <p className="text-[10px] font-medium text-muted-foreground leading-tight max-w-37.5 truncate">{log.details}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-premium">
        <CardHeader className="pb-4 pt-6">
          <CardTitle className="text-lg font-bold">Administrative Command Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Manage Users', icon: UserCheck, path: '/users' },
              { label: 'Manage Campuses', icon: Building2, path: '/campuses' },
              { label: 'Global Audit', icon: Shield, path: '/audit-logs' },
              { label: 'System Reports', icon: Download, path: '/reports' }
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-6 flex-col gap-3 rounded-2xl border-border/40 hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                onClick={() => navigate(action.path)}>
                <div className="p-3 rounded-xl bg-muted group-hover:bg-white shadow-sm transition-colors">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
              </Button>
            ))}
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