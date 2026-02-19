import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Wallet, CreditCard, CheckCircle, Clock, AlertTriangle, Phone, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { printFeeStatement, printReceipt } from "@/lib/print-utils";
const FeesPage = () => {
  const feeBreakdown = [
  { item: "Tuition Fee", amount: 120000, paid: 120000 },
  { item: "Library Fee", amount: 5000, paid: 5000 },
  { item: "Examination Fee", amount: 8000, paid: 8000 },
  { item: "Activity Fee", amount: 3000, paid: 3000 },
  { item: "ICT Fee", amount: 4000, paid: 2000 }];
  const paymentHistory = [
  { id: "PAY001", date: "2024-01-10", amount: 50000, method: "M-Pesa", reference: "MPE789456123", status: "completed" },
  { id: "PAY002", date: "2024-01-05", amount: 45000, method: "Bank Transfer", reference: "BNK456123789", status: "completed" },
  { id: "PAY003", date: "2023-12-20", amount: 40000, method: "M-Pesa", reference: "MPE123789456", status: "completed" },
  { id: "PAY004", date: "2023-12-01", amount: 3000, method: "Cash", reference: "CSH789123456", status: "completed" }];
  const totalFees = feeBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = feeBreakdown.reduce((sum, item) => sum + item.paid, 0);
  const balance = totalFees - totalPaid;
  const percentagePaid = totalPaid / totalFees * 100;
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
                studentName: 'John Doe',
                studentId: 'STU/2021/001',
                program: 'Bachelor of Science in Computer Science',
                academicYear: '2023/24',
                feeItems: feeBreakdown,
                payments: paymentHistory.map((p) => ({
                  date: p.date,
                  reference: p.reference,
                  method: p.method,
                  amount: p.amount
                }))
              });
            }}>
            <Printer className="w-4 h-4 mr-2" />
            Print Statement
          </Button>
          <Button onClick={() => toast({ title: "Pay Now", description: "Initiating M-Pesa payment..." })}>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Now
          </Button>
        </div>
      </div>
      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">KES {totalFees.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Academic Year 2023/24</p>
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
      {/* Payment Progress */}
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
      {/* Fee Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
          <CardDescription>Detailed breakdown of your fee structure</CardDescription>
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
                  <TableCell className="text-right">{(item.amount - item.paid).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    {item.amount === item.paid ?
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
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Payment History */}
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
                        studentName: 'John Doe',
                        studentId: 'STU/2021/001',
                        program: 'Bachelor of Science in Computer Science',
                        date: payment.date,
                        amount: payment.amount,
                        paymentMethod: payment.method,
                        reference: payment.reference,
                        description: 'Tuition Fee Payment',
                        balance: balance
                      });
                    }}>
                      <Printer className="w-4 h-4 mr-1" />
                      Receipt
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />Completed
                    </Badge>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* M-Pesa Payment Option */}
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
              <p className="text-sm text-muted-foreground mb-1">Paybill Number: <span className="font-bold">123456</span></p>
              <p className="text-sm text-muted-foreground">Account Number: <span className="font-bold">STU/2021/001</span></p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast({ title: "M-Pesa STK Push", description: "Check your phone for the M-Pesa prompt..." })}>
              <Phone className="w-4 h-4 mr-2" />
              Pay KES {balance.toLocaleString()} via M-Pesa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default FeesPage;