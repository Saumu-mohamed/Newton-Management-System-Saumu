import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { AreaChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { exportToPDF } from '@/lib/export-utils';
import { BankReconciliationModal } from '@/components/modals';
import {
  getFinanceDashboard,
  retryMpesaTransaction,
  sendBulkPaymentReminders,
  sendPaymentReminder,
  syncMpesaTransactions
} from '@/services/financeDashboardService';
import {
  Wallet,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Smartphone,
  Building2,
  ArrowUpRight,
  Send,
  Eye,
  FileText,
  Activity
} from
  'lucide-react';


export default function FinanceDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalCollected = dashboardData?.totalCollected || 0;
  const totalOutstanding = dashboardData?.totalOutstanding || 0;
  const todayCollection = dashboardData?.todayCollection || 0;
  const recentTransactions = dashboardData?.recentTransactions || [];
  const mpesaTransactions = dashboardData?.mpesaTransactions || [];
  const paymentMethodData = dashboardData?.paymentMethods || [];
  const feeCollectionByFaculty = dashboardData?.feeCollectionByFaculty || [];
  const collectionTrend = dashboardData?.collectionTrend || [];
  const topDefaulters = dashboardData?.topDefaulters || [];
  const examClearance = dashboardData?.examClearance || [];
  const partialPayments = dashboardData?.partialPayments || [];
  const pendingTransactions = dashboardData?.pendingTransactions || mpesaTransactions.filter((t) => t.status !== 'Confirmed').length;
  const failedTodayCount = dashboardData?.failedTodayCount || 0;
  const overdueStudents = dashboardData?.overdueStudents || topDefaulters.length;
  const collectionRate = dashboardData?.collectionRate || 0;
  const mpesaStatusLabel = pendingTransactions > 0 ? `${pendingTransactions} transactions pending callback` : 'All tracked transactions up to date';
  const collectedChange = collectionRate > 0 ? `${collectionRate}% collection rate from backend data` : 'No collection rate returned';
  const defaulterChange = topDefaulters.length > 0 ? `${topDefaulters.length} defaulters returned by backend` : 'No defaulters returned';

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getFinanceDashboard();
      setDashboardData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      setError(error?.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const navigate = useNavigate();
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  const runAction = async (action, successTitle) => {
    try {
      setActionLoading(true);
      const response = await action();
      toast.success(successTitle, {
        description: response?.message
      });
      await fetchData();
    } catch (actionError) {
      toast.error('Action Failed', {
        description: actionError?.response?.data?.message || 'The action could not be completed.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const transactionColumns = [
    { key: 'student', label: 'Student', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => `KES ${(value || 0).toLocaleString()}`
    },
    { key: 'method', label: 'Method' },
    { key: 'transRef', label: 'Transaction Ref' },
    {
      key: 'status',
      label: 'Status',
      render: (value) =>
        <div className="flex items-center gap-1">
          {value === 'Success' && <CheckCircle className="h-3 w-3 text-green-500" />}
          {value === 'Pending' && <Clock className="h-3 w-3 text-yellow-500" />}
          {value === 'Failed' && <XCircle className="h-3 w-3 text-red-500" />}
          <span className={
            value === 'Success' ? 'text-green-600' :
              value === 'Failed' ? 'text-destructive' :
                'text-yellow-600'
          }>{value}</span>
        </div>
    },
    { key: 'time', label: 'Time' }];

  const mpesaColumns = [
    { key: 'phone', label: 'Phone Number' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `KES ${(value || 0).toLocaleString()}`
    },
    { key: 'transRef', label: 'M-Pesa Ref' },
    {
      key: 'status',
      label: 'Status',
      render: (value) =>
        <Badge variant={
          value === 'Confirmed' ? 'default' :
            value === 'Pending Callback' ? 'secondary' :
              'destructive'
        }>
          {value}
        </Badge>
    },
    { key: 'timestamp', label: 'Timestamp' },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        row.status !== 'Confirmed' &&
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          disabled={actionLoading}
          onClick={() => runAction(() => retryMpesaTransaction(row.id), 'Retry Queued')}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
    }];

  const defaulterColumns = [
    { key: 'name', label: 'Student', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    { key: 'program', label: 'Program' },
    {
      key: 'balance',
      label: 'Balance',
      sortable: true,
      render: (value) => <span className="font-medium text-destructive">KES {(value || 0).toLocaleString()}</span>
    },
    { key: 'months', label: 'Months Overdue', sortable: true },
    { key: 'lastPayment', label: 'Last Payment' },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            disabled={actionLoading}
            onClick={() => runAction(() => sendPaymentReminder(row.id), 'Reminder Sent')}
          >
            <Send className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/payments')}>
            <Eye className="h-3 w-3" />
          </Button>
        </div>
    }];

  const clearanceColumns = [
    { key: 'name', label: 'Student', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    {
      key: 'balance',
      label: 'Balance',
      render: (value) => value > 0 ? `KES ${(value || 0).toLocaleString()}` : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) =>
        <Badge variant={value === 'Cleared' ? 'default' : 'destructive'}>
          {value === 'Cleared' && <CheckCircle className="h-3 w-3 mr-1" />}
          {value === 'Not Cleared' && <XCircle className="h-3 w-3 mr-1" />}
          {value}
        </Badge>
    },
    { key: 'clearanceDate', label: 'Clearance Date', render: (value) => value || '-' }];

  const handleExportReport = () => {
    exportToPDF({
      data: recentTransactions,
      filename: 'finance-report',
      title: 'Financial Report',
      columns: [
        { key: 'student', label: 'Student' },
        { key: 'regNo', label: 'Reg No' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method' },
        { key: 'status', label: 'Status' }]
    });
  };
  return (
    <div>
      <div className="space-y-8 w-full animate-in fade-in duration-700">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="text-center text-destructive">{error}</div>
        )}
        {!loading && !error &&
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
            <div>
              <h1 className="h1-page mb-1">Finance Dashboard</h1>
              <p className="body-md text-muted-foreground">Fee collection and real-time financial monitoring</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="outline" className="rounded-xl border-border/40 hover:bg-muted/50" onClick={() => {
                runAction(() => syncMpesaTransactions(), 'Sync Complete');
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync M-Pesa
              </Button>
              <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Monthly Report
              </Button>
            </div>
          </div>
        };

        {/* Real-Time Status */}
        {
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="border-none shadow-premium bg-green-500/5 group hover:bg-green-500/10 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-lg shadow-green-500/10 group-hover:scale-110 transition-transform">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-green-600/70">M-Pesa Status</p>
                  <p className="text-sm font-bold text-green-600">{mpesaStatusLabel}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-premium bg-primary/5 group hover:bg-primary/10 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Today's Collection</p>
                  <p className="text-sm font-bold">KES {(todayCollection / 1000000).toFixed(2)}M</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-premium bg-yellow-500/5 group hover:bg-yellow-500/10 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-lg shadow-yellow-500/10 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600/70">Pending</p>
                  <p className="text-sm font-bold text-yellow-600">{pendingTransactions} trans</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-premium bg-destructive/5 group hover:bg-destructive/10 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-lg shadow-destructive/10 group-hover:scale-110 transition-transform">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-destructive/70">Failed Today</p>
                  <p className="text-sm font-bold text-destructive">{failedTodayCount} trans</p>
                </div>
              </CardContent>
            </Card>
          </div>
        }
        {/* KPI Cards */}
        <div className="grid-cards">
          <StatsCard
            title="Total Collected (YTD)"
            value={`KES ${(totalCollected / 1000000).toFixed(1)}M`}
            change={collectedChange}
            changeType="positive"
            icon={Wallet} />
          <StatsCard
            title="Outstanding Fees"
            value={`KES ${(totalOutstanding / 1000000).toFixed(1)}M`}
            change={`${overdueStudents.toLocaleString()} students`}
            changeType="negative"
            icon={CreditCard} />
          <StatsCard
            title="Today's Collection"
            value={`KES ${(todayCollection / 1000000).toFixed(2)}M`}
            change={`${recentTransactions.length} recent transactions`}
            changeType="positive"
            icon={TrendingUp} />
          <StatsCard
            title="Top Defaulters"
            value={topDefaulters.length.toLocaleString()}
            change={defaulterChange}
            changeType="negative"
            icon={AlertTriangle} />
        </div>
        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {collectionTrend.length > 0 && (
              <AreaChartCard
                title="Monthly Collection Trend (KES)"
                data={collectionTrend}
                dataKey="amount"
                xAxisKey="month" />
            )}
          </div>
          {paymentMethodData.length > 0 && (
            <PieChartCard title="Payment Methods (%)"
              data={paymentMethodData.map(p => ({ name: p.method || p.name, value: p.value }))} />
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <BarChartCard
            title="Daily Collection This Week (KES)"
            data={collectionTrend}
            dataKeys={['amount']}
            xAxisKey="month" />
          <BarChartCard
            title="Collection by Faculty (KES)"
            data={feeCollectionByFaculty}
            dataKeys={['collected', 'outstanding']}
            xAxisKey="faculty" />
        </div>
        {/* Tabbed Content */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="mpesa">M-Pesa Tracking</TabsTrigger>
            <TabsTrigger value="defaulters">Top Defaulters</TabsTrigger>
            <TabsTrigger value="clearance">Exam Clearance</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Card className="border-none shadow-premium">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time payment activity across all channels</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs" onClick={() => navigate('/payments')}>VIEW ALL</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={transactionColumns}
                  data={recentTransactions}
                  searchPlaceholder="Search transactions..."
                  exportable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mpesa">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    M-Pesa STK Push Tracking
                  </CardTitle>
                  <Button variant="outline" size="sm" disabled={actionLoading} onClick={() => runAction(() => syncMpesaTransactions(), 'Status Refreshed')}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={mpesaColumns}
                  data={mpesaTransactions}
                  searchPlaceholder="Search by phone or reference..."
                  pageSize={5} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="defaulters">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Top Defaulters (3+ Months Overdue)
                  </CardTitle>
                  <Button variant="outline" size="sm" disabled={actionLoading} onClick={() => runAction(() => sendBulkPaymentReminders(), 'Bulk Reminders Sent')}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Bulk Reminders
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={defaulterColumns}
                  data={topDefaulters}
                  searchPlaceholder="Search defaulters..."
                  pageSize={5}
                  exportable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="clearance">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Exam/Result Clearance Status</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportReport}>Export Report</Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={clearanceColumns}
                  data={examClearance}
                  searchPlaceholder="Search students..."
                  pageSize={5}
                  exportable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Partial Payments & Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Partial Payments */}
          <Card className="border-none shadow-premium">
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-lg font-bold">Partial Payment Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {partialPayments.map((student) =>
                <div key={student.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold truncate">{student.name}</span>
                      <span className="text-[10px] font-medium text-muted-foreground tracking-tight">{student.regNo}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-foreground">KES {student.paid.toLocaleString()}</span>
                      <span className="text-[10px] block font-medium text-muted-foreground uppercase">of {student.totalFee.toLocaleString()}</span>
                    </div>
                  </div>
                  <Progress value={student.percentage} className="h-2.5 shadow-inner bg-muted" />
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-primary tracking-tight">{student.percentage.toFixed(1)}% PAID</span>
                    <span className="text-destructive tracking-widest uppercase">OWES: KES {student.balance.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Collection Summary */}
          <Card className="border-none shadow-premium bg-linear-to-br from-card to-muted/30">
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-lg font-bold">Collection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-green-500/10 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Collected</p>
                    <p className="text-[10px] font-medium text-muted-foreground/60">Academic Year to Date</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-green-600 tracking-tighter">KES {(totalCollected / 1000000).toFixed(1)}M</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-destructive/10 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Outstanding</p>
                    <p className="text-[10px] font-medium text-muted-foreground/60">Across All Campuses</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-destructive tracking-tighter">KES {(totalOutstanding / 1000000).toFixed(1)}M</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-primary/10 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Collection Rate</p>
                    <p className="text-[10px] font-medium text-muted-foreground/60">Achievement vs Target</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-primary tracking-tighter">{collectionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="border-none shadow-premium bg-muted/30">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/payments')}>
                <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Initiate STK</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" disabled={actionLoading} onClick={() => runAction(() => sendBulkPaymentReminders(), 'Bulk Reminders Sent')}>
                <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Send Reminders</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/payments')}>
                <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Exam Clearance</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/fee-structure')}>
                <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Fee Structure</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => navigate('/finance-reports')}>
                <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Export Reports</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-3 rounded-2xl bg-white border-border/40 hover:border-primary/50 hover:bg-primary/5 group" onClick={() => setIsReconcileOpen(true)}>
                <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Bank Reconcile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        <BankReconciliationModal
          open={isReconcileOpen}
          onOpenChange={setIsReconcileOpen}
          onCompleted={fetchData}
        />

      </div>
    </div>
  );
}
