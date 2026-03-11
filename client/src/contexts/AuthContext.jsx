import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { ROLE_ROUTES } from "@/types/auth.js";
import { loginUser, changeUserPassword } from "@/services/authServices.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [authState, setAuthState] = useState(() => {

    const storedUser = localStorage.getItem("cms_user");
    const storedToken = localStorage.getItem("cms_token");

    if (storedUser && storedToken) {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
        isLoading: false
      };
    }

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    };
  });

  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authState.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authState.token]);

  // Login function
  const login = useCallback(async (email, password) => {

    try {

      setAuthState(prev => ({ ...prev, isLoading: true }));

      const data = await loginUser(email, password);

      const { token, user } = data;

      localStorage.setItem("cms_user", JSON.stringify(user));
      localStorage.setItem("cms_token", token);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };

    } catch (error) {

      setAuthState(prev => ({ ...prev, isLoading: false }));

      return {
        success: false,
        error: error.response?.data?.message || "Login failed"
      };
    }

  }, []);

  //change password(first login)
  const changePassword = useCallback(async (newPassword) => {

    try {
      const data = await changeUserPassword(newPassword);

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

  // Logout function
  const logout = useCallback(() => {

    localStorage.removeItem("cms_user");
    localStorage.removeItem("cms_token");

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });

    window.location.href = "/login";

  }, []);

  const getDashboardRoute = useCallback(() => {

    if (!authState.user) return "/login";

    return ROLE_ROUTES[authState.user.role];

  }, [authState.user]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        changePassword,
        getDashboardRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}