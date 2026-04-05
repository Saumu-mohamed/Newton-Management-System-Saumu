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

export function AddStaffModal({ open, onOpenChange, onAdd }) {
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
  const onSubmit = async (data) => {
    try {
      await onAdd({
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        status: data.status
      });
      toast.success('Staff Added', { description: `${data.name} has been added successfully.` });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Create Failed', { description: error?.response?.data?.message || 'Failed to create staff member.' });
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register('name')} placeholder="Enter full name" />
              {form.formState.errors.name &&
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              }
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} placeholder="email@cms.edu" />
                {form.formState.errors.email &&
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register('phone')} placeholder="+254 7XX XXX XXX" />
                {form.formState.errors.phone &&
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input {...form.register('department')} placeholder="Enter department" />
                {form.formState.errors.department &&
                <p className="text-xs text-destructive">{form.formState.errors.department.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label>Position</Label>
                <Input {...form.register('position')} placeholder="Enter position" />
                {form.formState.errors.position &&
                <p className="text-xs text-destructive">{form.formState.errors.position.message}</p>
                }
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select defaultValue="Active" onValueChange={(value) => form.setValue('status', value)}>
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
            <Button type="submit">Add Staff</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
