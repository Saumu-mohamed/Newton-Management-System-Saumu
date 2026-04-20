import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from
'@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100),
  faculty: z.string().min(1, 'Please select a faculty'),
  head: z.string().min(1, 'Please select head of department'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  description: z.string().optional()
});
export function AddDepartmentModal({ open, onOpenChange, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      faculty: '',
      head: '',
      email: '',
      phone: '',
      description: ''
    }
  });
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      toast.success('Department Created', {
        description: `${data.name} department has been added successfully`
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', { description: 'Failed to create department' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Create a new academic department. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Department Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="faculty"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Faculty *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter faculty name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="head"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Head of Department *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter head of department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Department Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="dept@university.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+254 700 000 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                    placeholder="Enter department description..."
                    className="resize-none"
                    rows={3}
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
