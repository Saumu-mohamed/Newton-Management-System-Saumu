import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, Download, Filter, CheckCircle, XCircle, Clock, DollarSign, Users, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { printReceipt } from "@/lib/print-utils";
const paymentsData = [
{ id: "PAY001", student: "John Doe", regNo: "CS/2021/001", amount: 45000, method: "M-Pesa", status: "completed", date: "2024-01-15", reference: "MPE123456" },
{ id: "PAY002", student: "Jane Smith", regNo: "ENG/2021/002", amount: 35000, method: "Bank Transfer", status: "completed", date: "2024-01-14", reference: "BNK789012" },
{ id: "PAY003", student: "Mike Johnson", regNo: "BUS/2022/003", amount: 50000, method: "M-Pesa", status: "pending", date: "2024-01-13", reference: "MPE345678" },
{ id: "PAY004", student: "Sarah Wilson", regNo: "CS/2020/004", amount: 25000, method: "Cash", status: "completed", date: "2024-01-12", reference: "CSH901234" },
{ id: "PAY005", student: "Tom Brown", regNo: "ENG/2022/005", amount: 40000, method: "M-Pesa", status: "failed", date: "2024-01-11", reference: "MPE567890" },
{ id: "PAY006", student: "Emily Davis", regNo: "BUS/2021/006", amount: 55000, method: "Bank Transfer", status: "completed", date: "2024-01-10", reference: "BNK123789" }];
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
  const [payments] = useState(paymentsData);
  const [isExporting, setIsExporting] = useState(false);
  const stats = [
  { title: "Today's Collection", value: "KES 245,000", icon: DollarSign, trend: "+12%", color: "text-green-600" },
  { title: "Pending Payments", value: "15", icon: Clock, trend: "-5", color: "text-yellow-600" },
  { title: "Failed Transactions", value: "3", icon: XCircle, trend: "+1", color: "text-red-600" },
  { title: "Students Paid Today", value: "28", icon: Users, trend: "+8", color: "text-blue-600" }];
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
          <Button onClick={() => toast.info('Record Payment', { description: 'Opening payment recording form...' })}>
            <CreditCard className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) =>
        <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${stat.color}`}>{stat.trend} from yesterday</p>
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
                <Input placeholder="Search by student name or reg no..." className="pl-10" />
              </div>
            </div>
            <Select>
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
            <Select>
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
            <Input type="date" className="w-[150px]" />
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
              {payments.map((payment) =>
              <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
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
                          receiptNumber: payment.id,
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
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Retry Payment', { description: `Retrying ${payment.id}...` })}>
                          Retry
                        </Button>
                    }
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);
};
export default PaymentsPage;