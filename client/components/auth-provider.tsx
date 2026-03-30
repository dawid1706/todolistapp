"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: any;
  logout: () => void;
  setSession: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch (error) {
        console.error("Failed to parse session from localStorage", error);
        localStorage.removeItem("session");
      }
    }
  }, []);

  const logout = () => {
    setSession(null);
    localStorage.removeItem("session");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ session, logout, setSession }}>
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
