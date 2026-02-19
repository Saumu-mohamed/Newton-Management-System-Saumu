import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School, Users, Clock, BookOpen, Calendar, Eye, ClipboardList } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const MyClassesPage = () => {
  const classes = [
  { id: 1, code: "CS101", name: "Introduction to Programming", program: "Computer Science", year: 1, students: 45, schedule: "Mon, Wed 8:00-10:00", room: "LT1", semester: "Sem 1 2024" },
  { id: 2, code: "CS201", name: "Data Structures", program: "Computer Science", year: 2, students: 38, schedule: "Tue, Thu 10:00-12:00", room: "LT3", semester: "Sem 1 2024" },
  { id: 3, code: "CS301", name: "Database Systems", program: "Computer Science", year: 3, students: 32, schedule: "Mon, Fri 14:00-16:00", room: "Lab 2", semester: "Sem 1 2024" },
  { id: 4, code: "IT102", name: "Web Development", program: "Information Technology", year: 1, students: 50, schedule: "Wed, Fri 8:00-10:00", room: "Lab 1", semester: "Sem 1 2024" }];
  const stats = [
  { title: "Total Classes", value: "4", icon: School, color: "text-blue-600" },
  { title: "Total Students", value: "165", icon: Users, color: "text-green-600" },
  { title: "Weekly Hours", value: "16", icon: Clock, color: "text-purple-600" },
  { title: "Active Semester", value: "Sem 1", icon: Calendar, color: "text-orange-600" }];
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
          <p className="text-muted-foreground">View and manage your assigned classes</p>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) =>
        <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) =>
        <Card key={cls.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {cls.code}
                  </CardTitle>
                  <CardDescription className="mt-1">{cls.name}</CardDescription>
                </div>
                <Badge>{cls.semester}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Program:</span>
                  <span className="font-medium">{cls.program}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-medium">Year {cls.year}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cls.students}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="font-medium">{cls.schedule}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Room:</span>
                  <span className="font-medium">{cls.room}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast({ title: "View Students", description: `Opening class list for ${cls.code}...` })}>
                    <Eye className="w-4 h-4 mr-1" />
                    View Students
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => toast({ title: "Enter Grades", description: `Opening grading for ${cls.code}...` })}>
                    <ClipboardList className="w-4 h-4 mr-1" />
                    Enter Grades
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Classes Table View */}
      <Card>
        <CardHeader>
          <CardTitle>All Classes Summary</CardTitle>
          <CardDescription>Quick overview of all your assigned classes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) =>
              <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.code}</TableCell>
                  <TableCell>{cls.name}</TableCell>
                  <TableCell>{cls.program}</TableCell>
                  <TableCell>Year {cls.year}</TableCell>
                  <TableCell>{cls.students}</TableCell>
                  <TableCell>{cls.schedule}</TableCell>
                  <TableCell>{cls.room}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);
};
export default MyClassesPage;