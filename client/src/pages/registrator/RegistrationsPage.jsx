import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Download, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { decideRegistrationWorkflow, getRegistrationWorkflow } from "@/services/registratorOperationsService";

const registrationColumns = [
{ key: "student", label: "Student Name" },
{ key: "regNo", label: "Reg Number" },
{ key: "program", label: "Program" },
{ key: "semester", label: "Semester" },
{ key: "units", label: "Units" },
{ key: "status", label: "Status" },
{ key: "date", label: "Date" }];

const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [semester, setSemester] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await getRegistrationWorkflow({
        search,
        status,
        semester
      });
      setRegistrations(response.registrations || []);
      setStats(response.stats || null);
      setSemesters(response.semesters || []);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load course registrations."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [search, status, semester]);

  const statCards = useMemo(() => ([
  { title: "Total Registrations", value: stats?.total ?? 0, icon: FileText, color: "text-blue-600" },
  { title: "Pending Approval", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-600" },
  { title: "Approved", value: stats?.approved ?? 0, icon: CheckCircle, color: "text-green-600" },
  { title: "Rejected", value: stats?.rejected ?? 0, icon: AlertTriangle, color: "text-red-600" }]), [stats]);

  const getStatusBadge = (registrationStatus) => {
    switch (registrationStatus) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{registrationStatus}</Badge>;
    }
  };

  const handleDecision = async (studentId, decision) => {
    try {
      setActionLoading(`${studentId}-${decision}`);
      const response = await decideRegistrationWorkflow(studentId, { decision });
      toast.success(decision === "approved" ? "Registration Approved" : "Registration Rejected", {
        description: response?.message
      });
      await loadRegistrations();
    } catch (error) {
      toast.error("Action Failed", {
        description: error?.response?.data?.message || "Failed to update registration."
      });
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Registrations</h1>
          <p className="text-muted-foreground">Manage student unit registrations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() => {
              setIsExporting(true);
              exportToCSV({ data: registrations, filename: 'registrations', columns: registrationColumns });
              setIsExporting(false);
            }}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToPDF({ data: registrations, filename: 'registrations', columns: registrationColumns, title: 'Course Registrations Report' })}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

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

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student name or reg no..." className="pl-10" />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((semesterOption) =>
                <SelectItem key={semesterOption} value={semesterOption}>
                    {semesterOption}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration Records</CardTitle>
          <CardDescription>All student unit registrations for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="py-10 text-sm text-muted-foreground">Loading registration records...</div> :
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Reg No</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) =>
                <TableRow key={`${reg.id}-${reg.semester}`}>
                    <TableCell className="font-medium">{reg.student}</TableCell>
                    <TableCell>{reg.regNo}</TableCell>
                    <TableCell>{reg.program}</TableCell>
                    <TableCell>{reg.semester}</TableCell>
                    <TableCell>{reg.units}</TableCell>
                    <TableCell>{reg.date}</TableCell>
                    <TableCell>{getStatusBadge(reg.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        disabled={actionLoading === `${reg.id}-approved` || reg.status === "approved"}
                        onClick={() => handleDecision(reg.id, "approved")}>
                          {actionLoading === `${reg.id}-approved` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                        </Button>
                        <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        disabled={actionLoading === `${reg.id}-rejected` || reg.status === "rejected"}
                        onClick={() => handleDecision(reg.id, "rejected")}>
                          {actionLoading === `${reg.id}-rejected` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!registrations.length &&
                <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      No registration records found for the selected filters.
                    </TableCell>
                  </TableRow>
                }
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>
    </div>);
};

export default RegistrationsPage;
