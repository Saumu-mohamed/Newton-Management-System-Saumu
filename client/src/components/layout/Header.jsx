import { Bell, Search, LogOut, User, Settings, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/auth';
import { toast } from 'sonner';
import { useState } from 'react';

const mockNotifications = [
  { id: 1, title: 'New registration pending', description: 'Student John Doe needs approval', time: '5 min ago', unread: true },
  { id: 2, title: 'Payment received', description: 'KES 45,000 from ABC Corp', time: '1 hour ago', unread: true },
  { id: 3, title: 'Exam schedule updated', description: 'Final exams moved to next week', time: '2 hours ago', unread: false },
  { id: 4, title: 'System maintenance', description: 'Scheduled for Sunday 2 AM', time: '5 hours ago', unread: false }
];

/**
 * Header component with search, notifications, and user menu
 */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  const handleNotificationClick = (notification) => {
    toast.info(notification.title, {
      description: notification.description
    });
    setNotificationsOpen(false);
  };

  const handleViewAllNotifications = () => {
    toast.info('Notifications', {
      description: 'Opening notification center...'
    });
    setNotificationsOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info('Search', {
        description: `Searching for "${searchQuery}"...`
      });
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
        {/* Left section: Sidebar trigger */}
        <div className="flex items-center gap-2 flex-none lg:hidden">
          <SidebarTrigger className="shrink-0 hover:bg-accent/50 transition-colors" />
        </div>

        {/* Center: Search bar - Redesigned for prominence and style */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            </div>
            <Input
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 bg-secondary/30 border-border/40 hover:bg-secondary/50 focus-visible:ring-primary/20 focus-visible:bg-background transition-all rounded-xl border-2 focus:border-primary/30"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </form>
        </div>

        {/* Right section: Actions and user menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-10 w-10 rounded-xl hover:bg-accent/50"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Mobile search overlay */}
          {searchOpen && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md sm:hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="fixed top-0 left-0 right-0 p-4 bg-background/50 border-b shadow-lg shadow-black/5">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-12 h-14 w-full bg-secondary/50 text-base rounded-2xl border-none focus-visible:ring-2 focus-visible:ring-primary"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Desktop notifications */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-xl hover:bg-accent/50 transition-all hover:scale-105"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-85 p-0 overflow-hidden rounded-2xl border-border/50 shadow-2xl shadow-primary/5">
                <DropdownMenuLabel className="px-5 py-4 flex items-center justify-between bg-muted/30">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">Notifications</span>
                    <span className="text-xs font-normal text-muted-foreground">Stay updated with latest activities</span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5">
                      {unreadCount} NEW
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />

                <div className="max-h-96 overflow-y-auto pt-1 pb-1">
                  {mockNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-1 px-5 py-4 cursor-pointer hover:bg-accent/30 focus:bg-accent/30 transition-colors mx-1 rounded-xl group"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {notification.unread && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-sm shadow-primary" />
                        )}
                        <span className={`text-sm flex-1 leading-tight group-hover:text-primary transition-colors ${notification.unread ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                          {notification.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed ml-0 mt-0.5">
                        {notification.description}
                      </p>
                    </DropdownMenuItem>
                  ))}
                </div>

                <DropdownMenuSeparator className="m-0" />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full h-9 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/5 rounded-lg"
                    onClick={handleViewAllNotifications}
                  >
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile notifications sheet */}
          <div className="sm:hidden">
            <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="h-full overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      className="w-full text-left p-4 hover:bg-muted/50 transition-colors border-b last:border-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {notification.unread && (
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${notification.unread ? 'font-medium' : 'font-normal'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewAllNotifications}
                  >
                    View all notifications
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User menu */}
          <div className="hidden sm:block ml-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-11 px-2.5 gap-3 rounded-2xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all group"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary text-xs font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>
                  <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-sm font-bold leading-none tracking-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mt-1">
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden rounded-2xl border-border/50 shadow-2xl">
                <div className="bg-linear-to-br from-primary/10 via-background to-background p-5 pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-4 ring-primary/5">
                      <AvatarFallback className="bg-linear-to-br from-primary/30 to-primary/10 text-primary text-lg font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold truncate leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1.5 font-medium">
                        {user.email}
                      </p>
                      <div className="mt-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl px-4 py-3 cursor-pointer focus:bg-primary/5 focus:text-primary group">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary mr-3 group-focus:scale-110 transition-transform">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl px-4 py-3 cursor-pointer focus:bg-primary/5 focus:text-primary group">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary mr-3 group-focus:scale-110 transition-transform">
                      <Settings className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2 my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-3 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive group"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/10 text-destructive mr-3 group-focus:scale-110 transition-transform">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile user avatar */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 p-0"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}