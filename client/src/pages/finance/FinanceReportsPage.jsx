import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users, Calendar, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getFinanceReports } from "@/services/financeDashboardService";
import { exportToCSV } from "@/lib/export-utils";

const FinanceReportsPage = () => {
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await getFinanceReports({ year: selectedYear });
        if (!ignore) {
          setReportData(data);
          setError("");
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError?.response?.data?.message || "Failed to load finance reports.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      ignore = true;
    };
  }, [selectedYear]);

  const summary = reportData?.summary || {};
  const monthlyCollection = reportData?.monthlyCollection || [];
  const paymentMethods = reportData?.paymentMethods || [];
  const facultyCollection = reportData?.facultyCollection || [];
  const quickReports = reportData?.quickReports || [];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Reports</h1>
          <p className="text-muted-foreground">Financial analytics and reporting dashboard</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(new Date().getFullYear())}>{new Date().getFullYear()}</SelectItem>
              <SelectItem value={String(new Date().getFullYear() - 1)}>{new Date().getFullYear() - 1}</SelectItem>
              <SelectItem value={String(new Date().getFullYear() - 2)}>{new Date().getFullYear() - 2}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportToCSV({ data: monthlyCollection, filename: `finance-reports-${selectedYear}` })}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">KES {((summary.totalCollected || 0) / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {summary.changeVsLastYear || 0}% vs last year
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
                <p className="text-2xl font-bold">KES {((summary.outstanding || 0) / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Live outstanding balance
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
                <p className="text-2xl font-bold">{summary.collectionRate || 0}%</p>
                <p className="text-xs text-green-600">Target: {summary.targetRate || 85}%</p>
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
                <p className="text-2xl font-bold">{(summary.studentsCleared || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of {(summary.totalStudents || 0).toLocaleString()} total</p>
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
            {loading && <div className="text-sm text-muted-foreground">Loading monthly collection...</div>}
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
            {loading && <div className="text-sm text-muted-foreground">Loading payment method data...</div>}
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
            {loading && <div className="text-sm text-muted-foreground">Loading faculty collection...</div>}
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
            <Card key={report.id} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {report.id === "daily-collection" && <Calendar className="w-8 h-8 text-primary" />}
                    {report.id === "outstanding-fees" && <Users className="w-8 h-8 text-primary" />}
                    {report.id === "payment-method-analysis" && <BarChart3 className="w-8 h-8 text-primary" />}
                    {report.id === "faculty-collection" && <FileText className="w-8 h-8 text-primary" />}
                    <div>
                      <h4 className="font-semibold">{report.title}</h4>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {!loading && quickReports.length === 0 && <div className="text-sm text-muted-foreground">No reports returned by the backend.</div>}
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default FinanceReportsPage;
