import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, Download, FileText, CheckCircle, Clock, Printer, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";
import { printTranscript } from "@/lib/print-utils";
const transcriptRequestsData = [
{ id: "TR001", student: "John Doe", regNo: "CS/2021/001", program: "Computer Science", type: "Official", copies: 2, status: "ready", requestDate: "2024-01-10", fee: 500 },
{ id: "TR002", student: "Jane Smith", regNo: "ENG/2021/002", program: "Engineering", type: "Official", copies: 3, status: "processing", requestDate: "2024-01-12", fee: 750 },
{ id: "TR003", student: "Mike Johnson", regNo: "BUS/2022/003", program: "Business Admin", type: "Unofficial", copies: 1, status: "ready", requestDate: "2024-01-08", fee: 0 },
{ id: "TR004", student: "Sarah Wilson", regNo: "CS/2020/004", program: "Computer Science", type: "Official", copies: 1, status: "pending", requestDate: "2024-01-13", fee: 250 },
{ id: "TR005", student: "Tom Brown", regNo: "ENG/2022/005", program: "Engineering", type: "Official", copies: 2, status: "collected", requestDate: "2024-01-05", fee: 500 }];
const transcriptColumns = [
{ key: "id", label: "Request ID" },
{ key: "student", label: "Student Name" },
{ key: "regNo", label: "Reg Number" },
{ key: "program", label: "Program" },
{ key: "type", label: "Type" },
{ key: "copies", label: "Copies" },
{ key: "fee", label: "Fee (KES)" },
{ key: "requestDate", label: "Request Date" },
{ key: "status", label: "Status" }];
const TranscriptsPage = () => {
  const [transcriptRequests] = useState(transcriptRequestsData);
  const [isExporting, setIsExporting] = useState(false);
  const stats = [
  { title: "Total Requests", value: "156", icon: FileText, color: "text-blue-600" },
  { title: "Processing", value: "23", icon: Clock, color: "text-yellow-600" },
  { title: "Ready for Collection", value: "45", icon: CheckCircle, color: "text-green-600" },
  { title: "Collected This Month", value: "88", icon: ClipboardList, color: "text-purple-600" }];
  const getStatusBadge = (status) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>;
      case "collected":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Collected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const generateMockTranscriptData = (request) => {
    return {
      studentName: request.student,
      studentId: request.regNo,
      program: request.program,
      faculty: 'Faculty of Science & Technology',
      dateOfAdmission: '2021-09-01',
      status: 'In Progress',
      cgpa: 3.45,
      totalCredits: 84,
      semesters: [
      {
        name: 'Year 1 - Semester 1',
        gpa: 3.2,
        courses: [
        { code: 'CS101', name: 'Introduction to Programming', credits: 3, grade: 'A', points: 4.0 },
        { code: 'MAT101', name: 'Calculus I', credits: 3, grade: 'B', points: 3.0 },
        { code: 'PHY101', name: 'Physics I', credits: 3, grade: 'B+', points: 3.5 },
        { code: 'ENG101', name: 'Communication Skills', credits: 3, grade: 'A', points: 4.0 }]
      },
      {
        name: 'Year 1 - Semester 2',
        gpa: 3.5,
        courses: [
        { code: 'CS102', name: 'Object-Oriented Programming', credits: 3, grade: 'A', points: 4.0 },
        { code: 'MAT102', name: 'Calculus II', credits: 3, grade: 'B+', points: 3.5 },
        { code: 'CS103', name: 'Data Structures', credits: 3, grade: 'A-', points: 3.7 },
        { code: 'STA101', name: 'Statistics', credits: 3, grade: 'B', points: 3.0 }]
      },
      {
        name: 'Year 2 - Semester 1',
        gpa: 3.6,
        courses: [
        { code: 'CS201', name: 'Algorithms', credits: 3, grade: 'A', points: 4.0 },
        { code: 'CS202', name: 'Database Systems', credits: 3, grade: 'A-', points: 3.7 },
        { code: 'CS203', name: 'Computer Networks', credits: 3, grade: 'B+', points: 3.5 },
        { code: 'CS204', name: 'Operating Systems', credits: 3, grade: 'A', points: 4.0 }]
      }]
    };
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transcripts</h1>
          <p className="text-muted-foreground">Manage transcript requests and generation</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() => {
              setIsExporting(true);
              exportToCSV({ data: transcriptRequests, filename: 'transcripts', columns: transcriptColumns });
              setIsExporting(false);
            }}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export CSV
          </Button>
          <Button onClick={() => toast.info('New Request', { description: 'Opening transcript request form...' })}>
            <FileText className="w-4 h-4 mr-2" />
            New Request
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="official">Official</SelectItem>
                <SelectItem value="unofficial">Unofficial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Transcripts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transcript Requests</CardTitle>
          <CardDescription>All transcript requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Copies</TableHead>
                <TableHead>Fee (KES)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcriptRequests.map((request) =>
              <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.student}</TableCell>
                  <TableCell>{request.regNo}</TableCell>
                  <TableCell>{request.program}</TableCell>
                  <TableCell>
                    <Badge variant={request.type === "Official" ? "default" : "secondary"}>
                      {request.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.copies}</TableCell>
                  <TableCell>{request.fee > 0 ? request.fee : "Free"}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const transcriptData = generateMockTranscriptData(request);
                        printTranscript(transcriptData);
                      }}
                      title="Preview Transcript">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === "ready" &&
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const transcriptData = generateMockTranscriptData(request);
                        printTranscript(transcriptData);
                        toast.success('Transcript Ready', { description: 'Print dialog opened for transcript.' });
                      }}
                      title="Print Transcript">
                          <Printer className="w-4 h-4" />
                        </Button>
                    }
                      <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const transcriptData = generateMockTranscriptData(request);
                        printTranscript(transcriptData);
                      }}
                      title="Download Transcript">
                        <Download className="w-4 h-4" />
                      </Button>
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
export default TranscriptsPage;