import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, CreditCard, CheckCircle, Clock, AlertTriangle, Phone, Printer, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { printFeeStatement, printReceipt } from "@/lib/print-utils";
import { getStudentDashboard } from "@/services/studentDashboardService";
import { initiateMpesaPayment } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentSocket } from "@/hooks/usePaymentSocket";

const currency = new Intl.NumberFormat("en-KE");

const statusConfig = {
  pending: {
    label: "Pending",
    badgeClassName: "bg-yellow-100 text-yellow-800",
    description: "Waiting for you to complete the STK prompt on your phone."
  },
  success: {
    label: "Success",
    badgeClassName: "bg-green-100 text-green-800",
    description: "Payment confirmed and your balance will refresh automatically."
  },
  failed: {
    label: "Failed",
    badgeClassName: "bg-red-100 text-red-800",
    description: "The M-Pesa request was not completed successfully."
  }
};

const FeesPage = () => {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mpesa");
  const [activePayment, setActivePayment] = useState(null);
  const processedStatusRef = useRef(new Set());

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data = await getStudentDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load fee statement."
      });
    } finally {
      if (!silent) {
        setLoading(false);
      }
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

  useEffect(() => {
    setPhone((currentPhone) => currentPhone || user?.phone || "");
  }, [user?.phone]);

  useEffect(() => {
    setAmount((currentAmount) => {
      const numericAmount = Number(currentAmount || 0);

      if (!currentAmount || numericAmount > balance) {
        return balance > 0 ? String(balance) : "";
      }

      return currentAmount;
    });
  }, [balance]);

  const feeBreakdown = useMemo(() => ([
    { item: "Tuition Fee", amount: Math.round(totalFees * 0.84), paid: Math.min(totalPaid, Math.round(totalFees * 0.84)) },
    { item: "Library Fee", amount: Math.round(totalFees * 0.04), paid: Math.min(Math.max(totalPaid - Math.round(totalFees * 0.84), 0), Math.round(totalFees * 0.04)) },
    { item: "Examination Fee", amount: Math.round(totalFees * 0.07), paid: Math.min(Math.max(totalPaid - Math.round(totalFees * 0.88), 0), Math.round(totalFees * 0.07)) },
    { item: "Activity Fee", amount: Math.max(totalFees - Math.round(totalFees * 0.95), 0), paid: Math.max(totalPaid - Math.round(totalFees * 0.95), 0) }
  ]), [totalFees, totalPaid]);

  usePaymentSocket({
    token,
    enabled: Boolean(token),
    onPaymentUpdate: async (payment) => {
      if (!payment?.id) {
        return;
      }

      setActivePayment((currentPayment) => {
        if (!currentPayment) {
          return payment;
        }

        const matchesCurrentPayment =
          currentPayment.id === payment.id ||
          currentPayment.checkoutRequestId === payment.checkoutRequestId;

        return matchesCurrentPayment ? { ...currentPayment, ...payment } : currentPayment;
      });

      const receiptOrReference = payment.transactionId || payment.transactionRef || payment.reference;
      const statusKey = `${payment.id}:${payment.status}`;

      if (!processedStatusRef.current.has(statusKey) && payment.status !== "pending") {
        processedStatusRef.current.add(statusKey);

        if (payment.status === "success") {
          toast.success("Payment Confirmed", {
            description: receiptOrReference ? `Receipt ${receiptOrReference} was confirmed successfully.` : "Your M-Pesa payment was confirmed successfully."
          });
        }

        if (payment.status === "failed") {
          toast.error("Payment Failed", {
            description: payment.resultDesc || "The M-Pesa request did not complete successfully."
          });
        }
      }

      await loadDashboard({ silent: true });
    }
  });

  const handlePayment = async () => {
    try {
      setPaying(true);
      const response = await initiateMpesaPayment({
        phone,
        amount: Number(amount),
        method,
        reference: "School Fees"
      });

      setActivePayment(response?.payment || null);
      toast.success("M-Pesa Prompt Sent", {
        description: response?.message || "Approve the STK push on your phone to complete payment."
      });
      await loadDashboard({ silent: true });
    } catch (error) {
      const responsePayment = error?.response?.data?.payment;

      if (responsePayment) {
        setActivePayment(responsePayment);
      }

      toast.error("Payment Failed", {
        description: error?.response?.data?.message || "Failed to initiate payment."
      });
    } finally {
      setPaying(false);
    }
  };

  const activeStatus = activePayment?.status ? statusConfig[activePayment.status] : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Statement</h1>
          <p className="text-muted-foreground">View your fee balance, initiate M-Pesa payments, and track confirmations in real time.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              printFeeStatement({
                studentName: profile.name || "Student",
                studentId: profile.registrationNumber || "N/A",
                program: profile.program || profile.course || "General",
                academicYear: "Current Academic Year",
                feeItems: feeBreakdown,
                payments: paymentHistory.map((payment) => ({
                  date: payment.date,
                  reference: payment.reference,
                  method: payment.method,
                  amount: payment.amount
                }))
              });
            }}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Statement
          </Button>
          <Button
            onClick={() => {
              document.getElementById("mpesa-payment-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            disabled={balance <= 0}
          >
            <CreditCard className="w-4 h-4 mr-2" />
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
                <p className="text-2xl font-bold">KES {currency.format(totalFees)}</p>
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
                <p className="text-2xl font-bold text-green-600">KES {currency.format(totalPaid)}</p>
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
                <p className={`text-2xl font-bold ${balance > 0 ? "text-yellow-600" : "text-green-600"}`}>
                  KES {currency.format(balance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {balance > 0 ? "Due before exams" : "Fully cleared"}
                </p>
              </div>
              {balance > 0 ? <AlertTriangle className="w-8 h-8 text-yellow-600" /> : <CheckCircle className="w-8 h-8 text-green-600" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="mpesa-payment-card" className="border-green-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            Pay via M-Pesa
          </CardTitle>
          <CardDescription>All requests go through the backend, trigger Daraja STK push, then update this page when Safaricom sends the callback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
              <Input
                id="mpesa-phone"
                placeholder="0712345678 or 254712345678"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mpesa-amount">Amount (KES)</Label>
              <Input
                id="mpesa-amount"
                type="number"
                min="1"
                max={balance || undefined}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-dashed border-green-200 bg-green-50/40 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Student Account</p>
              <p className="font-semibold">{profile.registrationNumber || "N/A"}</p>
              <p className="text-sm text-muted-foreground">Outstanding balance: <span className="font-semibold text-foreground">KES {currency.format(balance)}</span></p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handlePayment} disabled={paying || balance <= 0}>
              {paying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
              {paying ? "Waiting for M-Pesa prompt..." : `Pay KES ${currency.format(Number(amount || 0))}`}
            </Button>
          </div>

          {activePayment && activeStatus && (
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Badge className={activeStatus.badgeClassName}>{activeStatus.label}</Badge>
                Latest Payment Update
              </AlertTitle>
              <AlertDescription className="space-y-1 pt-2">
                <p>{activeStatus.description}</p>
                <p>Amount: KES {currency.format(activePayment.amount || 0)}</p>
                <p>Reference: {activePayment.transactionId || activePayment.transactionRef || activePayment.reference || "Pending assignment"}</p>
                {activePayment.resultDesc && <p>Status note: {activePayment.resultDesc}</p>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading fee progress...
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>KES {currency.format(totalPaid)} paid of KES {currency.format(totalFees)}</span>
                <span>{percentagePaid.toFixed(0)}%</span>
              </div>
              <Progress value={percentagePaid} className="h-4" />
            </div>
          )}
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
              {feeBreakdown.map((item) => (
                <TableRow key={item.item}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell className="text-right">{currency.format(item.amount)}</TableCell>
                  <TableCell className="text-right text-green-600">{currency.format(item.paid)}</TableCell>
                  <TableCell className="text-right">{currency.format(Math.max(item.amount - item.paid, 0))}</TableCell>
                  <TableCell className="text-center">
                    {item.amount <= item.paid ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Partial
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{currency.format(totalFees)}</TableCell>
                <TableCell className="text-right text-green-600">{currency.format(totalPaid)}</TableCell>
                <TableCell className="text-right text-yellow-600">{currency.format(balance)}</TableCell>
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
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.reference || payment.id}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    {payment.method === "M-Pesa" && <Phone className="w-4 h-4 text-green-600" />}
                    {payment.method}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                  <TableCell className="text-right font-semibold">{currency.format(payment.amount)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        printReceipt({
                          receiptNumber: payment.reference || payment.id,
                          studentName: profile.name || "Student",
                          studentId: profile.registrationNumber || "N/A",
                          program: profile.program || profile.course || "General",
                          date: payment.date,
                          amount: payment.amount,
                          paymentMethod: payment.method,
                          reference: payment.reference,
                          description: "Fee Payment",
                          balance
                        });
                      }}
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Receipt
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={payment.status === "Completed" ? "bg-green-100 text-green-800" : payment.status === "Failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesPage;
