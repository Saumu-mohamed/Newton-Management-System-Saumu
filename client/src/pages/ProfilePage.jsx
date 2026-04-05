import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from
'@/components/ui/form';
import { User, Mail, Phone, Building, BookOpen, Shield, Pencil, Save, X, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional()
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: ''
    }
  });

  const getInitials = (name) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const handleProfileSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await updateProfile(data);
    if (result.success) {
      toast.success('Profile Updated', {
        description: result.message || 'Your profile has been updated successfully.'
      });
      setIsEditing(false);
    } else {
      toast.error('Update Failed', {
        description: result.error
      });
    }
    setIsSubmitting(false);
  };

  const handlePasswordSubmit = async ({ newPassword }) => {
    setIsChangingPassword(true);
    const result = await changePassword(newPassword);
    if (result.success) {
      toast.success('Password Updated', {
        description: result.message || 'Your password has been updated successfully.'
      });
      passwordForm.reset();
    } else {
      toast.error('Password Update Failed', {
        description: result.error
      });
    }
    setIsChangingPassword(false);
  };

  const handleCancel = () => {
    profileForm.reset({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account information
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="flex justify-center pt-2">
              <Badge variant="secondary" className="text-sm">
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {user.campus &&
              <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{user.campus}</span>
                </div>
              }
              {user.department &&
              <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{user.department}</span>
                </div>
              }
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </div>
            {!isEditing &&
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            }
          </CardHeader>
          <CardContent>
            {isEditing ?
            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) =>
                  <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  } />
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email Address</Label>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                  <FormField
                  control={profileForm.control}
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
                  <Separator />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ?
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> :
                    <Save className="h-4 w-4 mr-2" />
                    }
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form> :
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Full Name
                    </Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Phone Number
                    </Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.phone || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Role
                    </Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{ROLE_LABELS[user.role]}</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="flex items-end gap-4 p-4 rounded-lg border">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) =>
                  <FormItem className="flex-1">
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter a new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  } />
                <Button type="submit" variant="outline" disabled={isChangingPassword}>
                  {isChangingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                  Change Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>);
}
