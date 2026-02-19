import { DataTable } from '@/components/dashboard/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Download } from
'lucide-react';
const academicCalendar = [
{ id: 1, event: 'Semester 2 Begins', date: '2024-01-08', endDate: null, type: 'Academic', status: 'Completed' },
{ id: 2, event: 'Late Registration Deadline', date: '2024-01-22', endDate: null, type: 'Deadline', status: 'Completed' },
{ id: 3, event: 'CAT 1 Examinations', date: '2024-02-12', endDate: '2024-02-16', type: 'Exam', status: 'Completed' },
{ id: 4, event: 'Mid-Semester Break', date: '2024-03-11', endDate: '2024-03-15', type: 'Holiday', status: 'Upcoming' },
{ id: 5, event: 'CAT 2 Examinations', date: '2024-03-25', endDate: '2024-03-29', type: 'Exam', status: 'Upcoming' },
{ id: 6, event: 'Fee Payment Deadline', date: '2024-04-05', endDate: null, type: 'Deadline', status: 'Upcoming' },
{ id: 7, event: 'Last Day of Classes', date: '2024-04-26', endDate: null, type: 'Academic', status: 'Upcoming' },
{ id: 8, event: 'Final Examinations', date: '2024-05-06', endDate: '2024-05-24', type: 'Exam', status: 'Upcoming' },
{ id: 9, event: 'Semester 2 Ends', date: '2024-05-24', endDate: null, type: 'Academic', status: 'Upcoming' },
{ id: 10, event: 'Graduation Ceremony', date: '2024-06-14', endDate: null, type: 'Event', status: 'Upcoming' }];
const calendarColumns = [
{ key: 'event', label: 'Event', sortable: true },
{ key: 'date', label: 'Start Date', sortable: true },
{
  key: 'endDate',
  label: 'End Date',
  render: (value) => value || '-'
},
{
  key: 'type',
  label: 'Type',
  render: (value) =>
  <Badge variant={
  value === 'Exam' ? 'destructive' :
  value === 'Deadline' ? 'default' :
  value === 'Holiday' ? 'secondary' : 'outline'
  }>
        {value}
      </Badge>
},
{
  key: 'status',
  label: 'Status',
  render: (value) =>
  <Badge variant={value === 'Completed' ? 'secondary' : 'default'} className="gap-1">
        {value === 'Completed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
        {value}
      </Badge>
}];
export default function CalendarPage() {
  const upcomingEvents = academicCalendar.filter((e) => e.status === 'Upcoming');
  const completedEvents = academicCalendar.filter((e) => e.status === 'Completed');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">Semester 2, 2023/2024 Academic Year</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Exporting', { description: 'Exporting calendar...' })}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => toast.info('Add Event', { description: 'Event form coming soon' })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
      {/* Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Semester Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Week 10 of 18</span>
              <span className="text-muted-foreground">55% complete</span>
            </div>
            <Progress value={55} className="h-2" />
          </div>
        </CardContent>
      </Card>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{academicCalendar.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedEvents.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{academicCalendar.filter((e) => e.type === 'Exam').length}</p>
                <p className="text-xs text-muted-foreground">Exam Periods</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event) =>
            <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{event.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.date} {event.endDate && `- ${event.endDate}`}
                    </p>
                  </div>
                </div>
                <Badge variant={
              event.type === 'Exam' ? 'destructive' :
              event.type === 'Deadline' ? 'default' : 'outline'
              }>
                  {event.type}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={calendarColumns}
            data={academicCalendar}
            searchPlaceholder="Search events..."
            pageSize={10} />
        </CardContent>
      </Card>
    </div>);
}