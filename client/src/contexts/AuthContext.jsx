import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ROLE_ROUTES } from "@/types/auth.js";
import {
  changeUserPassword,
  clearStoredAuth,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
  loginUser,
  logoutUser,
  persistAuth,
  updateUserProfile
} from "@/services/authServices.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: getStoredUser(),
    token: getStoredToken(),
    isAuthenticated: Boolean(getStoredToken()),
    isLoading: true
  });

  useEffect(() => {
    let ignore = false;

    const hydrateAuth = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();

      if (!token) {
        if (!ignore) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
        return;
      }

      if (!ignore) {
        setAuthState((prev) => ({
          ...prev,
          user: storedUser,
          token,
          isAuthenticated: true,
          isLoading: true
        }));
      }

      try {
        const data = await getCurrentUser();

        if (!ignore) {
          setAuthState({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        }
      } catch (_error) {
        clearStoredAuth();

        if (!ignore) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    };

    hydrateAuth();

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const data = await loginUser(email, password);
      const { user, token } = data;

      persistAuth({ user, token });

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      return {
        success: true,
        user
      };
    } catch (error) {
      clearStoredAuth();

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });

      return {
        success: false,
        error: error.response?.data?.message || "Login failed"
      };
    }
  }, []);

  const changePassword = useCallback(async (newPassword) => {
    try {
      const data = await changeUserPassword(newPassword);

      setAuthState((prev) => {
        const nextUser = prev.user ? {
          ...prev.user,
          isFirstLogin: false
        } : prev.user;

        if (nextUser) {
          persistAuth({ user: nextUser });
        }

        return {
          ...prev,
          user: nextUser
        };
      });

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Password change failed"
      };
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    try {
      const data = await updateUserProfile(payload);

      setAuthState((prev) => ({
        ...prev,
        user: data.user || prev.user
      }));

      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed"
      };
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser().catch(() => null).finally(() => {
      clearStoredAuth();

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });

      window.location.href = "/login";
    });
  }, []);

  const getDashboardRoute = useCallback(() => {
    if (!authState.user) {
      return "/login";
    }

    return ROLE_ROUTES[authState.user.role] || "/login";
  }, [authState.user]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        changePassword,
        updateProfile,
        getDashboardRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
