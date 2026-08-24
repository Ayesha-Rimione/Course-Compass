import { apiFetch } from "./client";
import { StudentProfile } from "@/types";
import { transformBackendProfile } from "@/lib/auth";

export async function registerUser(email: string, password: string, fullName?: string): Promise<{ access_token: string; token_type: string; email: string }> {
  return apiFetch<{ access_token: string; token_type: string; email: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
}

export async function loginUser(email: string, password: string): Promise<{ access_token: string; token_type: string; email: string }> {
  return apiFetch<{ access_token: string; token_type: string; email: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function requestOtp(email: string): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, otpCode: string): Promise<{ access_token: string; token_type: string }> {
  return apiFetch<{ access_token: string; token_type: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code: otpCode }),
  });
}


export async function getCurrentStudent(): Promise<StudentProfile> {
  const raw = await apiFetch("/students/me");
  return transformBackendProfile(raw);
}
