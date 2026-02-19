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
        className="border-r border-sidebar-border bg-sidebar-background group/sidebar"
      >
        {/* Header with logo */}
        <SidebarHeader className="p-0 h-20 flex items-center justify-center border-b border-sidebar-border/50">
          <div className="flex items-center gap-3 w-full px-5">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0 transform transition-transform group-hover/sidebar:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="font-extrabold text-sidebar-foreground text-lg leading-none tracking-tight">
                  UniSecure
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40 mt-1.5 leading-none">
                  Hub Platform
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle - Redesigned to be more subtle and floating */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-sidebar-background border border-sidebar-border shadow-md z-50 text-sidebar-foreground/60 hover:text-primary transition-all opacity-0 group-hover/sidebar:opacity-100"
              onClick={handleToggleSidebar}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}

          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-sidebar-background border border-sidebar-border shadow-md z-50 text-sidebar-foreground/60 hover:text-primary transition-all opacity-0 group-hover/sidebar:opacity-100"
              onClick={handleToggleSidebar}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </SidebarHeader>

        {/* Navigation content */}
        <SidebarContent className="px-3 py-6 space-y-8">
          <SidebarGroup className="p-0">
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/30 px-4 mb-4">
                Main Menu
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {items.map((item) => {
                  const isActive = location.pathname === item.url;

                  const menuItemContent = (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`group/item relative h-11 px-4 transition-all duration-300 rounded-xl ${isActive
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                      >
                        <NavLink
                          to={item.url}
                          className="flex items-center w-full"
                        >
                          <div className={`flex items-center justify-center h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                            <item.icon className="h-full w-full" />
                          </div>

                          {!collapsed && (
                            <>
                              <span className={`ml-3.5 text-sm font-semibold tracking-tight leading-none flex-1 truncate transition-colors duration-300`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge
                                  className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 border-none transform transition-all duration-300 ${isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-primary/10 text-primary group-hover/item:bg-primary/20'
                                    }`}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              {isActive && (
                                <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full -ml-4" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.title} delayDuration={50}>
                        <TooltipTrigger asChild>
                          {menuItemContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-sidebar-foreground text-sidebar-background rounded-lg border-none font-bold text-xs px-3 py-1.5 shadow-xl">
                          <div className="flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold px-1.5 py-0">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
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
        <SidebarFooter className="p-3 border-t border-sidebar-border/30 bg-sidebar-background/50 backdrop-blur-sm">
          <div className={`flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 ${collapsed ? 'justify-center' : 'hover:bg-sidebar-accent/30'}`}>
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarFallback className="bg-linear-to-br from-primary/30 to-primary/10 text-primary text-xs font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-sidebar-background rounded-full"></div>
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-sm font-bold text-sidebar-foreground truncate leading-none">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 mt-1.5 leading-none">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>

                <Tooltip delayDuration={50}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-destructive text-destructive-foreground font-bold text-xs ring-4 ring-destructive/10">Sign Out</TooltipContent>
                </Tooltip>
              </>
            )}

            {collapsed && (
              <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-destructive text-destructive-foreground font-bold text-xs">Sign Out</TooltipContent>
              </Tooltip>
            )}
          </div>

          {!collapsed && (
            <div className="mt-2 px-3">
              <div className="h-px w-full bg-sidebar-border/20 mb-3" />
              <p className="text-[10px] font-medium text-sidebar-foreground/20 truncate italic">
                {user.email}
              </p>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}