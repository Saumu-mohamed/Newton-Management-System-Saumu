import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Building2, MapPin, Users, GraduationCap, Phone, Mail, Calendar } from 'lucide-react';
export function ViewCampusModal({ open, onOpenChange, campus }) {
  if (!campus) return null;
  const capacityPercent = Math.round(campus.students / campus.capacity * 100);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Campus Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{campus.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {campus.location}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant={campus.status === 'Active' ? 'default' : 'secondary'}>
                  {campus.status}
                </Badge>
                <Badge variant="outline">Est. {campus.established}</Badge>
              </div>
            </div>
          </div>
          <Separator />
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{campus.students.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">{campus.staff}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
            </div>
          </div>
          {/* Capacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Campus Capacity</span>
              <span className="font-medium">{campus.students.toLocaleString()} / {campus.capacity.toLocaleString()} ({capacityPercent}%)</span>
            </div>
            <Progress value={capacityPercent} className="h-2" />
          </div>
          <Separator />
          {/* Contact Details */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{campus.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{campus.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Established</p>
                <p className="text-sm font-medium">{campus.established}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
}