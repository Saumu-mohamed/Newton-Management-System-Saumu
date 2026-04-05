import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, BookOpen, Download, User } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF } from "@/lib/export-utils";
import { getStudentDashboard } from "@/services/studentDashboardService";

const TimetablePage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getStudentDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load timetable."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const registeredUnits = dashboard?.registeredUnits || [];
  const weekSchedule = useMemo(() => {
    const grouped = new Map();
    registeredUnits.forEach((unit) => {
      const dayLabel = unit.day || 'TBA';
      if (!grouped.has(dayLabel)) {
        grouped.set(dayLabel, { day: dayLabel, classes: [] });
      }
      grouped.get(dayLabel).classes.push({
        time: unit.time,
        unit: unit.code,
        name: unit.name,
        lecturer: unit.lecturer,
        room: unit.room,
        type: 'Lecture'
      });
    });
    return Array.from(grouped.values());
  }, [registeredUnits]);
  const upcomingExams = dashboard?.examSchedule || [];

  const getTypeBadge = (type) => {
    const colors = {
      Lecture: "bg-blue-100 text-blue-800",
      Practical: "bg-green-100 text-green-800",
      Tutorial: "bg-purple-100 text-purple-800"
    };
    return <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>{type}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
          <p className="text-muted-foreground">Weekly class schedule and exam dates</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {registeredUnits[0]?.semester || 'Current Semester'}
          </Badge>
          <Button variant="outline" onClick={() => exportToPDF({ data: registeredUnits, filename: 'timetable', title: 'Student Timetable' })}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading && <Card><CardContent className="py-8 text-sm text-muted-foreground">Loading timetable...</CardContent></Card>}
          {weekSchedule.map((day) =>
          <Card key={day.day}>
              <CardHeader className="py-3 bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {day.day}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                {day.classes.length > 0 ?
              <div className="space-y-3">
                    {day.classes.map((cls, idx) =>
                <div key={`${cls.unit}-${idx}`} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[90px] p-2 bg-primary/10 rounded">
                            <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                            <p className="text-xs font-medium">{cls.time}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{cls.unit}</span>
                              {getTypeBadge(cls.type)}
                            </div>
                            <p className="text-sm text-muted-foreground">{cls.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="w-3 h-3" />
                              {cls.lecturer}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{cls.room}</span>
                          </div>
                        </div>
                      </div>
                )}
                  </div> :
              <p className="text-sm text-muted-foreground text-center py-4">No classes scheduled</p>
              }
              </CardContent>
            </Card>
          )}
          {!loading && !weekSchedule.length &&
          <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">No timetable entries were returned by the backend.</CardContent>
            </Card>
          }
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-red-600" />
                Upcoming Exams
              </CardTitle>
              <CardDescription>End of semester examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingExams.map((exam) =>
                <div key={exam.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[45px]">
                        <p className="text-xs text-red-600">{exam.date}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{exam.unit}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exam.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {exam.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {!upcomingExams.length && <div className="text-sm text-muted-foreground">No upcoming exams returned by the backend.</div>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Classes</span>
                  <span className="font-bold">{registeredUnits.length}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-bold">{registeredUnits.length * 2} hrs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
};

export default TimetablePage;
