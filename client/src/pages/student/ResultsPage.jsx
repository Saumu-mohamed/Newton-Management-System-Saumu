import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Download, TrendingUp, Award, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const ResultsPage = () => {
  const currentResults = [
  { code: "CS301", name: "Database Systems", cat1: 25, cat2: 23, assignment: 8, exam: 52, total: 78, grade: "B", points: 3.0 },
  { code: "CS302", name: "Software Engineering", cat1: 28, cat2: 26, assignment: 9, exam: 58, total: 85, grade: "A", points: 4.0 },
  { code: "CS303", name: "Computer Networks", cat1: 22, cat2: 20, assignment: 7, exam: 48, total: 70, grade: "B", points: 3.0 },
  { code: "CS304", name: "Operating Systems", cat1: 26, cat2: 24, assignment: 8, exam: 55, total: 80, grade: "A", points: 4.0 },
  { code: "GEN101", name: "Communication Skills", cat1: 27, cat2: 25, assignment: 9, exam: 56, total: 82, grade: "A", points: 4.0 }];
  const semesterSummary = [
  { semester: "Year 1 Sem 1", gpa: 3.45, credits: 15, status: "Completed" },
  { semester: "Year 1 Sem 2", gpa: 3.52, credits: 15, status: "Completed" },
  { semester: "Year 2 Sem 1", gpa: 3.68, credits: 16, status: "Completed" },
  { semester: "Year 2 Sem 2", gpa: 3.55, credits: 15, status: "Completed" },
  { semester: "Year 3 Sem 1", gpa: 3.62, credits: 14, status: "In Progress" }];
  const getGradeBadge = (grade) => {
    const colors = {
      "A": "bg-green-100 text-green-800",
      "B": "bg-blue-100 text-blue-800",
      "C": "bg-yellow-100 text-yellow-800",
      "D": "bg-orange-100 text-orange-800",
      "E": "bg-red-100 text-red-800"
    };
    return <Badge className={colors[grade] || "bg-gray-100 text-gray-800"}>{grade}</Badge>;
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Results</h1>
          <p className="text-muted-foreground">View your academic performance and grades</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="sem1-2024">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sem1-2024">Year 3 Sem 1</SelectItem>
              <SelectItem value="sem2-2023">Year 2 Sem 2</SelectItem>
              <SelectItem value="sem1-2023">Year 2 Sem 1</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => toast({ title: "Download", description: "Downloading result slip..." })}>
            <Download className="w-4 h-4 mr-2" />
            Result Slip
          </Button>
        </div>
      </div>
      {/* Academic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current GPA</p>
                <p className="text-2xl font-bold">3.62</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +0.07 from last sem
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
                <p className="text-2xl font-bold">3.56</p>
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
                <p className="text-2xl font-bold">75</p>
                <p className="text-xs text-muted-foreground">of 120 required</p>
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
                <p className="text-2xl font-bold">2nd Class</p>
                <p className="text-xs text-muted-foreground">Upper Division</p>
              </div>
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Current Semester Results */}
      <Card>
        <CardHeader>
          <CardTitle>Year 3 Semester 1 Results</CardTitle>
          <CardDescription>Detailed breakdown of your current semester performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Code</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead className="text-center">CAT 1 (30)</TableHead>
                <TableHead className="text-center">CAT 2 (30)</TableHead>
                <TableHead className="text-center">Assignment (10)</TableHead>
                <TableHead className="text-center">Exam (30)</TableHead>
                <TableHead className="text-center">Total (100)</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentResults.map((result) =>
              <TableRow key={result.code}>
                  <TableCell className="font-medium">{result.code}</TableCell>
                  <TableCell>{result.name}</TableCell>
                  <TableCell className="text-center">{result.cat1}</TableCell>
                  <TableCell className="text-center">{result.cat2}</TableCell>
                  <TableCell className="text-center">{result.assignment}</TableCell>
                  <TableCell className="text-center">{result.exam}</TableCell>
                  <TableCell className="text-center font-bold">{result.total}</TableCell>
                  <TableCell className="text-center">{getGradeBadge(result.grade)}</TableCell>
                  <TableCell className="text-center">{result.points.toFixed(1)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Semester History */}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesterSummary.map((sem) =>
              <TableRow key={sem.semester}>
                  <TableCell className="font-medium">{sem.semester}</TableCell>
                  <TableCell className="text-center">{sem.credits}</TableCell>
                  <TableCell className="text-center font-semibold">{sem.gpa.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={sem.status === "Completed" ? "default" : "secondary"}>
                      {sem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "View Results", description: `Opening results for ${sem.semester}...` })}>
                      View Details
                    </Button>
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