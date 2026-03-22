import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
// Dashboards
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import CollegeAdminDashboard from "./pages/dashboards/CollegeAdminDashboard";
import RegistratorDashboard from "./pages/dashboards/RegistratorDashboard";
import FinanceDashboard from "./pages/dashboards/FinanceDashboard";
import LecturerDashboard from "./pages/dashboards/LecturerDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
// Admin Pages
import UsersPage from "./pages/admin/UsersPage";
import CampusesPage from "./pages/admin/CampusesPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
// Academic Pages
import DepartmentsPage from "./pages/academic/DepartmentsPage";
import StaffPage from "./pages/academic/StaffPage";
import StudentsPage from "./pages/academic/StudentsPage";
import CoursesPage from "./pages/academic/CoursesPage";
import CalendarPage from "./pages/academic/CalendarPage";
// Registrar Pages
import RegistrationsPage from "./pages/registrator/RegistrationsPage";
import TranscriptsPage from "./pages/registrator/TranscriptsPage";
// Finance Pages
import PaymentsPage from "./pages/finance/PaymentsPage";
import FeeStructurePage from "./pages/finance/FeeStructurePage";
import FinanceReportsPage from "./pages/finance/FinanceReportsPage";
// Lecturer Pages
import MyClassesPage from "./pages/lecturer/MyClassesPage";
import GradesPage from "./pages/lecturer/GradesPage";
import SchedulePage from "./pages/lecturer/SchedulePage";
// Student Pages
import MyCoursesPage from "./pages/student/MyCoursesPage";
import ResultsPage from "./pages/student/ResultsPage";
import FeesPage from "./pages/student/FeesPage";
import TimetablePage from "./pages/student/TimetablePage";
// Profile
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
const queryClient = new QueryClient();
const App = () =>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              {/* Protected routes with layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                {/* Super Admin */}
                <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
                {/* College Admin */}
                <Route path="/collegeadmin/dashboard" element={<ProtectedRoute allowedRoles={['collegeadmin', 'superadmin']}><CollegeAdminDashboard /></ProtectedRoute>} />
                {/* Registrar */}
                <Route path="/registrator/dashboard" element={<ProtectedRoute allowedRoles={['registrator', 'superadmin']}><RegistratorDashboard /></ProtectedRoute>} />
                {/* Finance */}
                <Route path="/finance/dashboard" element={<ProtectedRoute allowedRoles={['finance', 'superadmin']}><FinanceDashboard /></ProtectedRoute>} />
                {/* Lecturer */}
                <Route path="/lecturer/dashboard" element={<ProtectedRoute allowedRoles={['lecturer', 'superadmin']}><LecturerDashboard /></ProtectedRoute>} />
                {/* Student */}
                <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student', 'superadmin']}><StudentDashboard /></ProtectedRoute>} />
                {/* Admin Pages */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/campuses" element={<CampusesPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* Academic Pages */}
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                {/* Registrar Pages */}
                <Route path="/registrations" element={<RegistrationsPage />} />
                <Route path="/transcripts" element={<TranscriptsPage />} />
                {/* Finance Pages */}
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/fee-structure" element={<FeeStructurePage />} />
                <Route path="/finance-reports" element={<FinanceReportsPage />} />
                {/* Lecturer Pages */}
                <Route path="/my-classes" element={<MyClassesPage />} />
                <Route path="/grades" element={<GradesPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                {/* Student Pages */}
                <Route path="/my-courses" element={<MyCoursesPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/fees" element={<FeesPage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                {/* Profile */}
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              {/* Root - Landing page */}
              <Route path="/" element={<Index />} />
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>;
export default App;