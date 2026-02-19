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
import { useState } from 'react';
import { BankReconciliationModal } from '@/components/modals';
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
// Mock data for finance dashboard
const collectionTrend = [
  { month: 'Jan', amount: 4500000, target: 5000000 },
  { month: 'Feb', amount: 5200000, target: 5000000 },
  { month: 'Mar', amount: 4800000, target: 5000000 },
  { month: 'Apr', amount: 6100000, target: 6000000 },
  { month: 'May', amount: 5800000, target: 6000000 },
  { month: 'Jun', amount: 7200000, target: 7000000 }];
const dailyCollection = [
  { day: 'Mon', amount: 450000 },
  { day: 'Tue', amount: 380000 },
  { day: 'Wed', amount: 520000 },
  { day: 'Thu', amount: 290000 },
  { day: 'Fri', amount: 610000 },
  { day: 'Sat', amount: 180000 },
  { day: 'Sun', amount: 95000 }];
const paymentMethodData = [
  { name: 'M-Pesa', value: 65 },
  { name: 'Bank Transfer', value: 25 },
  { name: 'Cash', value: 7 },
  { name: 'Card', value: 3 }];
const feeCollectionByFaculty = [
  { faculty: 'Engineering', collected: 12500000, outstanding: 3200000 },
  { faculty: 'Business', collected: 9800000, outstanding: 2100000 },
  { faculty: 'Health Sciences', collected: 8200000, outstanding: 1800000 },
  { faculty: 'Arts', collected: 5600000, outstanding: 1100000 },
  { faculty: 'Science', collected: 7400000, outstanding: 1500000 }];
const recentTransactions = [
  { id: 1, student: 'Faith Achieng', regNo: 'CS/2023/045', amount: 45000, method: 'M-Pesa', transRef: 'QKL2X4Y8N', status: 'Success', time: '5 min ago' },
  { id: 2, student: 'Peter Kamau', regNo: 'ENG/2023/012', amount: 32000, method: 'M-Pesa', transRef: 'RHJ7K9M2P', status: 'Pending', time: '12 min ago' },
  { id: 3, student: 'Grace Wanjiku', regNo: 'BUS/2024/089', amount: 28000, method: 'Bank', transRef: 'BNK89012345', status: 'Success', time: '25 min ago' },
  { id: 4, student: 'John Mwangi', regNo: 'MED/2023/056', amount: 55000, method: 'M-Pesa', transRef: 'PLM3N5T7X', status: 'Failed', time: '1 hour ago' },
  { id: 5, student: 'Susan Njeri', regNo: 'CS/2024/023', amount: 18000, method: 'M-Pesa', transRef: 'VBN4R6W9K', status: 'Success', time: '2 hours ago' },
  { id: 6, student: 'James Ochieng', regNo: 'ENG/2024/078', amount: 42000, method: 'Card', transRef: 'CRD56789012', status: 'Success', time: '3 hours ago' }];
const mpesaTransactions = [
  { id: 1, phone: '0712***890', amount: 45000, transRef: 'QKL2X4Y8N', status: 'Confirmed', timestamp: '2024-01-15 14:32:15' },
  { id: 2, phone: '0723***456', amount: 32000, transRef: 'RHJ7K9M2P', status: 'Pending Callback', timestamp: '2024-01-15 14:25:00' },
  { id: 3, phone: '0701***234', amount: 55000, transRef: 'PLM3N5T7X', status: 'STK Failed', timestamp: '2024-01-15 13:45:22' },
  { id: 4, phone: '0745***678', amount: 28000, transRef: 'ABC1D2E3F', status: 'Confirmed', timestamp: '2024-01-15 13:30:00' },
  { id: 5, phone: '0733***901', amount: 38000, transRef: 'GHI4J5K6L', status: 'Timeout', timestamp: '2024-01-15 12:15:45' }];
const topDefaulters = [
  { id: 1, name: 'Kevin Ochieng', regNo: 'ENG/2022/034', balance: 125000, months: 6, program: 'Civil Engineering', lastPayment: '2023-08-15' },
  { id: 2, name: 'Mary Akinyi', regNo: 'BUS/2023/078', balance: 98000, months: 4, program: 'Business Admin', lastPayment: '2023-10-20' },
  { id: 3, name: 'David Muthoni', regNo: 'CS/2022/056', balance: 87000, months: 5, program: 'Computer Science', lastPayment: '2023-09-05' },
  { id: 4, name: 'Grace Njeri', regNo: 'MED/2021/012', balance: 156000, months: 8, program: 'Medicine', lastPayment: '2023-06-10' },
  { id: 5, name: 'Peter Kamau', regNo: 'ENG/2023/089', balance: 72000, months: 3, program: 'Electrical Eng.', lastPayment: '2023-11-25' }];
const partialPayments = [
  { id: 1, name: 'James Otieno', regNo: 'CS/2024/034', totalFee: 120000, paid: 75000, balance: 45000, percentage: 62.5 },
  { id: 2, name: 'Susan Wanjiku', regNo: 'BUS/2023/067', totalFee: 95000, paid: 48000, balance: 47000, percentage: 50.5 },
  { id: 3, name: 'John Mwangi', regNo: 'ENG/2024/012', totalFee: 135000, paid: 100000, balance: 35000, percentage: 74.1 },
  { id: 4, name: 'Mary Njeri', regNo: 'MED/2023/045', totalFee: 180000, paid: 90000, balance: 90000, percentage: 50.0 }];
const examClearance = [
  { id: 1, name: 'Faith Achieng', regNo: 'CS/2023/045', balance: 0, status: 'Cleared', clearanceDate: '2024-01-10' },
  { id: 2, name: 'Peter Kamau', regNo: 'ENG/2023/012', balance: 32000, status: 'Not Cleared', clearanceDate: null },
  { id: 3, name: 'Grace Wanjiku', regNo: 'BUS/2024/089', balance: 0, status: 'Cleared', clearanceDate: '2024-01-12' },
  { id: 4, name: 'John Mwangi', regNo: 'MED/2023/056', balance: 55000, status: 'Not Cleared', clearanceDate: null }];

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  const transactionColumns = [
    { key: 'student', label: 'Student', sortable: true },
    { key: 'regNo', label: 'Reg No' },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => `KES ${value.toLocaleString()}`
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
      render: (value) => `KES ${value.toLocaleString()}`
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
        <Button size="sm" variant="outline" className="h-7" onClick={() => toast.info('Retrying Transaction', { description: `Retrying ${row.transRef}...` })}>
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
      render: (value) => <span className="font-medium text-destructive">KES {value.toLocaleString()}</span>
    },
    { key: 'months', label: 'Months Overdue', sortable: true },
    { key: 'lastPayment', label: 'Last Payment' },
    {
      key: 'action',
      label: '',
      render: (_, row) =>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.success('Reminder Sent', { description: `Payment reminder sent to ${row.name}` })}>
            <Send className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info('View Details', { description: `Viewing payment history for ${row.name}` })}>
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
      render: (value) => value > 0 ? `KES ${value.toLocaleString()}` : '-'
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
  const totalCollected = 34500000;
  const totalOutstanding = 8200000;
  const todayCollection = 1250000;
  const pendingTransactions = mpesaTransactions.filter((t) => t.status !== 'Confirmed').length;
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
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="h1-page">Finance Dashboard</h1>
          <p className="body-md text-muted-foreground">Fee collection and financial monitoring</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => {
            toast.success('Sync Started', { description: 'Syncing M-Pesa transactions...' });
            setTimeout(() => toast.success('Sync Complete', { description: 'All transactions synced' }), 1500);
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync M-Pesa
          </Button>
          <Button size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      {/* Real-Time Status */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">M-Pesa Status</p>
              <p className="text-sm font-semibold text-green-600">Online & Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today's Collection</p>
              <p className="text-sm font-semibold">KES {(todayCollection / 1000000).toFixed(2)}M</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Callbacks</p>
              <p className="text-sm font-semibold text-yellow-600">{pendingTransactions} transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Failed Today</p>
              <p className="text-sm font-semibold text-destructive">3 transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* KPI Cards */}
      <div className="grid-cards">
        <StatsCard
          title="Total Collected (YTD)"
          value={`KES ${(totalCollected / 1000000).toFixed(1)}M`}
          change="+18% from last year"
          changeType="positive"
          icon={Wallet} />
        <StatsCard
          title="Outstanding Fees"
          value={`KES ${(totalOutstanding / 1000000).toFixed(1)}M`}
          change="1,245 students"
          changeType="negative"
          icon={CreditCard} />
        <StatsCard
          title="Today's Collection"
          value={`KES ${(todayCollection / 1000000).toFixed(2)}M`}
          change="89 transactions"
          changeType="positive"
          icon={TrendingUp} />
        <StatsCard
          title="Top Defaulters"
          value="156"
          change="> 3 months overdue"
          changeType="negative"
          icon={AlertTriangle} />
      </div>
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartCard
            title="Monthly Collection Trend (KES)"
            data={collectionTrend}
            dataKey="amount"
            xAxisKey="month" />
        </div>
        <PieChartCard title="Payment Methods (%)" data={paymentMethodData} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BarChartCard
          title="Daily Collection This Week (KES)"
          data={dailyCollection}
          dataKeys={['amount']}
          xAxisKey="day" />
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
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate('/payments')}>View All</Button>
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
                <Button variant="outline" size="sm" onClick={() => toast.info('Refreshing Status', { description: 'Checking M-Pesa callback status...' })}>
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
                <Button variant="outline" size="sm" onClick={() => toast.success('Sending Reminders', { description: 'Sending payment reminders to all defaulters...' })}>
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
                <Button variant="outline" size="sm" onClick={() => toast.success('Generating Report', { description: 'Clearance status report is being generated...' })}>Generate Report</Button>
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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Partial Payments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Partial Payment Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {partialPayments.map((student) =>
              <div key={student.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{student.name}</span>
                    <span className="text-muted-foreground ml-2">({student.regNo})</span>
                  </div>
                  <span className="text-muted-foreground">
                    KES {student.paid.toLocaleString()} / {student.totalFee.toLocaleString()}
                  </span>
                </div>
                <Progress value={student.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{student.percentage.toFixed(1)}% paid</span>
                  <span className="text-destructive">Balance: KES {student.balance.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Collection Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Collection Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total Collected</p>
                  <p className="text-xs text-muted-foreground">Year to date</p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-600">KES 34.5M</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Outstanding</p>
                  <p className="text-xs text-muted-foreground">All campuses</p>
                </div>
              </div>
              <p className="text-lg font-bold text-destructive">KES 8.2M</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Collection Rate</p>
                  <p className="text-xs text-muted-foreground">Target achievement</p>
                </div>
              </div>
              <p className="text-lg font-bold">80.8%</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">M-Pesa Transactions</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
              <p className="text-lg font-bold">2,345</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/payments')}>
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Initiate STK</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => toast.success('Sending', { description: 'Payment reminders being sent...' })}>
              <Send className="h-5 w-5" />
              <span className="text-xs">Send Reminders</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/payments')}>
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs">Exam Clearance</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/fee-structure')}>
              <FileText className="h-5 w-5" />
              <span className="text-xs">Fee Structure</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/finance-reports')}>
              <Download className="h-5 w-5" />
              <span className="text-xs">Export Reports</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setIsReconcileOpen(true)}>
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Bank Reconciliation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <BankReconciliationModal
        open={isReconcileOpen}
        onOpenChange={setIsReconcileOpen}
      />
    </div>);
}