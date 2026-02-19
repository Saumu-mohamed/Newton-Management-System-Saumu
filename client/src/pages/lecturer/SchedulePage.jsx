import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, BookOpen, Users } from "lucide-react";
const SchedulePage = () => {
  const weekSchedule = [
  { day: "Monday", classes: [
    { time: "8:00 - 10:00", unit: "CS101", name: "Introduction to Programming", room: "LT1", students: 45 },
    { time: "14:00 - 16:00", unit: "CS301", name: "Database Systems", room: "Lab 2", students: 32 }]
  },
  { day: "Tuesday", classes: [
    { time: "10:00 - 12:00", unit: "CS201", name: "Data Structures", room: "LT3", students: 38 }]
  },
  { day: "Wednesday", classes: [
    { time: "8:00 - 10:00", unit: "IT102", name: "Web Development", room: "Lab 1", students: 50 },
    { time: "14:00 - 16:00", unit: "CS101", name: "Introduction to Programming", room: "LT1", students: 45 }]
  },
  { day: "Thursday", classes: [
    { time: "10:00 - 12:00", unit: "CS201", name: "Data Structures", room: "LT3", students: 38 }]
  },
  { day: "Friday", classes: [
    { time: "8:00 - 10:00", unit: "IT102", name: "Web Development", room: "Lab 1", students: 50 },
    { time: "14:00 - 16:00", unit: "CS301", name: "Database Systems", room: "Lab 2", students: 32 }]
  }];
  const upcomingEvents = [
  { date: "Jan 20", event: "CAT 1 - CS101", type: "exam" },
  { date: "Jan 22", event: "Assignment Due - CS201", type: "assignment" },
  { date: "Jan 25", event: "Grades Submission Deadline", type: "deadline" },
  { date: "Jan 28", event: "Department Meeting", type: "meeting" }];
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
          Semester 1, 2024
        </Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-4">
          {weekSchedule.map((day) =>
          <Card key={day.day}>
              <CardHeader className="py-3">
                <CardTitle className="text-lg">{day.day}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                {day.classes.length > 0 ?
              <div className="space-y-3">
                    {day.classes.map((cls, idx) =>
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
        </div>
        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, idx) =>
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs text-muted-foreground">{event.date.split(" ")[0]}</p>
                      <p className="text-lg font-bold">{event.date.split(" ")[1]}</p>
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
          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Classes</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Teaching Hours</span>
                  <span className="font-bold">16 hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Students Taught</span>
                  <span className="font-bold">165</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending Grades</span>
                  <span className="font-bold text-yellow-600">2 units</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
};
export default SchedulePage;