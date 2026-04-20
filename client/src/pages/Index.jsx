import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle,

} from
  'lucide-react';

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

      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-8 text-center text-sm text-muted-foreground">
          <p>© 2024 College Management System. Built for Kenyan Colleges.</p>
        </div>
      </footer>
    </div>);
};
export default Index;