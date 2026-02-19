import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users, Calendar, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
const FinanceReportsPage = () => {
  const monthlyCollection = [
  { month: "Jan", collected: 2400000, target: 3000000 },
  { month: "Feb", collected: 2800000, target: 3000000 },
  { month: "Mar", collected: 3200000, target: 3000000 },
  { month: "Apr", collected: 2100000, target: 3000000 },
  { month: "May", collected: 2900000, target: 3000000 },
  { month: "Jun", collected: 3500000, target: 3000000 }];
  const paymentMethods = [
  { name: "M-Pesa", value: 65, color: "#22c55e" },
  { name: "Bank Transfer", value: 25, color: "#3b82f6" },
  { name: "Cash", value: 10, color: "#f59e0b" }];
  const facultyCollection = [
  { faculty: "Engineering", collected: 8500000, outstanding: 2100000 },
  { faculty: "Business", collected: 6200000, outstanding: 1800000 },
  { faculty: "Computing", collected: 5800000, outstanding: 1500000 },
  { faculty: "Sciences", collected: 4200000, outstanding: 1200000 },
  { faculty: "Arts", collected: 3100000, outstanding: 900000 }];
  const quickReports = [
  { title: "Daily Collection Report", description: "Today's payment transactions", icon: Calendar },
  { title: "Outstanding Fees Report", description: "Students with pending balances", icon: Users },
  { title: "Payment Method Analysis", description: "Breakdown by payment method", icon: BarChart3 },
  { title: "Faculty-wise Collection", description: "Collection by department", icon: FileText }];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Reports</h1>
          <p className="text-muted-foreground">Financial analytics and reporting dashboard</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast({ title: "Exporting Report", description: "Generating comprehensive finance report..." })}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">KES 27.8M</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +15% vs last year
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">KES 7.5M</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> -8% vs last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">78.7%</p>
                <p className="text-xs text-green-600">Target: 85%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students Cleared</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-muted-foreground">of 3,450 total</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection vs Target</CardTitle>
            <CardDescription>Fee collection performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCollection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value) => `KES ${(value / 1000000).toFixed(1)}M`} />
                <Bar dataKey="collected" fill="hsl(var(--primary))" name="Collected" />
                <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}>
                    {paymentMethods.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Faculty Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty-wise Collection</CardTitle>
          <CardDescription>Fee collection breakdown by faculty</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facultyCollection} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `${value / 1000000}M`} />
              <YAxis dataKey="faculty" type="category" width={100} />
              <Tooltip formatter={(value) => `KES ${(value / 1000000).toFixed(1)}M`} />
              <Bar dataKey="collected" fill="hsl(var(--primary))" name="Collected" />
              <Bar dataKey="outstanding" fill="hsl(var(--destructive))" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>Generate common financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReports.map((report) =>
            <Card key={report.title} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => toast({ title: "Generating Report", description: `Creating ${report.title}...` })}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <report.icon className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">{report.title}</h4>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default FinanceReportsPage;