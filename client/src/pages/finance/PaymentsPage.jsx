import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, CheckCircle, XCircle, Clock, DollarSign, Users, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { printReceipt } from "@/lib/print-utils";
import { getPaymentsPageData, retryPaymentTransaction } from "@/services/financeDashboardService";

const paymentColumns = [
{ key: "id", label: "Payment ID" },
{ key: "student", label: "Student Name" },
{ key: "regNo", label: "Reg Number" },
{ key: "amount", label: "Amount (KES)" },
{ key: "method", label: "Payment Method" },
{ key: "reference", label: "Reference" },
{ key: "date", label: "Date" },
{ key: "status", label: "Status" }];
const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [date, setDate] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getPaymentsPageData({ search, status, method, date });
      setPayments(data.payments || []);
      setStats(data.stats || null);
      setError("");
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [search, status, method, date]);

  const statCards = [
    { title: "Today's Collection", value: `KES ${(stats?.todayCollection || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600", note: "Live from backend data" },
    { title: "Pending Payments", value: String(stats?.pendingPayments || 0), icon: Clock, color: "text-yellow-600", note: "Current pending transactions" },
    { title: "Failed Transactions", value: String(stats?.failedTransactions || 0), icon: XCircle, color: "text-red-600", note: "Current failed transactions" },
    { title: "Students Paid Today", value: String(stats?.studentsPaidToday || 0), icon: Users, color: "text-blue-600", note: "Unique students with payments today" }
  ];
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track and manage student fee payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() => {
              setIsExporting(true);
              exportToCSV({ data: payments, filename: 'payments', columns: paymentColumns });
              setIsExporting(false);
            }}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToPDF({ data: payments, filename: 'payments', columns: paymentColumns, title: 'Payment Transactions Report' })}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat) =>
        <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${stat.color}`}>{stat.note}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search by student name or reg no..." className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="w-[150px]" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
        </CardContent>
      </Card>
      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>All payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Amount (KES)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">Loading payments...</TableCell>
                </TableRow>
              )}
              {payments.map((payment) =>
              <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.paymentCode}</TableCell>
                  <TableCell>{payment.student}</TableCell>
                  <TableCell>{payment.regNo}</TableCell>
                  <TableCell className="font-semibold">{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="text-xs font-mono">{payment.reference}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        printReceipt({
                          receiptNumber: payment.paymentCode,
                          studentName: payment.student,
                          studentId: payment.regNo,
                          date: payment.date,
                          amount: payment.amount,
                          paymentMethod: payment.method,
                          reference: payment.reference,
                          description: 'Tuition Fee Payment'
                        });
                      }}>
                        <Printer className="w-4 h-4 mr-1" />
                        Receipt
                      </Button>
                      {payment.status === "failed" &&
                    <Button variant="ghost" size="sm" onClick={async () => {
                      try {
                        await retryPaymentTransaction(payment.id);
                        toast.success("Retry Queued", { description: `Retry queued for ${payment.paymentCode}.` });
                        loadPayments();
                      } catch (actionError) {
                        toast.error("Retry Failed", { description: actionError?.response?.data?.message || "Failed to retry transaction." });
                      }
                    }}>
                          Retry
                        </Button>
                    }
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">No payments returned by the backend.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);
};
export default PaymentsPage;
