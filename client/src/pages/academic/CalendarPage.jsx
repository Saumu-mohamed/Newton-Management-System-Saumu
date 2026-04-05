import { useEffect, useMemo, useState } from 'react';
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
import { exportToCSV } from '@/lib/export-utils';
import { createAcademicEvent, getAcademicCalendar } from '@/services/academicService';

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
  value === 'Meeting' ? 'secondary' : 'outline'
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const data = await getAcademicCalendar();
      setEvents(data.events || []);
    } catch (error) {
      toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load academic calendar.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const upcomingEvents = useMemo(() => events.filter((event) => event.status === 'Upcoming'), [events]);
  const completedEvents = useMemo(() => events.filter((event) => event.status === 'Completed'), [events]);
  const progress = events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0;

  const handleQuickAdd = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    await createAcademicEvent({
      title: `Academic Review ${startDate.toISOString().split('T')[0]}`,
      type: 'meeting',
      startDate: startDate.toISOString(),
      location: 'Senate Boardroom',
      description: 'Generated from academic calendar page.'
    });
    toast.success('Academic Event Created', { description: 'A new upcoming event has been added.' });
    await loadCalendar();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">Live academic event schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV({ data: events, filename: 'academic-calendar' })}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleQuickAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Semester Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{completedEvents.length} completed of {events.length} events</span>
              <span className="text-muted-foreground">{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{events.length}</p><p className="text-xs text-muted-foreground">Total Events</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Clock className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{upcomingEvents.length}</p><p className="text-xs text-muted-foreground">Upcoming</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold">{completedEvents.length}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><AlertCircle className="h-5 w-5 text-destructive" /></div><div><p className="text-2xl font-bold">{events.filter((event) => event.type === 'Exam').length}</p><p className="text-xs text-muted-foreground">Exam Periods</p></div></div></CardContent></Card>
      </div>

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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="py-8 text-sm text-muted-foreground">Loading calendar...</div> :
          <DataTable columns={calendarColumns} data={events} searchPlaceholder="Search events..." pageSize={10} />}
        </CardContent>
      </Card>
    </div>);
}
