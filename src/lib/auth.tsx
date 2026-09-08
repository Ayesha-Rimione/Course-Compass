import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuthToken, setAuthToken, removeAuthToken, apiFetch } from "@/api/client";
import { StudentProfile } from "@/types";
import { getStudentProfile, updateStudentProfile, defaultEmptyProfile, transformSupabaseProfile } from "@/api/students";

interface AuthContextType {
  token: string | null;
  profile: StudentProfile | null;
  role: string | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ access_token: string; isComplete: boolean; role?: string }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ access_token: string; isComplete: boolean; role?: string }>;
  requestOtp: (email: string) => Promise<{ status: string; message: string }>;
  verifyOtp: (email: string, otpCode: string) => Promise<{ access_token: string; isComplete: boolean; role?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<StudentProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function checkProfileCompleteness(profile: StudentProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.name?.trim() &&
    profile.studentId?.trim() &&
    profile.semester !== null &&
    profile.semester !== undefined &&
    profile.semester > 0
  );
}

export function transformBackendProfile(raw: any): StudentProfile {
  return transformSupabaseProfile(raw);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("coursecompass_user_role");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (): Promise<StudentProfile | null> => {
    try {
      const prof = await getStudentProfile();
      if (prof && prof.email) {
        setProfile(prof);
        return prof;
      }
      setProfile(null);
      return null;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      const currentToken = getAuthToken();
      setTokenState(currentToken);
      if (currentToken) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    };

    loadSession();

    const handleAuthChange = () => {
      const currentToken = getAuthToken();
      setTokenState(currentToken);
      if (currentToken) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    const response = await apiFetch<{
      access_token: string;
      token_type: string;
      email: string;
      role?: string;
      is_profile_complete?: boolean;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const userRole = response.role || "STUDENT";
    setAuthToken(response.access_token);
    setTokenState(response.access_token);
    setRole(userRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("coursecompass_user_role", userRole);
    }

    const loadedProfile = await fetchProfile();
    const isComplete = response.is_profile_complete ?? checkProfileCompleteness(loadedProfile);

    return {
      access_token: response.access_token,
      isComplete,
      role: userRole,
    };
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    const response = await apiFetch<{
      access_token: string;
      token_type: string;
      email: string;
      role?: string;
      is_profile_complete?: boolean;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password, full_name: fullName }),
    });

    const userRole = response.role || "STUDENT";
    setAuthToken(response.access_token);
    setTokenState(response.access_token);
    setRole(userRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("coursecompass_user_role", userRole);
    }

    const newProf: StudentProfile = {
      ...defaultEmptyProfile,
      name: fullName || "",
      email: cleanEmail,
    };
    setProfile(newProf);

    return {
      access_token: response.access_token,
      isComplete: false,
      role: userRole,
    };
  };

  const requestOtp = async (email: string) => {
    return apiFetch<{ status: string; message: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    const response = await apiFetch<{
      access_token: string;
      token_type: string;
      role?: string;
      is_profile_complete?: boolean;
    }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, code: otpCode }),
    });

    const userRole = response.role || "STUDENT";
    setAuthToken(response.access_token);
    setTokenState(response.access_token);
    setRole(userRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("coursecompass_user_role", userRole);
    }

    const loadedProfile = await fetchProfile();
    const isComplete = response.is_profile_complete ?? checkProfileCompleteness(loadedProfile);

    return {
      access_token: response.access_token,
      isComplete,
      role: userRole,
    };
  };

  const logout = async () => {
    removeAuthToken();
    setTokenState(null);
    setProfile(null);
    setRole(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("coursecompass_user_role");
    }
  };

  const refreshProfile = async () => {
    return fetchProfile();
  };

  const isProfileComplete = checkProfileCompleteness(profile);

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        role,
        isAuthenticated: Boolean(token),
        isProfileComplete,
        isLoading,
        login,
        register,
        requestOtp,
        verifyOtp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
