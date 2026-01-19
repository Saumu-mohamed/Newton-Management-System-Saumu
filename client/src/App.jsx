import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DashboardLayout from './components/Layout/DashboardLayout';

// Dashboard Pages
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import CollegeAdminDashboard from './pages/dashboards/CollegeAdminDashboard';
import RegistrarDashboard from './pages/dashboards/RegistrarDashboard';
import FinanceDashboard from './pages/dashboards/FinanceDashboard';
import LecturerDashboard from './pages/dashboards/LecturerDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import Error404 from './pages/Error404';

// Initialize security features
import { security } from './utils/security';
import authService from './services/authService';

// Setup token auto-refresh
authService.setupTokenRefresh();

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="super-admin-dashboard" element={
              <PrivateRoute requiredRoles={['super_admin']}>
                <SuperAdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="college-admin-dashboard" element={
              <PrivateRoute requiredRoles={['college_admin']}>
                <CollegeAdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="registrar-dashboard" element={
              <PrivateRoute requiredRoles={['registrar']}>
                <RegistrarDashboard />
              </PrivateRoute>
            } />
            
            <Route path="finance-dashboard" element={
              <PrivateRoute requiredRoles={['finance_officer']}>
                <FinanceDashboard />
              </PrivateRoute>
            } />
            
            <Route path="lecturer-dashboard" element={
              <PrivateRoute requiredRoles={['lecturer']}>
                <LecturerDashboard />
              </PrivateRoute>
            } />
            
            <Route path="student-dashboard" element={
              <PrivateRoute requiredRoles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            } />
            
            <Route path="dashboard" element={
              <PrivateRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Welcome to your dashboard</h1>
                  <p className="mt-4">Select a specific dashboard from the navigation menu.</p>
                </div>
              </PrivateRoute>
            } />
          </Route>
          
          {/* Error Routes */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600">403</h1>
                <p className="mt-2 text-lg">Unauthorized Access</p>
                <p className="mt-1">You don't have permission to access this page.</p>
                <a href="/login" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                  Return to Login
                </a>
              </div>
            </div>
          } />
          
          <Route path="*" element={<Error404 />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;