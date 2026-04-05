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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Please select a role'),
  campus: z.string().min(1, 'Please select a campus'),
  department: z.string().min(1, 'Please select a department'),
  phone: z.string().optional()
});
const roles = ['Student', 'Lecturer', 'Finance Officer', 'Registrar', 'College Admin'];
const campuses = ['Main', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
const departments = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Mathematics', 'Administration'];
export function AddUserModal({ open, onOpenChange, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      campus: '',
      department: '',
      phone: ''
    }
  });
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Create Failed', {
        description: error?.response?.data?.message || 'Failed to create user.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+254 700 000 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) =>
                      <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                      )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="campus"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Campus *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campuses.map((campus) =>
                      <SelectItem key={campus} value={campus}>
                            {campus}
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
              name="department"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Department *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) =>
                    <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                    )}
                    </SelectContent>
                  </Select>
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
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
