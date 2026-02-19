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
import { useState } from 'react';
const auditLogs = [
{ id: 1, action: 'Login', user: 'admin@cms.edu', role: 'Super Admin', ip: '192.168.1.45', time: '2024-01-15 10:23:45', status: 'success', details: 'Successful login from Nairobi' },
{ id: 2, action: 'Password Reset', user: 'student@cms.edu', role: 'Student', ip: '192.168.1.102', time: '2024-01-15 10:15:30', status: 'success', details: 'Password changed via email verification' },
{ id: 3, action: 'Failed Login', user: 'unknown@test.com', role: 'Unknown', ip: '45.23.112.8', time: '2024-01-15 09:45:12', status: 'failed', details: 'Invalid credentials - 3rd attempt' },
{ id: 4, action: 'Role Change', user: 'lecturer@cms.edu', role: 'Lecturer', ip: '192.168.1.78', time: '2024-01-15 09:30:00', status: 'success', details: 'Role upgraded to Senior Lecturer' },
{ id: 5, action: 'Account Blocked', user: 'suspicious@mail.com', role: 'Unknown', ip: '89.45.223.1', time: '2024-01-15 08:15:22', status: 'warning', details: 'Multiple failed login attempts' },
{ id: 6, action: 'Payment', user: 'finance@cms.edu', role: 'Finance Officer', ip: '192.168.1.56', time: '2024-01-15 08:00:00', status: 'success', details: 'Bulk payment reconciliation completed' },
{ id: 7, action: 'User Created', user: 'registrar@cms.edu', role: 'Registrar', ip: '192.168.1.34', time: '2024-01-14 16:45:00', status: 'success', details: 'New student account created' },
{ id: 8, action: 'Logout', user: 'college@cms.edu', role: 'College Admin', ip: '192.168.1.89', time: '2024-01-14 16:30:00', status: 'success', details: 'Session ended normally' },
{ id: 9, action: 'Data Export', user: 'admin@cms.edu', role: 'Super Admin', ip: '192.168.1.45', time: '2024-01-14 15:00:00', status: 'success', details: 'Exported student records to Excel' },
{ id: 10, action: 'Settings Change', user: 'admin@cms.edu', role: 'Super Admin', ip: '192.168.1.45', time: '2024-01-14 14:30:00', status: 'success', details: 'Updated fee structure settings' }];
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
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const filteredLogs = auditLogs.filter((log) => {
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
        <Button variant="outline" size="sm" onClick={() => toast.success('Export Started', { description: 'Exporting audit logs...' })}>
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
                <p className="text-2xl font-bold">{auditLogs.length}</p>
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
                <p className="text-2xl font-bold">{auditLogs.filter((l) => l.status === 'success').length}</p>
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
                <p className="text-2xl font-bold">{auditLogs.filter((l) => l.status === 'failed').length}</p>
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
                <p className="text-2xl font-bold">{auditLogs.filter((l) => l.status === 'warning').length}</p>
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
          <DataTable
            columns={logColumns}
            data={filteredLogs}
            searchPlaceholder="Search logs..."
            pageSize={10}
            exportable />
        </CardContent>
      </Card>
    </div>);
}