import { useState, useEffect } from 'react';
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
  head: z.string().min(2, 'Head of department is required'),
  description: z.string().optional(),
  status: z.string().min(1, 'Please select a status')
});
const statuses = ['Active', 'Inactive', 'Under Review'];
export function EditDepartmentModal({ open, onOpenChange, department, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      faculty: '',
      head: '',
      description: '',
      status: ''
    }
  });
  useEffect(() => {
    if (department && open) {
      form.reset({
        name: department.name,
        faculty: department.faculty,
        head: department.head,
        description: department.description || '',
        status: department.status
      });
    }
  }, [department, open, form]);
  const handleSubmit = async (data) => {
    if (!department) return;
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ ...data, id: department.id });
      }
      toast.success('Department Updated', {
        description: `${data.name} has been updated successfully`
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', { description: 'Failed to update department' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update department information. All fields marked with * are required.
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
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
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
                    <Input placeholder="Enter head of department name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) =>
                    <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                    )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              } />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                    placeholder="Enter department description (optional)"
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
