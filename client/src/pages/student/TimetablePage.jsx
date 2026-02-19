import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, BookOpen, Download, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const TimetablePage = () => {
  const weekSchedule = [
  { day: "Monday", classes: [
    { time: "8:00 - 10:00", unit: "CS301", name: "Database Systems", lecturer: "Dr. John Smith", room: "Lab 2", type: "Lecture" },
    { time: "10:00 - 12:00", unit: "CS304", name: "Operating Systems", lecturer: "Dr. Sarah Brown", room: "LT1", type: "Lecture" }]
  },
  { day: "Tuesday", classes: [
    { time: "10:00 - 12:00", unit: "CS302", name: "Software Engineering", lecturer: "Prof. Jane Doe", room: "LT3", type: "Lecture" },
    { time: "14:00 - 16:00", unit: "CS303", name: "Computer Networks", lecturer: "Dr. Mike Wilson", room: "Lab 1", type: "Practical" }]
  },
  { day: "Wednesday", classes: [
    { time: "8:00 - 11:00", unit: "CS303", name: "Computer Networks", lecturer: "Dr. Mike Wilson", room: "LT2", type: "Lecture" },
    { time: "10:00 - 12:00", unit: "CS304", name: "Operating Systems", lecturer: "Dr. Sarah Brown", room: "Lab 3", type: "Practical" }]
  },
  { day: "Thursday", classes: [
    { time: "10:00 - 12:00", unit: "CS302", name: "Software Engineering", lecturer: "Prof. Jane Doe", room: "Lab 2", type: "Practical" },
    { time: "14:00 - 16:00", unit: "CS301", name: "Database Systems", lecturer: "Dr. John Smith", room: "LT1", type: "Tutorial" }]
  },
  { day: "Friday", classes: [
    { time: "8:00 - 10:00", unit: "GEN101", name: "Communication Skills", lecturer: "Ms. Emily Davis", room: "LT4", type: "Lecture" },
    { time: "14:00 - 16:00", unit: "CS301", name: "Database Systems", lecturer: "Dr. John Smith", room: "Lab 2", type: "Practical" }]
  }];
  const upcomingExams = [
  { date: "Feb 15", unit: "CS301", name: "Database Systems", time: "9:00 AM", venue: "Main Hall" },
  { date: "Feb 17", unit: "CS302", name: "Software Engineering", time: "2:00 PM", venue: "LT1" },
  { date: "Feb 19", unit: "CS303", name: "Computer Networks", time: "9:00 AM", venue: "Main Hall" },
  { date: "Feb 21", unit: "CS304", name: "Operating Systems", time: "2:00 PM", venue: "LT2" }];
  const getTypeBadge = (type) => {
    const colors = {
      "Lecture": "bg-blue-100 text-blue-800",
      "Practical": "bg-green-100 text-green-800",
      "Tutorial": "bg-purple-100 text-purple-800"
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
            Semester 1, 2024
          </Badge>
          <Button variant="outline" onClick={() => toast({ title: "Download", description: "Downloading timetable PDF..." })}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-4">
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
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
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
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Exam Schedule */}
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
                {upcomingExams.map((exam, idx) =>
                <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[45px]">
                        <p className="text-xs text-red-600">{exam.date.split(" ")[0]}</p>
                        <p className="text-lg font-bold text-red-700">{exam.date.split(" ")[1]}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{exam.unit}</p>
                        <p className="text-xs text-muted-foreground">{exam.name}</p>
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
              </div>
            </CardContent>
          </Card>
          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Classes</span>
                  <span className="font-bold">10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lectures</span>
                  <span className="font-bold">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Practicals</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tutorials</span>
                  <span className="font-bold">1</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-bold">20 hrs</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Class Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Lecture</Badge>
                  <span className="text-sm text-muted-foreground">Theory classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Practical</Badge>
                  <span className="text-sm text-muted-foreground">Lab sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Tutorial</Badge>
                  <span className="text-sm text-muted-foreground">Discussion classes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
};
export default TimetablePage;