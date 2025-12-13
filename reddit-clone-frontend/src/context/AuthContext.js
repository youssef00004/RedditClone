import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, username, password) => {
    try {
      await authService.register(email, username, password);
      const loginData = await authService.login(email, password);
      setUser(loginData.user);
      return loginData;
    } catch (error) {
      throw error;
    }
  };

  // Add Google Login
  const googleLogin = async (credential) => {
    try {
      const data = await authService.googleLogin(credential);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Still clear user state even if API call fails
      setUser(null);
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    login,
    register,
    googleLogin, // Add this
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
