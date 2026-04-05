import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, User, CheckCircle, AlertTriangle, Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/export-utils";
import { getStudentDashboard } from "@/services/studentDashboardService";

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getStudentDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load registered courses."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const registeredUnits = dashboard?.registeredUnits || [];
  const summary = dashboard?.summary || {};
  const semesterProgress = useMemo(() => ({
    currentWeek: Math.min(12, Math.max(1, registeredUnits.length + 3)),
    totalWeeks: 14,
    unitsRegistered: summary.registeredUnitsCount || registeredUnits.length,
    totalCredits: registeredUnits.reduce((sum, unit) => sum + Number(unit.credits || 0), 0),
    averageAttendance: registeredUnits.length ? 82 : 0
  }), [registeredUnits, summary]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">View your registered units and current semester load</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          {registeredUnits[0]?.semester || 'Current Semester'}
        </Badge>
      </div>

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
                <p className="text-sm text-muted-foreground">Estimated Attendance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registeredUnits.map((unit) =>
        <Card key={unit.id} className="hover:shadow-lg transition-shadow">
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
                  <span>{unit.day}, {unit.time}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      {unit.status === 'Active' ?
                    <CheckCircle className="w-4 h-4 text-green-600" /> :
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    }
                      Registration
                    </span>
                    <span className={unit.status === 'Active' ? "text-green-600" : "text-yellow-600"}>
                      {unit.status}
                    </span>
                  </div>
                  <Progress value={unit.status === 'Active' ? 100 : 60} className="h-2" />
                </div>
                <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/timetable')}>
                  View Timetable
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {!loading && !registeredUnits.length &&
        <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-sm text-muted-foreground">
              No registered units were returned by the backend.
            </CardContent>
          </Card>
        }
      </div>

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
                <p className="font-medium">{registeredUnits[0]?.semester || 'Current Semester'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Min Required Attendance</p>
                <p className="font-medium">75%</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => exportToPDF({ data: registeredUnits, filename: 'registration-slip', title: 'Registration Slip' })}>
              <Download className="w-4 h-4 mr-2" />
              Download Registration Slip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
};

export default MyCoursesPage;
