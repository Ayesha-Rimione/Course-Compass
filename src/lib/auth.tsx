import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuthToken, setAuthToken, removeAuthToken, apiFetch } from "@/api/client";
import { StudentProfile } from "@/types";

interface AuthContextType {
  token: string | null;
  profile: StudentProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ access_token: string; isComplete: boolean }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ access_token: string; isComplete: boolean }>;
  requestOtp: (email: string) => Promise<{ status: string; message: string }>;
  verifyOtp: (email: string, otpCode: string) => Promise<{ access_token: string; isComplete: boolean }>;
  logout: () => void;
  refreshProfile: () => Promise<StudentProfile | null>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function checkProfileCompleteness(profile: StudentProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.name?.trim() &&
    profile.studentId?.trim() &&
    profile.department?.trim() &&
    profile.program?.trim() &&
    profile.batch?.trim() &&
    profile.semester !== null &&
    profile.semester !== undefined &&
    profile.cgpa !== null &&
    profile.cgpa !== undefined
  );
}

export function transformBackendProfile(raw: any): StudentProfile {
  return {
    name: raw.full_name || "",
    studentId: raw.student_id || "",
    email: raw.email || "",
    phone: raw.phone || "",
    department: raw.department || "Department of Computer Science & Engineering",
    program: raw.program || "B.Sc. in Computer Science & Engineering",
    semester: raw.current_semester || 1,
    cgpa: raw.cgpa || 0.0,
    expectedGraduation: raw.admission_session || "",
    bio: raw.bio || "",
    links: {
      github: raw.github_url || "",
      linkedin: raw.linkedin_url || "",
      codeforces: raw.codeforces_url || "",
      leetcode: raw.leetcode_url || "",
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (): Promise<StudentProfile | null> => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setProfile(null);
      return null;
    }

    try {
      const raw = await apiFetch("/students/me");
      const transformed = transformBackendProfile(raw);
      setProfile(transformed);
      return transformed;
    } catch (err) {
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
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const response = await apiFetch<{ access_token: string; token_type: string; email: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(response.access_token);
    setTokenState(response.access_token);

    const loadedProfile = await fetchProfile();
    const isComplete = checkProfileCompleteness(loadedProfile);

    return {
      access_token: response.access_token,
      isComplete,
    };
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const response = await apiFetch<{ access_token: string; token_type: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    setAuthToken(response.access_token);
    setTokenState(response.access_token);

    const loadedProfile = await fetchProfile();
    const isComplete = checkProfileCompleteness(loadedProfile);

    return {
      access_token: response.access_token,
      isComplete,
    };
  };

  const requestOtp = async (email: string) => {
    return apiFetch<{ status: string; message: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    const response = await apiFetch<{ access_token: string; token_type: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, code: otpCode }),
    });

    setAuthToken(response.access_token);
    setTokenState(response.access_token);

    const loadedProfile = await fetchProfile();
    const isComplete = checkProfileCompleteness(loadedProfile);

    return {
      access_token: response.access_token,
      isComplete,
    };
  };

  const logout = () => {
    removeAuthToken();
    setTokenState(null);
    setProfile(null);
  };

  const isProfileComplete = checkProfileCompleteness(profile);

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        isAuthenticated: Boolean(token),
        isProfileComplete,
        isLoading,
        login,
        register,
        requestOtp,
        verifyOtp,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext: AuthContextType = {
  token: null,
  profile: null,
  isAuthenticated: false,
  isProfileComplete: false,
  isLoading: false,
  login: async () => ({ access_token: "", isComplete: false }),
  register: async () => ({ access_token: "", isComplete: false }),
  requestOtp: async () => ({ status: "", message: "" }),
  verifyOtp: async () => ({ access_token: "", isComplete: false }),
  logout: () => {},
  refreshProfile: async () => null,
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}

