import { DataTable } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ClipboardList,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  Key,
  CreditCard,
  UserPlus,
  Shield } from
'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { useEffect, useState } from 'react';
import { exportToCSV } from '@/lib/export-utils';
import { getAuditLogs } from '@/services/adminUtilityService';
const getActionIcon = (action) => {
  switch (action) {
    case 'Login':return <LogIn className="h-3 w-3" />;
    case 'Logout':return <LogOut className="h-3 w-3" />;
    case 'Password Reset':return <Key className="h-3 w-3" />;
    case 'Payment':return <CreditCard className="h-3 w-3" />;
    case 'User Created':return <UserPlus className="h-3 w-3" />;
    case 'Account Blocked':return <Shield className="h-3 w-3" />;
    default:return <ClipboardList className="h-3 w-3" />;
  }
};
const logColumns = [
{
  key: 'action',
  label: 'Action',
  render: (value) =>
  <div className="flex items-center gap-2">
        {getActionIcon(value)}
        <span>{value}</span>
      </div>
},
{ key: 'user', label: 'User', sortable: true },
{ key: 'role', label: 'Role' },
{ key: 'ip', label: 'IP Address' },
{ key: 'time', label: 'Timestamp', sortable: true },
{
  key: 'status',
  label: 'Status',
  render: (value) =>
  <Badge variant={value === 'success' ? 'default' : value === 'failed' ? 'destructive' : 'secondary'} className="gap-1">
        {value === 'success' && <CheckCircle className="h-3 w-3" />}
        {value === 'failed' && <XCircle className="h-3 w-3" />}
        {value === 'warning' && <AlertTriangle className="h-3 w-3" />}
        {value}
      </Badge>
},
{ key: 'details', label: 'Details' }];
export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, warning: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await getAuditLogs();
        setLogs(data.logs || []);
        setStats(data.stats || { total: 0, success: 0, failed: 0, warning: 0 });
      } catch (error) {
        toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load audit logs.' });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    return true;
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and security events</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCSV({ data: filteredLogs, filename: 'audit-logs' })}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.success}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.warning}</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="Login">Login</SelectItem>
                <SelectItem value="Logout">Logout</SelectItem>
                <SelectItem value="Password Reset">Password Reset</SelectItem>
                <SelectItem value="Payment">Payment</SelectItem>
                <SelectItem value="User Created">User Created</SelectItem>
                <SelectItem value="Account Blocked">Account Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Logs Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="py-8 text-sm text-muted-foreground">Loading audit logs...</div> :
          <DataTable
            columns={logColumns}
            data={filteredLogs}
            searchPlaceholder="Search logs..."
            pageSize={10}
            exportable />
          }
        </CardContent>
      </Card>
    </div>);
}
