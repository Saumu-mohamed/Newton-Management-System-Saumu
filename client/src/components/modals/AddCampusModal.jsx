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
export function AddCampusModal({ open, onOpenChange, onAdd }) {
  const form = useForm({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: '',
      location: '',
      capacity: 1000,
      phone: '',
      email: '',
      status: 'Active',
      established: new Date().getFullYear().toString()
    }
  });
  const onSubmit = (data) => {
    onAdd({
      name: data.name,
      location: data.location,
      capacity: data.capacity,
      phone: data.phone,
      email: data.email,
      status: data.status,
      established: data.established
    });
    toast.success('Campus Added', { description: `${data.name} has been created successfully.` });
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Campus</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Campus Name</Label>
                <Input id="name" {...form.register('name')} placeholder="e.g., Eldoret Campus" />
                {form.formState.errors.name &&
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...form.register('location')} placeholder="e.g., Eldoret, Kenya" />
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
                  {...form.register('capacity', { valueAsNumber: true })}
                  placeholder="1000" />
                {form.formState.errors.capacity &&
                <p className="text-xs text-destructive">{form.formState.errors.capacity.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="established">Year Established</Label>
                <Input id="established" {...form.register('established')} placeholder="2024" />
                {form.formState.errors.established &&
                <p className="text-xs text-destructive">{form.formState.errors.established.message}</p>
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register('phone')} placeholder="+254 XX XXX XXXX" />
                {form.formState.errors.phone &&
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                }
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} placeholder="campus@cms.edu" />
                {form.formState.errors.email &&
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
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
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Campus</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}