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

const courseSchema = z.object({
  code: z.string().min(2, 'Course code is required').max(20),
  name: z.string().min(3, 'Course name must be at least 3 characters').max(100),
  department: z.string().min(1, 'Please select a department'),
  credits: z.string().min(1, 'Please enter credits'),
  lecturer: z.string().min(1, 'Please select a lecturer'),
  semester: z.string().min(1, 'Please select a semester'),
  description: z.string().optional()
});

const semesters = ['Sem 1', 'Sem 2', 'Sem 3'];

export function AddCourseModal({ open, onOpenChange, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      name: '',
      department: '',
      credits: '',
      lecturer: '',
      semester: '',
      description: ''
    }
  });
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      toast.success('Course Created', {
        description: `${data.code} - ${data.name} has been added successfully`
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Error', { description: 'Failed to create course' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Create a new academic course. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Course Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CS 301" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Credits *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" placeholder="3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Course Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Semester *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesters.map((sem) =>
                      <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                      )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                } />
            </div>
              <FormField
              control={form.control}
              name="lecturer"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Assigned Lecturer *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lecturer name" {...field} />
                  </FormControl>
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
                    placeholder="Enter course description..."
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
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
