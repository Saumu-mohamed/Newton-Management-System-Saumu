import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Download, TrendingUp, Award, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/export-utils";
import { getStudentDashboard } from "@/services/studentDashboardService";

const ResultsPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getStudentDashboard();
      setDashboard(data);
      if (!selectedSemester && data?.gpaProgress?.length) {
        setSelectedSemester(data.gpaProgress[data.gpaProgress.length - 1].semester);
      }
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load results."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const recentResults = dashboard?.recentResults || [];
  const semesterSummary = dashboard?.gpaProgress || [];
  const semesterOptions = semesterSummary.map((item) => item.semester);
  const currentResults = useMemo(() => recentResults.filter((result) => !selectedSemester || result.semester === selectedSemester), [recentResults, selectedSemester]);
  const latestSemester = semesterSummary.find((item) => item.semester === selectedSemester) || semesterSummary[semesterSummary.length - 1];
  const currentGpa = latestSemester?.gpa || 0;
  const cgpa = dashboard?.summary?.currentCgpa || 0;
  const totalCredits = dashboard?.summary?.totalCredits || 0;

  const getGradeBadge = (grade) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[grade] || "bg-gray-100 text-gray-800"}>{grade}</Badge>;
  };

  const classStanding = cgpa >= 3.5 ? "First Class" : cgpa >= 3.0 ? "2nd Class Upper" : cgpa >= 2.5 ? "2nd Class Lower" : "Pass";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Results</h1>
          <p className="text-muted-foreground">View your academic performance and grades</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((semester) =>
              <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportToPDF({ data: currentResults, filename: 'result-slip', title: `Results - ${selectedSemester}` })}>
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
                <p className="text-2xl font-bold">{currentGpa.toFixed(2)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Latest semester performance
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
                <p className="text-2xl font-bold">{cgpa.toFixed(2)}</p>
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
                <p className="text-2xl font-bold">{totalCredits}</p>
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
                <p className="text-2xl font-bold">{classStanding}</p>
                <p className="text-xs text-muted-foreground">Derived from CGPA</p>
              </div>
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedSemester || 'Current Semester'} Results</CardTitle>
          <CardDescription>Detailed breakdown of your semester performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="py-10 text-sm text-muted-foreground">Loading results...</div> :
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
                {currentResults.map((result) =>
                <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.unit}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell className="text-center">{result.cat}</TableCell>
                    <TableCell className="text-center">{result.exam}</TableCell>
                    <TableCell className="text-center font-bold">{result.total}</TableCell>
                    <TableCell className="text-center">{getGradeBadge(result.grade)}</TableCell>
                    <TableCell className="text-center">{result.points.toFixed(1)}</TableCell>
                  </TableRow>
                )}
                {!currentResults.length &&
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      No results found for the selected semester.
                    </TableCell>
                  </TableRow>
                }
              </TableBody>
            </Table>
          }
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
              {semesterSummary.map((semester) =>
              <TableRow key={semester.semester}>
                  <TableCell className="font-medium">{semester.semester}</TableCell>
                  <TableCell className="text-center">{semester.credits}</TableCell>
                  <TableCell className="text-center font-semibold">{semester.gpa.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={semester.semester === selectedSemester ? "default" : "secondary"}>
                      {semester.semester === selectedSemester ? "Selected" : "Completed"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);
};

export default ResultsPage;
