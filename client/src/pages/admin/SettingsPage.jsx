import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Bell,
  Lock,
  Globe,
  Database,
  Shield,
  Palette,
  Save } from
'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { getSettings, updateSettings } from '@/services/adminUtilityService';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [savingSection, setSavingSection] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data.settings);
      } catch (error) {
        toast.error('Load Failed', { description: error?.response?.data?.message || 'Failed to load settings.' });
      }
    };

    loadSettings();
  }, []);

  const patchSection = (section, key, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current?.[section],
        [key]: value
      }
    }));
  };

  const handleSave = async (section, payload) => {
    try {
      setSavingSection(section);
      const response = await updateSettings(payload);
      setSettings(response.settings);
      toast.success('Settings Saved', {
        description: `${section} settings have been updated`
      });
    } catch (error) {
      toast.error('Save Failed', { description: error?.response?.data?.message || 'Failed to save settings.' });
    } finally {
      setSavingSection('');
    }
  };

  if (!settings) {
    return <div className="py-8 text-sm text-muted-foreground">Loading settings...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and preferences</p>
        </div>
      </div>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Institution Details
                </CardTitle>
                <CardDescription>Basic information about your institution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution Name</Label>
                    <Input id="institution" value={settings.institution?.name || ''} onChange={(event) => patchSection('institution', 'name', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abbreviation">Abbreviation</Label>
                    <Input id="abbreviation" value={settings.institution?.abbreviation || ''} onChange={(event) => patchSection('institution', 'abbreviation', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" value={settings.institution?.email || ''} onChange={(event) => patchSection('institution', 'email', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" value={settings.institution?.phone || ''} onChange={(event) => patchSection('institution', 'phone', event.target.value)} />
                  </div>
                </div>
                <Button disabled={savingSection === 'Institution'} onClick={() => handleSave('Institution', { institution: settings.institution })}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Enable dark mode theme</p>
                  </div>
                  <Switch checked={Boolean(settings.appearance?.darkMode)} onCheckedChange={(checked) => patchSection('appearance', 'darkMode', checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for denser UI</p>
                  </div>
                  <Switch checked={Boolean(settings.appearance?.compactMode)} onCheckedChange={(checked) => patchSection('appearance', 'compactMode', checked)} />
                </div>
                <Button disabled={savingSection === 'Appearance'} onClick={() => handleSave('Appearance', { appearance: settings.appearance })}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                <Switch checked={Boolean(settings.notifications?.emailNotifications)} onCheckedChange={(checked) => patchSection('notifications', 'emailNotifications', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">SMS Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                  </div>
                <Switch checked={Boolean(settings.notifications?.smsAlerts)} onCheckedChange={(checked) => patchSection('notifications', 'smsAlerts', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Payment Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify on payment transactions</p>
                  </div>
                <Switch checked={Boolean(settings.notifications?.paymentAlerts)} onCheckedChange={(checked) => patchSection('notifications', 'paymentAlerts', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Registration Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify on new registrations</p>
                  </div>
                <Switch checked={Boolean(settings.notifications?.registrationAlerts)} onCheckedChange={(checked) => patchSection('notifications', 'registrationAlerts', checked)} />
              </div>
              <Button disabled={savingSection === 'Notification'} onClick={() => handleSave('Notification', { notifications: settings.notifications })}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password Policy
                </CardTitle>
                <CardDescription>Configure password requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Select value={String(settings.security?.minPasswordLength || '8')} onValueChange={(value) => patchSection('security', 'minPasswordLength', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Password Expiry</Label>
                    <Select value={String(settings.security?.passwordExpiryDays || '90')} onValueChange={(value) => patchSection('security', 'passwordExpiryDays', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require Special Characters</p>
                    <p className="text-sm text-muted-foreground">At least one special character</p>
                  </div>
                  <Switch checked={Boolean(settings.security?.requireSpecialCharacters)} onCheckedChange={(checked) => patchSection('security', 'requireSpecialCharacters', checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch checked={Boolean(settings.security?.twoFactorAuthRequired)} onCheckedChange={(checked) => patchSection('security', 'twoFactorAuthRequired', checked)} />
                </div>
                <Button disabled={savingSection === 'Security'} onClick={() => handleSave('Security', { security: settings.security })}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Session Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Select value={String(settings.security?.sessionTimeoutMinutes || '30')} onValueChange={(value) => patchSection('security', 'sessionTimeoutMinutes', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Academic Configuration
              </CardTitle>
              <CardDescription>Configure academic settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Current Academic Year</Label>
                    <Select value={settings.academic?.academicYear || '2024-2025'} onValueChange={(value) => patchSection('academic', 'academicYear', value)}>
                      <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023/2024</SelectItem>
                      <SelectItem value="2024-2025">2024/2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Semester</Label>
                  <Select value={String(settings.academic?.semester || '2')} onValueChange={(value) => patchSection('academic', 'semester', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                      <SelectItem value="3">Semester 3 (Summer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grading System</Label>
                  <Select value={settings.academic?.gradingSystem || 'points'} onValueChange={(value) => patchSection('academic', 'gradingSystem', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Grade Points (A-E)</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pass Mark (%)</Label>
                  <Input type="number" value={settings.academic?.passMark || 40} onChange={(event) => patchSection('academic', 'passMark', Number(event.target.value))} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Late Registration</p>
                  <p className="text-sm text-muted-foreground">Allow students to register after deadline</p>
                </div>
                <Switch checked={Boolean(settings.academic?.allowLateRegistration)} onCheckedChange={(checked) => patchSection('academic', 'allowLateRegistration', checked)} />
              </div>
              <Button disabled={savingSection === 'Academic'} onClick={() => handleSave('Academic', { academic: settings.academic })}>
                <Save className="h-4 w-4 mr-2" />
                Save Academic Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);
}
