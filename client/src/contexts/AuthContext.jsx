import React, { createContext, useContext, useState, useCallback } from 'react';
import { ROLE_ROUTES } from '@/types/auth';
// Mock users for demo
const MOCK_USERS = {
  'admin@cms.edu': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@cms.edu',
      name: 'John Kamau',
      role: 'super_admin',
      avatar: ''
    }
  },
  'college@cms.edu': {
    password: 'college123',
    user: {
      id: '2',
      email: 'college@cms.edu',
      name: 'Mary Wanjiku',
      role: 'college_admin',
      campus: 'Main Campus'
    }
  },
  'registrar@cms.edu': {
    password: 'registrar123',
    user: {
      id: '3',
      email: 'registrar@cms.edu',
      name: 'Peter Ochieng',
      role: 'registrar',
      campus: 'Main Campus'
    }
  },
  'finance@cms.edu': {
    password: 'finance123',
    user: {
      id: '4',
      email: 'finance@cms.edu',
      name: 'Grace Muthoni',
      role: 'finance_officer',
      campus: 'Main Campus'
    }
  },
  'lecturer@cms.edu': {
    password: 'lecturer123',
    user: {
      id: '5',
      email: 'lecturer@cms.edu',
      name: 'Dr. James Kiprop',
      role: 'lecturer',
      department: 'Computer Science'
    }
  },
  'student@cms.edu': {
    password: 'student123',
    user: {
      id: '6',
      email: 'student@cms.edu',
      name: 'Faith Achieng',
      role: 'student',
      department: 'Computer Science'
    }
  }
};
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem('cms_user');
    if (stored) {
      const user = JSON.parse(stored);
      return { user, isAuthenticated: true, isLoading: false };
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });
  const login = useCallback(async (email, password) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (!mockUser) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: 'User not found' };
    }
    if (mockUser.password !== password) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Invalid password' };
    }
    localStorage.setItem('cms_user', JSON.stringify(mockUser.user));
    setAuthState({ user: mockUser.user, isAuthenticated: true, isLoading: false });
    return { success: true };
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('cms_user');
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  }, []);
  const getDashboardRoute = useCallback(() => {
    if (!authState.user) return '/login';
    return ROLE_ROUTES[authState.user.role];
  }, [authState.user]);
  return (
    <AuthContext.Provider value={{ ...authState, login, logout, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}