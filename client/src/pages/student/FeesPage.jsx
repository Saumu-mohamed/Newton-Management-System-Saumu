import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Wallet, CreditCard, CheckCircle, Clock, AlertTriangle, Phone, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { printFeeStatement, printReceipt } from "@/lib/print-utils";
import { getStudentDashboard, initiateStudentPayment } from "@/services/studentDashboardService";

const FeesPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getStudentDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load fee statement."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const profile = dashboard?.profile || {};
  const summary = dashboard?.summary || {};
  const paymentHistory = dashboard?.paymentHistory || [];
  const totalFees = Number(summary.totalFees || 0);
  const totalPaid = Number(summary.paidAmount || 0);
  const balance = Number(summary.feeBalance || 0);
  const percentagePaid = Number(summary.feePercentage || 0);

  const feeBreakdown = useMemo(() => ([
  { item: "Tuition Fee", amount: Math.round(totalFees * 0.84), paid: Math.min(totalPaid, Math.round(totalFees * 0.84)) },
  { item: "Library Fee", amount: Math.round(totalFees * 0.04), paid: Math.min(Math.max(totalPaid - Math.round(totalFees * 0.84), 0), Math.round(totalFees * 0.04)) },
  { item: "Examination Fee", amount: Math.round(totalFees * 0.07), paid: Math.min(Math.max(totalPaid - Math.round(totalFees * 0.88), 0), Math.round(totalFees * 0.07)) },
  { item: "Activity Fee", amount: Math.max(totalFees - Math.round(totalFees * 0.95), 0), paid: Math.max(totalPaid - Math.round(totalFees * 0.95), 0) }]), [totalFees, totalPaid]);

  const handlePayment = async () => {
    try {
      setPaying(true);
      const response = await initiateStudentPayment({ amount: balance });
      toast.success("Payment Initiated", {
        description: response?.message || "Payment request created successfully."
      });
      await loadDashboard();
    } catch (error) {
      toast.error("Payment Failed", {
        description: error?.response?.data?.message || "Failed to initiate payment."
      });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Statement</h1>
          <p className="text-muted-foreground">View your fee balance and payment history</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              printFeeStatement({
                studentName: profile.name || 'Student',
                studentId: profile.registrationNumber || 'N/A',
                program: profile.program || profile.course || 'General',
                academicYear: 'Current Academic Year',
                feeItems: feeBreakdown,
                payments: paymentHistory.map((payment) => ({
                  date: payment.date,
                  reference: payment.reference,
                  method: payment.method,
                  amount: payment.amount
                }))
              });
            }}>
            <Printer className="w-4 h-4 mr-2" />
            Print Statement
          </Button>
          <Button onClick={handlePayment} disabled={paying || balance <= 0}>
            {paying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
            Pay Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">KES {totalFees.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Current academic cycle</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">KES {totalPaid.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{percentagePaid.toFixed(0)}% of total</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className={balance > 0 ? "border-yellow-200 bg-yellow-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className={`text-2xl font-bold ${balance > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  KES {balance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {balance > 0 ? 'Due before exams' : 'Fully cleared'}
                </p>
              </div>
              {balance > 0 ?
              <AlertTriangle className="w-8 h-8 text-yellow-600" /> :
              <CheckCircle className="w-8 h-8 text-green-600" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>KES {totalPaid.toLocaleString()} paid of KES {totalFees.toLocaleString()}</span>
              <span>{percentagePaid.toFixed(0)}%</span>
            </div>
            <Progress value={percentagePaid} className="h-4" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
          <CardDescription>Derived from your current backend fee record</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Item</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead className="text-right">Paid (KES)</TableHead>
                <TableHead className="text-right">Balance (KES)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeBreakdown.map((item) =>
              <TableRow key={item.item}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell className="text-right">{item.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">{item.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{Math.max(item.amount - item.paid, 0).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    {item.amount <= item.paid ?
                  <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />Paid
                      </Badge> :
                  <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />Partial
                      </Badge>
                  }
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="font-bold bg-muted">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{totalFees.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600">{totalPaid.toLocaleString()}</TableCell>
                <TableCell className="text-right text-yellow-600">{balance.toLocaleString()}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead className="text-center">Print</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) =>
              <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    {payment.method === "M-Pesa" && <Phone className="w-4 h-4 text-green-600" />}
                    {payment.method}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                  <TableCell className="text-right font-semibold">{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      printReceipt({
                        receiptNumber: payment.id,
                        studentName: profile.name || 'Student',
                        studentId: profile.registrationNumber || 'N/A',
                        program: profile.program || profile.course || 'General',
                        date: payment.date,
                        amount: payment.amount,
                        paymentMethod: payment.method,
                        reference: payment.reference,
                        description: 'Fee Payment',
                        balance
                      });
                    }}>
                      <Printer className="w-4 h-4 mr-1" />
                      Receipt
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={payment.status === 'Completed' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Pay via M-Pesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Number: <span className="font-bold">{profile.registrationNumber || 'N/A'}</span></p>
              <p className="text-sm text-muted-foreground">Outstanding Balance: <span className="font-bold">KES {balance.toLocaleString()}</span></p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handlePayment} disabled={paying || balance <= 0}>
              {paying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
              Pay KES {balance.toLocaleString()} via M-Pesa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
};

export default FeesPage;
