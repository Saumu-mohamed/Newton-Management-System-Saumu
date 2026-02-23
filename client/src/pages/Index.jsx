import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Users,
  BookOpen,
  Wallet,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Building2,
  Calendar,
  FileText,
  CreditCard
} from
  'lucide-react';
const features = [
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Secure dashboards for Super Admin, College Admin, Registrar, Finance, Lecturers, and Students.'
  },
  {
    icon: BookOpen,
    title: 'Academic Management',
    description: 'Complete course registration, grading, and transcript management system.'
  },
  {
    icon: Wallet,
    title: 'Financial Tracking',
    description: 'M-Pesa integration, fee collection, and real-time payment monitoring.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Interactive charts, KPI dashboards, and exportable reports.'
  },
  {
    icon: Shield,
    title: 'Secure & Audited',
    description: 'Complete audit logging, role-based security, and data protection.'
  },
  {
    icon: Calendar,
    title: 'Calendar & Scheduling',
    description: 'Academic calendar, exam scheduling, and deadline management.'
  }];
const roles = [
  { role: 'Super Admin', description: 'System-wide monitoring & multi-campus management', color: 'bg-red-500' },
  { role: 'College Admin', description: 'Operational oversight & academic coordination', color: 'bg-blue-500' },
  { role: 'Registrar', description: 'Student lifecycle & registration management', color: 'bg-green-500' },
  { role: 'Finance Officer', description: 'Fee collection & financial reporting', color: 'bg-yellow-500' },
  { role: 'Lecturer', description: 'Class management & grade submission', color: 'bg-purple-500' },
  { role: 'Student', description: 'Personal academic & financial portal', color: 'bg-cyan-500' }];
const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg">CMS</span>
              <span className="text-muted-foreground text-sm ml-2">College Management System</span>
            </div>
          </div>
          <Button onClick={() => navigate('/login')}>
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>
      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          <CheckCircle className="w-3 h-3 mr-1" />
          Production-Ready CMS
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          College Management
          <span className="block text-primary">System</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A comprehensive, role-based management system for Kenyan colleges.
          Manage students, academics, finances, and operations all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/login')}>
            Access Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Features</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to manage a modern educational institution efficiently.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) =>
            <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      {/* Role-Based Access Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Role-Based Dashboards</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Each user role has a tailored dashboard with relevant features and data access.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((item) =>
            <Card key={item.role} className="border-border/50 overflow-hidden">
              <div className={`h-1 ${item.color}`} />
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{item.role}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="text-center">
            <CardContent className="p-6">
              <Building2 className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Campuses</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold">9,000+</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold">180+</p>
              <p className="text-sm text-muted-foreground">Courses</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <CreditCard className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold">KES 34M+</p>
              <p className="text-sm text-muted-foreground">Collected YTD</p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Access the demo with pre-configured user accounts for each role.
              Experience the full power of the College Management System.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}>
              Sign In to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>
      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 College Management System. Built for Kenyan Colleges.</p>
        </div>
      </footer>
    </div>);
};
export default Index;