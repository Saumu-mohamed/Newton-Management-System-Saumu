import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Download, TrendingUp, Award, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/export-utils";
import { getStudentResults } from "@/services/studentDashboardService";

const gradeBadgeClassMap = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800"
};

const ResultsPage = () => {
  const [resultsView, setResultsView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("");

  const loadResults = async (semester = "") => {
    try {
      setLoading(true);
      const data = await getStudentResults(semester ? { semester } : {});
      setResultsView(data);
      setSelectedSemester(data?.summary?.selectedSemester || "");
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load results."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const summary = resultsView?.summary || {
    currentGpa: 0,
    cgpa: 0,
    totalCredits: 0,
    classStanding: "N/A",
    selectedSemester: ""
  };
  const currentResults = resultsView?.currentResults || [];
  const academicHistory = resultsView?.academicHistory || [];
  const semesterOptions = resultsView?.semesterOptions || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Results</h1>
          <p className="text-muted-foreground">View your academic performance and grades</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedSemester}
            onValueChange={(value) => {
              setSelectedSemester(value);
              loadResults(value);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => exportToPDF({
              data: currentResults,
              filename: "result-slip",
              title: `Results - ${summary.selectedSemester || "Current Semester"}`
            })}
          >
            <Download className="w-4 h-4 mr-2" />
            Result Slip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current GPA</p>
                <p className="text-2xl font-bold">{Number(summary.currentGpa || 0).toFixed(2)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Backend-calculated semester GPA
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CGPA</p>
                <p className="text-2xl font-bold">{Number(summary.cgpa || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Cumulative</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{summary.totalCredits || 0}</p>
                <p className="text-xs text-muted-foreground">Earned so far</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Class Standing</p>
                <p className="text-2xl font-bold">{summary.classStanding || "N/A"}</p>
                <p className="text-xs text-muted-foreground">Backend-derived classification</p>
              </div>
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{summary.selectedSemester || "Current Semester"} Results</CardTitle>
          <CardDescription>Detailed breakdown of your semester performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-sm text-muted-foreground">Loading results...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Code</TableHead>
                  <TableHead>Unit Name</TableHead>
                  <TableHead className="text-center">CAT</TableHead>
                  <TableHead className="text-center">Exam</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.unit}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell className="text-center">{result.cat}</TableCell>
                    <TableCell className="text-center">{result.exam}</TableCell>
                    <TableCell className="text-center font-bold">{result.total}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={gradeBadgeClassMap[result.grade] || "bg-gray-100 text-gray-800"}>
                        {result.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{Number(result.points || 0).toFixed(1)}</TableCell>
                  </TableRow>
                ))}
                {!currentResults.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      No results found for the selected semester.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic History</CardTitle>
          <CardDescription>Your performance across all semesters</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead className="text-center">Credits</TableHead>
                <TableHead className="text-center">GPA</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicHistory.map((semester) => (
                <TableRow key={semester.semester}>
                  <TableCell className="font-medium">{semester.semester}</TableCell>
                  <TableCell className="text-center">{semester.credits}</TableCell>
                  <TableCell className="text-center font-semibold">{Number(semester.gpa || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={semester.status === "Selected" ? "default" : "secondary"}>
                      {semester.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!academicHistory.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    No academic history is available yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;
