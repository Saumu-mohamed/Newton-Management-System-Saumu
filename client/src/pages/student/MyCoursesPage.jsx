import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, User, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const MyCoursesPage = () => {
  const registeredUnits = [
  { code: "CS301", name: "Database Systems", lecturer: "Dr. John Smith", credits: 3, attendance: 85, status: "active", schedule: "Mon, Fri 14:00-16:00" },
  { code: "CS302", name: "Software Engineering", lecturer: "Prof. Jane Doe", credits: 3, attendance: 92, status: "active", schedule: "Tue, Thu 10:00-12:00" },
  { code: "CS303", name: "Computer Networks", lecturer: "Dr. Mike Wilson", credits: 3, attendance: 78, status: "active", schedule: "Wed 8:00-11:00" },
  { code: "CS304", name: "Operating Systems", lecturer: "Dr. Sarah Brown", credits: 3, attendance: 88, status: "active", schedule: "Mon, Wed 10:00-12:00" },
  { code: "GEN101", name: "Communication Skills", lecturer: "Ms. Emily Davis", credits: 2, attendance: 95, status: "active", schedule: "Fri 8:00-10:00" }];
  const semesterProgress = {
    currentWeek: 8,
    totalWeeks: 14,
    unitsRegistered: 5,
    totalCredits: 14,
    averageAttendance: 88
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">View your registered units and course materials</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          Semester 1, 2024
        </Badge>
      </div>
      {/* Semester Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Semester Progress</CardTitle>
          <CardDescription>Week {semesterProgress.currentWeek} of {semesterProgress.totalWeeks}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Semester Progress</span>
                <span>{Math.round(semesterProgress.currentWeek / semesterProgress.totalWeeks * 100)}%</span>
              </div>
              <Progress value={semesterProgress.currentWeek / semesterProgress.totalWeeks * 100} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{semesterProgress.unitsRegistered}</p>
                <p className="text-sm text-muted-foreground">Units Registered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{semesterProgress.totalCredits}</p>
                <p className="text-sm text-muted-foreground">Credit Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{semesterProgress.averageAttendance}%</p>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Registered Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registeredUnits.map((unit) =>
        <Card key={unit.code} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {unit.code}
                  </CardTitle>
                  <CardDescription>{unit.name}</CardDescription>
                </div>
                <Badge variant="default">{unit.credits} CR</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{unit.lecturer}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{unit.schedule}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      {unit.attendance >= 80 ?
                    <CheckCircle className="w-4 h-4 text-green-600" /> :
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    }
                      Attendance
                    </span>
                    <span className={unit.attendance >= 80 ? "text-green-600" : "text-yellow-600"}>
                      {unit.attendance}%
                    </span>
                  </div>
                  <Progress value={unit.attendance} className="h-2" />
                </div>
                <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => toast({ title: "Course Materials", description: `Opening materials for ${unit.code}...` })}>
                  View Materials
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Registration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Registration Status</p>
                <Badge className="bg-green-100 text-green-800 mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium">Jan 5, 2024</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Min Required Attendance</p>
                <p className="font-medium">75%</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => toast({ title: "Download", description: "Downloading registration slip..." })}>
              Download Registration Slip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default MyCoursesPage;