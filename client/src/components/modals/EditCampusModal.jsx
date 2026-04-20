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

const campusSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  capacity: z.number().min(100, 'Capacity must be at least 100'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['Active', 'Inactive', 'Under Construction']),
  established: z.string().min(4, 'Year is required')
});
export function EditCampusModal({ open, onOpenChange, campus, onSave }) {
  const form = useForm({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: '',
      location: '',
      capacity: 1000,
      phone: '',
      email: '',
      status: 'Active',
      established: ''
    }
  });
  useEffect(() => {
    if (campus) {
      form.reset({
        name: campus.name,
        location: campus.location,
        capacity: campus.capacity,
        phone: campus.phone,
        email: campus.email,
        status: campus.status,
        established: campus.established
      });
    }
  }, [campus, form]);
  const onSubmit = async (data) => {
    if (campus) {
      try {
        await onSave({
          id: campus.id,
          name: data.name,
          location: data.location,
          students: campus.students,
          staff: campus.staff,
          capacity: data.capacity,
          phone: data.phone,
          email: data.email,
          status: data.status,
          established: data.established
        });
        toast.success('Campus Updated', { description: `${data.name} has been updated successfully.` });
        onOpenChange(false);
      } catch (error) {
        toast.error('Update Failed', { description: error?.response?.data?.message || 'Failed to update campus.' });
      }
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Campus</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Campus Name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name &&
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...form.register('location')} />
                {form.formState.errors.location &&
                <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  {...form.register('capacity', { valueAsNumber: true })} />
                {form.formState.errors.capacity &&
                <p className="text-xs text-destructive">{form.formState.errors.capacity.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="established">Year Established</Label>
                <Input id="established" {...form.register('established')} />
                {form.formState.errors.established &&
                <p className="text-xs text-destructive">{form.formState.errors.established.message}</p>
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register('phone')} />
                {form.formState.errors.phone &&
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email &&
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                }
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
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
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
