import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Save, Upload, Download, CheckCircle, Clock, AlertTriangle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToPDF, downloadTemplate, triggerFileUpload, importFromCSV } from "@/lib/export-utils";
import {
  getLecturerGradebook,
  saveLecturerGrades,
  submitLecturerGrades } from
'@/services/lecturerOperationsService';

const gradeColumns = [
{ key: "regNo", label: "Reg No" },
{ key: "name", label: "Student Name" },
{ key: "cat1", label: "CAT 1 (30)" },
{ key: "cat2", label: "CAT 2 (30)" },
{ key: "assignment", label: "Assignment (10)" },
{ key: "exam", label: "Exam (30)" }];

const getGradeBadge = (score) => {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'E';
};

const GradesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUnit = searchParams.get("unit") || "";
  const [selectedUnit, setSelectedUnit] = useState(initialUnit);
  const [units, setUnits] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadGradebook = async (unitCode) => {
    try {
      setLoading(true);
      const response = await getLecturerGradebook(unitCode);
      setUnits(response.units || []);
      if (!unitCode && response.selectedUnit?.code) {
        setSelectedUnit(response.selectedUnit.code);
        setSearchParams({ unit: response.selectedUnit.code });
      }
      setSelectedUnitDetails(response.selectedUnit || null);
      setStudents(response.students || []);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load gradebook."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGradebook(selectedUnit);
  }, [selectedUnit]);

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

  const handleUnitSelect = (unitCode) => {
    setSelectedUnit(unitCode);
    setSearchParams({ unit: unitCode });
  };

  const handleStudentValueChange = (studentId, field, value) => {
    setStudents((current) => current.map((student) => {
      if (student.id !== studentId) return student;
      const parsed = value === '' ? '' : Number(value);
      const next = { ...student, [field]: parsed };
      const total = Number(next.cat1 || 0) + Number(next.cat2 || 0) + Number(next.assignment || 0) + Number(next.exam || 0);
      return {
        ...next,
        total: total || null,
        grade: total ? getGradeBadge(total) : '--'
      };
    }));
  };

  const handleDownloadTemplate = () => {
    downloadTemplate({
      filename: `grades-${selectedUnit || 'unit'}`,
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
          setStudents((current) => current.map((student) => {
            const imported = data.find((item) => item["Reg No"] === student.regNo || item.regNo === student.regNo);
            if (!imported) return student;
            const next = {
              ...student,
              cat1: Number(imported["CAT 1 (30)"] || imported.cat1 || 0),
              cat2: Number(imported["CAT 2 (30)"] || imported.cat2 || 0),
              assignment: Number(imported["Assignment (10)"] || imported.assignment || 0),
              exam: Number(imported["Exam (30)"] || imported.exam || 0)
            };
            const total = Number(next.cat1 || 0) + Number(next.cat2 || 0) + Number(next.assignment || 0) + Number(next.exam || 0);
            return {
              ...next,
              total,
              grade: getGradeBadge(total)
            };
          }));
          setIsImporting(false);
        },
        () => setIsImporting(false)
      );
    });
    setTimeout(() => setIsImporting(false), 500);
  };

  const handleExportGrades = () => {
    setIsExporting(true);
    const exportData = students.map((student) => ({
      regNo: student.regNo,
      name: student.name,
      cat1: student.cat1,
      cat2: student.cat2,
      assignment: student.assignment,
      exam: student.exam ?? '',
      total: student.total ?? ''
    }));
    exportToCSV({
      data: exportData,
      filename: `grades-${selectedUnit || 'unit'}`,
      columns: [...gradeColumns, { key: "total", label: "Total" }]
    });
    setIsExporting(false);
  };

  const handleExportPDF = () => {
    const exportData = students.map((student) => ({
      regNo: student.regNo,
      name: student.name,
      cat1: student.cat1,
      cat2: student.cat2,
      assignment: student.assignment,
      exam: student.exam ?? '--',
      total: student.total ?? '--'
    }));
    exportToPDF({
      data: exportData,
      filename: `grades-${selectedUnit || 'unit'}`,
      columns: [...gradeColumns, { key: "total", label: "Total" }],
      title: `Grade Report - ${selectedUnitDetails?.code || selectedUnit}`
    });
  };

  const persistGrades = async (mode) => {
    if (!selectedUnit) return;

    try {
      setSaving(true);
      const payload = students.map((student) => ({
        id: student.id,
        cat1: student.cat1,
        cat2: student.cat2,
        assignment: student.assignment,
        exam: student.exam
      }));
      const response = mode === 'draft' ?
      await saveLecturerGrades(selectedUnit, payload) :
      await submitLecturerGrades(selectedUnit, payload);

      toast.success(mode === 'draft' ? 'Grades Saved' : 'Grades Submitted', {
        description: response?.message
      });
      await loadGradebook(selectedUnit);
    } catch (error) {
      toast.error('Save Failed', {
        description: error?.response?.data?.message || 'Failed to persist grades.'
      });
    } finally {
      setSaving(false);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {units.map((unit) =>
        <Card
          key={unit.code}
          className={`cursor-pointer transition-all ${selectedUnit === unit.code ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          onClick={() => handleUnitSelect(unit.code)}>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {selectedUnitDetails?.code || selectedUnit || 'Select a Unit'} - Grade Entry
              </CardTitle>
              <CardDescription>Enter CAT, assignment, and exam marks for students</CardDescription>
            </div>
            <Button onClick={() => persistGrades('draft')} disabled={saving || !selectedUnit}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Grades
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
            <strong>Grading Scale:</strong> CAT 1 (30 marks) + CAT 2 (30 marks) + Assignment (10 marks) + Exam (30 marks) = 100 marks
          </div>
          {loading ?
          <div className="py-10 text-sm text-muted-foreground">Loading gradebook...</div> :
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
                {students.map((student) =>
                <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.regNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" value={student.cat1 ?? ''} onChange={(event) => handleStudentValueChange(student.id, 'cat1', event.target.value)} min={0} max={30} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" value={student.cat2 ?? ''} onChange={(event) => handleStudentValueChange(student.id, 'cat2', event.target.value)} min={0} max={30} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" value={student.assignment ?? ''} onChange={(event) => handleStudentValueChange(student.id, 'assignment', event.target.value)} min={0} max={10} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-16 text-center" value={student.exam ?? ''} onChange={(event) => handleStudentValueChange(student.id, 'exam', event.target.value)} placeholder="--" min={0} max={30} />
                    </TableCell>
                    <TableCell className="text-center font-semibold">{student.total ?? "--"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{student.grade || "--"}</Badge>
                    </TableCell>
                  </TableRow>
                )}
                {!students.length &&
                <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      No enrolled students found for this unit.
                    </TableCell>
                  </TableRow>
                }
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => persistGrades('draft')} disabled={saving || !selectedUnit}>
          Save as Draft
        </Button>
        <Button onClick={() => persistGrades('submit')} disabled={saving || !selectedUnit}>
          Submit for Approval
        </Button>
      </div>
    </div>);
};

export default GradesPage;
