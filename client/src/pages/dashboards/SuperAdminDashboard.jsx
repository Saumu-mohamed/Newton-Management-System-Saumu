import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
import { AreaChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ConfirmModal } from '@/components/modals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle,
  Clock,
  Download,
  Eye,
  GraduationCap,
  Key,
  Lock,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  Unlock,
  UserCheck,
  UserX,
  Users,
  Wifi,
  XCircle
} from 'lucide-react';
import {
  acknowledgeSuperAdminAlert,
  getSuperAdminDashboard,
  resetSuperAdminPassword,
  updateSuperAdminApproval,
  updateSuperAdminUserStatus
} from '@/services/superAdminDashboardService';

function EmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

const formatCurrencyShort = (value) => {
  if (!value) {
    return 'KES 0';
  }

  return value >= 1000000
    ? `KES ${(value / 1000000).toFixed(1)}M`
    : `KES ${value.toLocaleString()}`;
};

const humanizeRole = (role) => String(role || '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminDashboard();
      setDashboardData(data);
      setError('');
    } catch (fetchError) {
      console.error('Failed to load super admin dashboard:', fetchError);
      setError(fetchError?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const overview = dashboardData?.overview || {};
  const kpis = dashboardData?.kpis || {};
  const systemStatusCards = dashboardData?.systemStatusCards || {};
  const enrollmentData = dashboardData?.enrollmentData || [];
  const campusComparison = dashboardData?.campusComparison || [];
  const userDistribution = dashboardData?.userDistribution || [];
  const accountStatus = dashboardData?.accountStatus || [];
  const pendingApprovals = dashboardData?.pendingApprovals || [];
  const recentAuditLogs = dashboardData?.recentAuditLogs || [];
  const systemAlerts = dashboardData?.systemAlerts || [];
  const allUsers = dashboardData?.allUsers || [];

  const handleAction = (row, isApprove) => {
    setConfirmConfig({
      title: isApprove ? 'Confirm Approval' : 'Confirm Rejection',
      description: `Are you sure you want to ${isApprove ? 'approve' : 'reject'} the ${row.type} request from ${row.name}?`,
      confirmText: isApprove ? 'Approve' : 'Reject',
      variant: isApprove ? 'default' : 'destructive',
      onConfirm: async () => {
        const result = await updateSuperAdminApproval(row.id, isApprove ? 'approved' : 'rejected');
        await fetchDashboard();
        toast.success(isApprove ? 'Request Approved' : 'Request Rejected', {
          description: result.message
        });
      }
    });
    setIsConfirmOpen(true);
  };

  const handleResetPassword = async (row) => {
    try {
      const result = await resetSuperAdminPassword(row.id);
      toast.success('Password Reset Complete', {
        description: `${row.email} temporary password: ${result.temporaryPassword}`
      });
      await fetchDashboard();
    } catch (actionError) {
      toast.error('Password Reset Failed', {
        description: actionError?.response?.data?.message || 'Failed to reset password.'
      });
    }
  };

  const handleToggleUserStatus = async (row) => {
    try {
      const shouldActivate = row.status !== 'Active';
      const result = await updateSuperAdminUserStatus(row.id, shouldActivate);
      toast.success(shouldActivate ? 'Account Unblocked' : 'Account Blocked', {
        description: result.message
      });
      await fetchDashboard();
    } catch (actionError) {
      toast.error('Status Update Failed', {
        description: actionError?.response?.data?.message || 'Failed to update user status.'
      });
    }
  };

  const handleAcknowledgeAlert = async (alert) => {
    try {
      const result = await acknowledgeSuperAdminAlert(alert.id);
      toast.success('Alert Acknowledged', {
        description: result.message
      });
      await fetchDashboard();
    } catch (actionError) {
      toast.error('Acknowledge Failed', {
        description: actionError?.response?.data?.message || 'Failed to acknowledge alert.'
      });
    }
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
    }
  ];

  const campusColumns = [
    { key: 'campus', label: 'Campus', sortable: true },
    { key: 'enrolled', label: 'Students', sortable: true },
    { key: 'staff', label: 'Staff', sortable: true },
    {
      key: 'collected',
      label: 'Collected',
      render: (value) => formatCurrencyShort(value),
      sortable: true
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      render: (value) =>
        <span className="text-destructive font-medium">{formatCurrencyShort(value)}</span>,
      sortable: true
    }
  ];

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value) => humanizeRole(value)
    },
    { key: 'campus', label: 'Campus' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'lastLogin', label: 'Last Activity' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) =>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/profile')}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleResetPassword(row)}>
            <Key className="h-3 w-3" />
          </Button>
          {row.status === 'Active' ?
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleToggleUserStatus(row)}>
              <Lock className="h-3 w-3" />
            </Button> :
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => handleToggleUserStatus(row)}>
              <Unlock className="h-3 w-3" />
            </Button>
          }
        </div>
    }
  ];

  const handleExportReport = () => {
    exportToPDF({
      data: [
        { metric: 'Total Identities', value: kpis.totalIdentities || 0, status: overview.systemStatus || 'Operational' },
        { metric: 'Academic Population', value: kpis.academicPopulation || 0, status: `${kpis.readyForGraduation || 0} ready for grad` },
        { metric: 'Campuses', value: kpis.campusCount || 0, status: 'Live backend data' },
        { metric: 'Institutional Revenue', value: formatCurrencyShort(kpis.institutionalRevenue || 0), status: `${pendingApprovals.length} actions pending` }
      ],
      filename: 'system-report',
      title: 'System Report',
      columns: [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
        { key: 'status', label: 'Status' }
      ]
    });
  };

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="h1-page mb-1">{overview.title || 'Super Admin Dashboard'}</h1>
          <p className="body-md text-muted-foreground flex items-center gap-2">
            {overview.subtitle || 'System-Wide Monitoring & Governance'}
            <span className="w-1 h-1 rounded-full bg-border" />
            Global Instance Status: <span className="text-green-600 font-bold uppercase tracking-tighter">{overview.systemStatus || 'Operational'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="rounded-xl border-border/40 hover:bg-muted/50" onClick={fetchDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Status
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            System Audit Report
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="border-none shadow-premium">
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading super admin dashboard...
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

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-green-500/5 ring-1 ring-green-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-green-500/10">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-green-600/70 uppercase tracking-widest">Core Engine</p>
              <p className="text-sm font-black text-green-600 tracking-tight">{systemStatusCards.coreEngine || 'ONLINE'}</p>
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
              <p className="text-sm font-black text-primary tracking-tight">{systemStatusCards.activePulse || '0 USERS'}</p>
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
              <p className="text-sm font-black text-yellow-700 tracking-tight">{systemStatusCards.computeLoad || '0 QUEUED'}</p>
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
              <p className="text-sm font-black text-destructive tracking-tight">{systemStatusCards.securityAlerts || '0 URGENT'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Identities"
          value={(kpis.totalIdentities || 0).toLocaleString()}
          change="Live system total"
          changeType="positive"
          icon={Users} />
        <StatsCard
          title="Academic Population"
          value={(kpis.academicPopulation || 0).toLocaleString()}
          change={`${(kpis.readyForGraduation || 0).toLocaleString()} ready for grad`}
          changeType="positive"
          icon={GraduationCap} />
        <StatsCard
          title="Instance Clusters"
          value={(kpis.campusCount || 0).toLocaleString()}
          change="All nodes reporting"
          changeType="neutral"
          icon={Building2} />
        <StatsCard
          title="Action Pipeline"
          value={(kpis.actionPipeline || 0).toLocaleString()}
          change={`${(kpis.urgentActionCount || 0).toLocaleString()} urgent overrides`}
          changeType="negative"
          icon={Clock} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Accounts"
          value={(kpis.activeAccounts || 0).toLocaleString()}
          change="User identities marked active"
          changeType="positive"
          icon={UserCheck} />
        <StatsCard
          title="Dormant"
          value={(kpis.dormantAccounts || 0).toLocaleString()}
          change="First login still pending"
          changeType="neutral"
          icon={UserX} />
        <StatsCard
          title="Suspended"
          value={(kpis.suspendedAccounts || 0).toLocaleString()}
          change="Inactive user accounts"
          changeType="negative"
          icon={Shield} />
        <StatsCard
          title="Institutional Revenue"
          value={formatCurrencyShort(kpis.institutionalRevenue || 0)}
          change={`${formatCurrencyShort(kpis.totalOutstanding || 0)} outstanding`}
          changeType="positive"
          icon={TrendingUp} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AreaChartCard
          title="Campus Enrollment"
          data={enrollmentData}
          dataKey="students"
          xAxisKey="month" />
        <PieChartCard title="Role Distribution" data={userDistribution} />
        <PieChartCard title="Security Status" data={accountStatus} />
      </div>

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
                  <Button variant="outline" className="rounded-xl h-9 font-bold text-xs" onClick={() => exportToCSV({ data: allUsers, filename: 'users-list' })}>EXPORT LIST</Button>
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
              {campusComparison.length > 0 ? (
                <>
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
                </>
              ) : (
                <EmptyState message="No campus comparison data is available from the backend yet." />
              )}
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
              {systemAlerts.length > 0 ? systemAlerts.map((alert) =>
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
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] font-black uppercase tracking-widest hover:bg-white" onClick={() => handleAcknowledgeAlert(alert)}>
                        ACKNOWLEDGE
                      </Button>
                    </div>
                  </div>
                </div>
              ) : <EmptyState message="No active system alerts were returned by the backend." />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-none shadow-premium bg-linear-to-b from-card to-muted/20">
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Global Audit Trail</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Comprehensive immutable log of recent system activities</p>
            </div>
            <Button variant="outline" className="rounded-xl h-8 font-bold text-[10px]" onClick={() => navigate('/audit-logs')}>EXTENDED LOGS</Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentAuditLogs.length > 0 ? (
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
          ) : (
            <EmptyState message="No recent audit activity was found in the backend." />
          )}
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
    </div>
  );
}
