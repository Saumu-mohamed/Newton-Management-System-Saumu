import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Save, Upload, Download, CheckCircle, Clock, AlertTriangle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { exportToCSV, exportToPDF, downloadTemplate, triggerFileUpload, importFromCSV } from "@/lib/export-utils";
const gradeColumns = [
{ key: "regNo", label: "Reg No" },
{ key: "name", label: "Student Name" },
{ key: "cat1", label: "CAT 1 (30)" },
{ key: "cat2", label: "CAT 2 (30)" },
{ key: "assignment", label: "Assignment (10)" },
{ key: "exam", label: "Exam (30)" }];
const GradesPage = () => {
  const [selectedUnit, setSelectedUnit] = useState("CS101");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const units = [
  { code: "CS101", name: "Introduction to Programming", status: "pending", deadline: "2024-01-25" },
  { code: "CS201", name: "Data Structures", status: "submitted", deadline: "2024-01-20" },
  { code: "CS301", name: "Database Systems", status: "pending", deadline: "2024-01-28" },
  { code: "IT102", name: "Web Development", status: "overdue", deadline: "2024-01-15" }];
  const [students, setStudents] = useState([
  { id: 1, regNo: "CS/2021/001", name: "John Doe", cat1: 18, cat2: 16, assignment: 8, exam: null, total: null },
  { id: 2, regNo: "CS/2021/002", name: "Jane Smith", cat1: 20, cat2: 19, assignment: 9, exam: null, total: null },
  { id: 3, regNo: "CS/2021/003", name: "Mike Johnson", cat1: 15, cat2: 14, assignment: 7, exam: null, total: null },
  { id: 4, regNo: "CS/2021/004", name: "Sarah Wilson", cat1: 22, cat2: 20, assignment: 10, exam: null, total: null },
  { id: 5, regNo: "CS/2021/005", name: "Tom Brown", cat1: 12, cat2: 13, assignment: 6, exam: null, total: null },
  { id: 6, regNo: "CS/2021/006", name: "Emily Davis", cat1: 19, cat2: 18, assignment: 8, exam: null, total: null }]
  );
  const getStatusBadge = (status) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Submitted</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const handleDownloadTemplate = () => {
    downloadTemplate({
      filename: `grades-${selectedUnit}`,
      columns: gradeColumns,
      sampleData: [
      { regNo: "CS/2021/001", name: "Student Name", cat1: "", cat2: "", assignment: "", exam: "" }]
    });
  };
  const handleUploadGrades = () => {
    setIsImporting(true);
    triggerFileUpload('.csv', (file) => {
      importFromCSV(
        file,
        (data) => {
          // Process imported data and update students
          const updatedStudents = students.map((student) => {
            const imported = data.find((d) => d["Reg No"] === student.regNo || d.regNo === student.regNo);
            if (imported) {
              return {
                ...student,
                cat1: parseInt(imported["CAT 1 (30)"] || imported.cat1) || student.cat1,
                cat2: parseInt(imported["CAT 2 (30)"] || imported.cat2) || student.cat2,
                assignment: parseInt(imported["Assignment (10)"] || imported.assignment) || student.assignment,
                exam: parseInt(imported["Exam (30)"] || imported.exam) || student.exam
              };
            }
            return student;
          });
          setStudents(updatedStudents);
          setIsImporting(false);
        },
        () => setIsImporting(false)
      );
    });
    // Reset importing state if user cancels file dialog
    setTimeout(() => setIsImporting(false), 500);
  };
  const handleExportGrades = () => {
    setIsExporting(true);
    const exportData = students.map((s) => ({
      regNo: s.regNo,
      name: s.name,
      cat1: s.cat1,
      cat2: s.cat2,
      assignment: s.assignment,
      exam: s.exam ?? '',
      total: (s.cat1 || 0) + (s.cat2 || 0) + (s.assignment || 0) + (s.exam || 0)
    }));
    exportToCSV({
      data: exportData,
      filename: `grades-${selectedUnit}`,
      columns: [...gradeColumns, { key: "total", label: "Total" }]
    });
    setIsExporting(false);
  };
  const handleExportPDF = () => {
    const exportData = students.map((s) => ({
      regNo: s.regNo,
      name: s.name,
      cat1: s.cat1,
      cat2: s.cat2,
      assignment: s.assignment,
      exam: s.exam ?? '--',
      total: (s.cat1 || 0) + (s.cat2 || 0) + (s.assignment || 0) + (s.exam || 0)
    }));
    exportToPDF({
      data: exportData,
      filename: `grades-${selectedUnit}`,
      columns: [...gradeColumns, { key: "total", label: "Total" }],
      title: `Grade Report - ${selectedUnit} - ${units.find((u) => u.code === selectedUnit)?.name}`
    });
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Grade Entry</h1>
          <p className="text-muted-foreground">Enter and manage student grades</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button
            variant="outline"
            onClick={handleUploadGrades}
            disabled={isImporting}>
            {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload
          </Button>
          <Button
            variant="outline"
            onClick={handleExportGrades}
            disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      {/* Unit Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {units.map((unit) =>
        <Card
          key={unit.code}
          className={`cursor-pointer transition-all ${selectedUnit === unit.code ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => setSelectedUnit(unit.code)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{unit.code}</p>
                  <p className="text-sm text-muted-foreground">{unit.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Due: {unit.deadline}</p>
                </div>
                {getStatusBadge(unit.status)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Grade Entry Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {selectedUnit} - Grade Entry
              </CardTitle>
              <CardDescription>Enter CAT, assignment, and exam marks for students</CardDescription>
            </div>
            <Button onClick={() => toast.success('Grades Saved', { description: 'All grades have been saved successfully' })}>
              <Save className="w-4 h-4 mr-2" />
              Save Grades
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
            <strong>Grading Scale:</strong> CAT 1 (30 marks) + CAT 2 (30 marks) + Assignment (10 marks) + Exam (30 marks) = 100 marks
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-center">CAT 1 (30)</TableHead>
                <TableHead className="text-center">CAT 2 (30)</TableHead>
                <TableHead className="text-center">Assignment (10)</TableHead>
                <TableHead className="text-center">Exam (30)</TableHead>
                <TableHead className="text-center">Total (100)</TableHead>
                <TableHead className="text-center">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const catTotal = (student.cat1 || 0) + (student.cat2 || 0) + (student.assignment || 0) + (student.exam || 0);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.regNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" defaultValue={student.cat1} min={0} max={30} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" defaultValue={student.cat2} min={0} max={30} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" defaultValue={student.assignment} min={0} max={10} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" placeholder="--" min={0} max={30} />
                    </TableCell>
                    <TableCell className="text-center font-semibold">{catTotal || "--"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">--</Badge>
                    </TableCell>
                  </TableRow>);
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => toast.info('Draft Saved', { description: 'Grades saved as draft' })}>
          Save as Draft
        </Button>
        <Button onClick={() => toast.success('Grades Submitted', { description: 'Grades submitted for approval' })}>
          Submit for Approval
        </Button>
      </div>
    </div>);
};
export default GradesPage;