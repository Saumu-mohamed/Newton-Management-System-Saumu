import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { toast } from 'sonner';

const studentSchema = z.object({
  regNo: z.string().min(5, 'Registration number is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  course: z.string().min(1, 'Course is required'),
  year: z.number().min(1).max(6),
  campus: z.string().min(1, 'Campus is required'),
  status: z.enum(['Active', 'Probation', 'Suspended', 'Graduated'])
});

export function AddStudentModal({ open, onOpenChange, onAdd, courses = [], campuses = [] }) {
  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      regNo: '',
      name: '',
      email: '',
      course: '',
      year: 1,
      campus: '',
      status: 'Active'
    }
  });
  const onSubmit = (data) => {
    onAdd({
      regNo: data.regNo,
      name: data.name,
      email: data.email,
      course: data.course,
      year: data.year,
      campus: data.campus,
      status: data.status
    });
    toast.success('Student Added', { description: `${data.name} has been enrolled successfully.` });
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="regNo">Registration No.</Label>
                <Input id="regNo" {...form.register('regNo')} placeholder="CS/2024/XXX" />
                {form.formState.errors.regNo &&
                <p className="text-xs text-destructive">{form.formState.errors.regNo.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register('name')} placeholder="Enter full name" />
                {form.formState.errors.name &&
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                }
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} placeholder="student@cms.edu" />
              {form.formState.errors.email &&
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              }
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Course</Label>
                <Select onValueChange={(value) => form.setValue('course', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) =>
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.course &&
                <p className="text-xs text-destructive">{form.formState.errors.course.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label>Year</Label>
                <Select defaultValue="1" onValueChange={(value) => form.setValue('year', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((y) =>
                    <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Campus</Label>
                <Select onValueChange={(value) => form.setValue('campus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) =>
                    <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.campus &&
                <p className="text-xs text-destructive">{form.formState.errors.campus.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select defaultValue="Active" onValueChange={(value) => form.setValue('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Probation">Probation</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
