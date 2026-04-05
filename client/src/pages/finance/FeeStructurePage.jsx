import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getFeeStructures } from "@/services/financeDashboardService";

const FeeStructurePage = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    let ignore = false;

    const loadFeeStructures = async () => {
      try {
        setLoading(true);
        const data = await getFeeStructures({ search, level, status });
        if (!ignore) {
          setFeeStructures(data.feeStructures || []);
          setStats(data.stats || null);
          setError("");
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError?.response?.data?.message || "Failed to load fee structures.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadFeeStructures();

    return () => {
      ignore = true;
    };
  }, [search, level, status]);

  const statCards = [
    { title: "Active Fee Structures", value: String(stats?.activeStructures || 0), icon: Wallet, color: "text-green-600" },
    { title: "Programs Covered", value: String(stats?.programsCovered || 0), icon: BookOpen, color: "text-blue-600" },
    { title: "Avg. Annual Fee", value: `KES ${(stats?.avgAnnualFee || 0).toLocaleString()}`, icon: GraduationCap, color: "text-purple-600" },
    { title: "Campuses", value: String(stats?.campuses || 0), icon: Building2, color: "text-orange-600" }
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Structure</h1>
          <p className="text-muted-foreground">Manage program fee structures and charges</p>
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
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="Search by program name..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Fee Structure Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>All program fee structures for the current academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Tuition</TableHead>
                <TableHead className="text-right">Library</TableHead>
                <TableHead className="text-right">Exam</TableHead>
                <TableHead className="text-right">Activity</TableHead>
                <TableHead className="text-right">Total (KES)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">Loading fee structures...</TableCell>
                </TableRow>
              )}
              {feeStructures.map((fee) =>
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.program}</TableCell>
                  <TableCell>{fee.level}</TableCell>
                  <TableCell>Year {fee.year}</TableCell>
                  <TableCell className="text-right">{fee.tuition.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{fee.library.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{fee.exam.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{fee.activity.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{fee.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={fee.status === "active" ? "default" : "secondary"}>
                      {fee.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )}
              {!loading && feeStructures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">No fee structures returned by the backend.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);
};
export default FeeStructurePage;
