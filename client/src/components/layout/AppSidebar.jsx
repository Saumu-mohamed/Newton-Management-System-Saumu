import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  BookOpen,
  Calendar,
  Settings,
  ClipboardList,
  BarChart3,
  UserCog,
  Wallet,
  School,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

const menuItems = {
  super_admin: [
    { title: 'Dashboard', url: '/super-admin-dashboard', icon: LayoutDashboard },
    { title: 'Users', url: '/users', icon: Users },
    { title: 'Campuses', url: '/campuses', icon: Building2 },
    { title: 'Audit Logs', url: '/audit-logs', icon: ClipboardList, badge: '4' },
    { title: 'Reports', url: '/reports', icon: BarChart3 },
    { title: 'Settings', url: '/settings', icon: Settings }
  ],
  college_admin: [
    { title: 'Dashboard', url: '/college-admin-dashboard', icon: LayoutDashboard },
    { title: 'Departments', url: '/departments', icon: Building2 },
    { title: 'Staff', url: '/staff', icon: UserCog },
    { title: 'Students', url: '/students', icon: Users },
    { title: 'Courses', url: '/courses', icon: BookOpen },
    { title: 'Reports', url: '/reports', icon: BarChart3 }
  ],
  registrar: [
    { title: 'Dashboard', url: '/registrar-dashboard', icon: LayoutDashboard },
    { title: 'Registrations', url: '/registrations', icon: FileText, badge: '12' },
    { title: 'Students', url: '/students', icon: Users },
    { title: 'Transcripts', url: '/transcripts', icon: ClipboardList },
    { title: 'Calendar', url: '/calendar', icon: Calendar }
  ],
  finance_officer: [
    { title: 'Dashboard', url: '/finance-dashboard', icon: LayoutDashboard },
    { title: 'Payments', url: '/payments', icon: CreditCard, badge: '3' },
    { title: 'Fee Structure', url: '/fee-structure', icon: Wallet },
    { title: 'Reports', url: '/finance-reports', icon: BarChart3 }
  ],
  lecturer: [
    { title: 'Dashboard', url: '/lecturer-dashboard', icon: LayoutDashboard },
    { title: 'My Classes', url: '/my-classes', icon: School },
    { title: 'Grades', url: '/grades', icon: ClipboardList },
    { title: 'Schedule', url: '/schedule', icon: Calendar }
  ],
  student: [
    { title: 'Dashboard', url: '/student-dashboard', icon: LayoutDashboard },
    { title: 'My Courses', url: '/my-courses', icon: BookOpen },
    { title: 'Results', url: '/results', icon: ClipboardList },
    { title: 'Fees', url: '/fees', icon: Wallet, badge: 'Pending' },
    { title: 'Timetable', url: '/timetable', icon: Calendar }
  ]
};

/**
 * AppSidebar component with collapsible menu and role-based navigation
 */
export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  if (!user) return null;

  const items = menuItems[user.role] || [];
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleToggleSidebar = () => {
    setOpen(collapsed ? true : false);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border bg-sidebar-background"
      >
        {/* Header with logo */}
        <SidebarHeader className="border-b border-sidebar-border p-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sidebar-foreground text-base leading-tight truncate">
                  UniSecure
                </span>
                <span className="text-xs text-sidebar-foreground/60 leading-tight truncate">
                  Management
                </span>
              </div>
            )}
          </div>
          
          {/* Collapse toggle */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg"
              onClick={handleToggleSidebar}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg"
              onClick={handleToggleSidebar}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </SidebarHeader>

        {/* Navigation content */}
        <SidebarContent className="overflow-y-auto py-4">
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider px-4 mb-2">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2">
                {items.map((item) => {
                  const isActive = location.pathname === item.url;

                  // Menu item content
                  const menuItemContent = (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`relative transition-all duration-200 rounded-lg ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                      >
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3 px-3 py-2.5 w-full"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          
                          {!collapsed && (
                            <>
                              <span className="text-sm font-medium leading-tight flex-1 truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge 
                                  variant={isActive ? 'secondary' : 'outline'}
                                  className="ml-auto text-xs px-1.5 py-0.5"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );

                  // Add tooltip when collapsed
                  if (collapsed) {
                    return (
                      <Tooltip key={item.title} delayDuration={0}>
                        <TooltipTrigger asChild>
                          {menuItemContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return menuItemContent;
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User footer */}
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>

                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Log out</TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Logout button when collapsed */}
            {collapsed && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Log out</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* User email when expanded */}
          {!collapsed && user.email && (
            <p className="text-xs text-sidebar-foreground/40 truncate mt-2 px-1">
              {user.email}
            </p>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}