import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
import { getLecturerClasses } from "@/services/lecturerOperationsService";

const SchedulePage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await getLecturerClasses();
      setClasses(response.classes || []);
    } catch (error) {
      toast.error("Load Failed", {
        description: error?.response?.data?.message || "Failed to load lecturer schedule."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const weekSchedule = useMemo(() => {
    const grouped = new Map();
    classes.forEach((cls) => {
      const [day = 'TBA', time = 'TBA'] = String(cls.schedule || 'TBA').split(' ');
      if (!grouped.has(day)) {
        grouped.set(day, { day, classes: [] });
      }
      grouped.get(day).classes.push({
        time,
        unit: cls.code,
        name: cls.name,
        room: cls.room,
        students: cls.students
      });
    });
    return Array.from(grouped.values());
  }, [classes]);

  const upcomingEvents = classes.slice(0, 4).map((cls, index) => ({
    date: `Week ${index + 1}`,
    event: `${cls.code} gradebook check`,
    type: index % 2 === 0 ? "deadline" : "meeting"
  }));

  const getEventBadge = (type) => {
    switch (type) {
      case "exam":
        return <Badge className="bg-red-100 text-red-800">Exam</Badge>;
      case "assignment":
        return <Badge className="bg-blue-100 text-blue-800">Assignment</Badge>;
      case "deadline":
        return <Badge className="bg-yellow-100 text-yellow-800">Deadline</Badge>;
      case "meeting":
        return <Badge className="bg-purple-100 text-purple-800">Meeting</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Schedule</h1>
          <p className="text-muted-foreground">Weekly timetable and upcoming events</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          {classes[0]?.semester || 'Current Semester'}
        </Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading && <Card><CardContent className="py-8 text-sm text-muted-foreground">Loading schedule...</CardContent></Card>}
          {weekSchedule.map((day) =>
          <Card key={day.day}>
              <CardHeader className="py-3">
                <CardTitle className="text-lg">{day.day}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                {day.classes.length > 0 ?
              <div className="space-y-3">
                    {day.classes.map((cls, idx) =>
                <div key={`${cls.unit}-${idx}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[80px]">
                            <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                            <p className="text-xs font-medium">{cls.time}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{cls.unit}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{cls.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{cls.room}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{cls.students} students</span>
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
          <Card><CardContent className="py-8 text-sm text-muted-foreground">No lecturer schedule was returned by the backend.</CardContent></Card>}
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Important dates and teaching milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, idx) =>
                <div key={`${event.event}-${idx}`} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.event}</p>
                      {getEventBadge(event.type)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Classes</span>
                  <span className="font-bold">{classes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Teaching Hours</span>
                  <span className="font-bold">{classes.length * 2} hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Students Taught</span>
                  <span className="font-bold">{classes.reduce((sum, cls) => sum + Number(cls.students || 0), 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
};

export default SchedulePage;
