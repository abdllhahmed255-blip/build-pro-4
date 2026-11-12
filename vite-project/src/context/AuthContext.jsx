import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
  const [loading, setLoading] = useState(true);

  // Fetch current user if token exists
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedToken =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/me");
        if (isMounted && response.data?.success && response.data?.user) {
          setUser(response.data.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn("Failed to fetch authenticated user:", err);
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post("/login", { email, password });
      if (response.data?.success) {
        const authToken = response.data.token;
        const authUser = response.data.user;

        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;

        otherStorage.removeItem("authToken");
        storage.setItem("authToken", authToken);

        setToken(authToken);
        setUser(authUser);

        return { success: true, user: authUser, role: authUser.role };
      }
      return {
        success: false,
        message: response.data?.message || "Invalid credentials",
      };
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to sign in. Please try again.";
      return { success: false, message };
    }
  };

  const signup = async (data) => {
    try {
      const response = await api.post("/register", data);
      if (response.data?.success) {
        const authToken = response.data.token;
        const authUser = response.data.user;

        localStorage.setItem("authToken", authToken);
        setToken(authToken);
        setUser(authUser);

        return { success: true, user: authUser, role: authUser.role };
      }
      return {
        success: false,
        message: response.data?.message || "Registration failed",
      };
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration error. Please check your data.";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    role: user?.role || null,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
