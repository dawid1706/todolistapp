"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type AuthToken,
  getCurrentSession,
  logout as authLogout,
} from "@/lib/auth";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: AuthToken | null;
  loading: boolean;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthToken | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshSession = () => {
    const currentSession = getCurrentSession();
    setSession(currentSession);
  };

  useEffect(() => {
    refreshSession();
    setLoading(false);
  }, []);

  const logout = () => {
    authLogout();
    setSession(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ session, loading, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
