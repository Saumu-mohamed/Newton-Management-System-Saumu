import { useEffect } from 'react';
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

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  status: z.enum(['Active', 'Inactive', 'On Leave'])
});
export function EditStaffModal({ open, onOpenChange, staff, onSave }) {
  const form = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      status: 'Active'
    }
  });
  useEffect(() => {
    if (staff) {
      form.reset({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        department: staff.department,
        position: staff.position,
        status: staff.status
      });
    }
  }, [staff, form]);
  const onSubmit = async (data) => {
    if (staff) {
      try {
        await onSave({
          id: staff.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          position: data.position,
          status: data.status
        });
        toast.success('Staff Updated', { description: `${data.name} has been updated successfully.` });
        onOpenChange(false);
      } catch (error) {
        toast.error('Update Failed', { description: error?.response?.data?.message || 'Failed to update staff member.' });
      }
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name &&
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              }
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email &&
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register('phone')} />
                {form.formState.errors.phone &&
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input {...form.register('department')} />
              </div>
              <div className="grid gap-2">
                <Label>Position</Label>
                <Input {...form.register('position')} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
