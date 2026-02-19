import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  UserCog } from
'lucide-react';
export function ViewDepartmentModal({ open, onOpenChange, department }) {
  if (!department) return null;
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'inactive':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'under review':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-2">
          <DialogTitle>Department Details</DialogTitle>
          <DialogDescription>
            Complete information about this department
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Department Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={getStatusColor(department.status)}>
                  {department.status}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{department.name}</h3>
              <p className="text-sm text-muted-foreground">{department.faculty}</p>
            </div>
          </div>
          <Separator />
          {/* Department Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-200/50">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{department.students}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-200/50">
              <UserCog className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{department.lecturers}</p>
              <p className="text-xs text-muted-foreground">Lecturers</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-200/50">
              <BookOpen className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{department.courses}</p>
              <p className="text-xs text-muted-foreground">Courses</p>
            </div>
          </div>
          {/* Department Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Leadership
            </h4>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Head of Department</p>
                <p className="text-sm font-medium">{department.head}</p>
              </div>
            </div>
          </div>
          {department.description &&
          <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                About
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {department.description}
              </p>
            </div>
          }
        </div>
      </DialogContent>
    </Dialog>);
}