import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Download, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
const registrationsData = [
{ id: "REG001", student: "John Doe", regNo: "CS/2021/001", program: "Computer Science", semester: "Sem 1 2024", units: 6, status: "approved", date: "2024-01-10" },
{ id: "REG002", student: "Jane Smith", regNo: "ENG/2021/002", program: "Engineering", semester: "Sem 1 2024", units: 5, status: "pending", date: "2024-01-12" },
{ id: "REG003", student: "Mike Johnson", regNo: "BUS/2022/003", program: "Business Admin", semester: "Sem 1 2024", units: 6, status: "approved", date: "2024-01-08" },
{ id: "REG004", student: "Sarah Wilson", regNo: "CS/2020/004", program: "Computer Science", semester: "Sem 1 2024", units: 4, status: "rejected", date: "2024-01-11" },
{ id: "REG005", student: "Tom Brown", regNo: "ENG/2022/005", program: "Engineering", semester: "Sem 1 2024", units: 6, status: "pending", date: "2024-01-13" },
{ id: "REG006", student: "Emily Davis", regNo: "BUS/2021/006", program: "Business Admin", semester: "Sem 1 2024", units: 5, status: "approved", date: "2024-01-09" }];
const registrationColumns = [
{ key: "id", label: "Registration ID" },
{ key: "student", label: "Student Name" },
{ key: "regNo", label: "Reg Number" },
{ key: "program", label: "Program" },
{ key: "semester", label: "Semester" },
{ key: "units", label: "Units" },
{ key: "status", label: "Status" },
{ key: "date", label: "Date" }];
const RegistrationsPage = () => {
  const [registrations] = useState(registrationsData);
  const [isExporting, setIsExporting] = useState(false);
  const stats = [
  { title: "Total Registrations", value: "2,450", icon: FileText, color: "text-blue-600" },
  { title: "Pending Approval", value: "156", icon: Clock, color: "text-yellow-600" },
  { title: "Approved", value: "2,180", icon: CheckCircle, color: "text-green-600" },
  { title: "With Issues", value: "24", icon: AlertTriangle, color: "text-red-600" }];
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) =>
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem1-2024">Sem 1 2024</SelectItem>
                <SelectItem value="sem2-2023">Sem 2 2023</SelectItem>
                <SelectItem value="sem1-2023">Sem 1 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Records</CardTitle>
          <CardDescription>All student unit registrations for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg ID</TableHead>
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
              <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.id}</TableCell>
                  <TableCell>{reg.student}</TableCell>
                  <TableCell>{reg.regNo}</TableCell>
                  <TableCell>{reg.program}</TableCell>
                  <TableCell>{reg.semester}</TableCell>
                  <TableCell>{reg.units}</TableCell>
                  <TableCell>{reg.date}</TableCell>
                  <TableCell>{getStatusBadge(reg.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toast.info('View Details', { description: `Viewing registration ${reg.id}...` })}>
                        View
                      </Button>
                      {reg.status === "pending" &&
                    <>
                          <Button variant="ghost" size="sm" className="text-green-600" onClick={() => toast.success('Approved', { description: `Registration ${reg.id} approved` })}>
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => toast.warning('Rejected', { description: `Registration ${reg.id} rejected` })}>
                            Reject
                          </Button>
                        </>
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
export default RegistrationsPage;