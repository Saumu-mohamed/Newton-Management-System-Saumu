import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

/**
 * Enhanced Login page with:
 * - Improved visual hierarchy
 * - Better form layout and spacing
 * - Responsive design for mobile/tablet
 * - Accessible form controls
 * - Demo account quick-fill
 * - Professional styling
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      const from = location.state?.from?.pathname || getDashboardRoute();
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const demoAccounts = [
    { email: 'admin@cms.edu', password: 'admin123', role: 'Super Admin' },
    { email: 'college@cms.edu', password: 'college123', role: 'College Admin' },
    { email: 'registrar@cms.edu', password: 'registrar123', role: 'Registrar' },
    { email: 'finance@cms.edu', password: 'finance123', role: 'Finance Officer' },
    { email: 'lecturer@cms.edu', password: 'lecturer123', role: 'Lecturer' },
    { email: 'student@cms.edu', password: 'student123', role: 'Student' }
  ];

  const quickFillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="h2-section">College Management System</h1>
            <p className="body-md text-muted-foreground">Sign in to your account to continue</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-2 pb-5 border-b border-border/50">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription className="text-sm">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-destructive/5 border-destructive/30 text-destructive animate-slide-down"
                  role="alert"
                >
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="form-group">
                <Label htmlFor="email" className="label-lg text-foreground font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="input-base input-lg input-focus bg-secondary/40 border-border/50 hover:bg-secondary/50 transition-colors"
                  aria-label="Email address"
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <Label htmlFor="password" className="label-lg text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="input-base input-lg input-focus bg-secondary/40 border-border/50 hover:bg-secondary/50 transition-colors pr-10"
                    aria-label="Password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-10 text-base font-medium mt-6 bg-primary hover:bg-primary/90 active:scale-95 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts Section */}
        <Card className="border border-border/30 shadow-md bg-card/90 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-sm font-semibold">Demo Credentials</CardTitle>
            <CardDescription className="text-xs mt-1">
              Click any role below to auto-fill test credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  size="sm"
                  onClick={() => quickFillDemo(account)}
                  disabled={isLoading}
                  className="h-auto py-2.5 px-2 sm:px-3 text-left border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {account.role}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-30">
                      {account.email}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground/70">
          This is a demo environment. Use demo credentials above to test the system.
        </p>
      </div>
    </div>
  );
}