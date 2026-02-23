import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

/**
 * Main application layout component with responsive sidebar and header
 * Provides consistent structure across all protected pages
 */
export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="h-screen w-full overflow-hidden bg-background flex">
        {/* Collapsible sidebar - z-50 for mobile overlay */}
        <AppSidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 h-full md:pl-64">
          {/* Fixed header - z-40 to stay above content but below modals */}
          <Header />

          {/* Main scrollable content */}
          <main className="flex-1 overflow-auto bg-background/50 selection:bg-primary/10">
            <div className="container-page py-8 px-6 sm:px-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}