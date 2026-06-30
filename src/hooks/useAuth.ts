"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { apiClient } from "@/services/api";

export function useAuth() {
  const { data: session, status, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (name: string, phone: string, email: string, role: string, location: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/register", { name, phone, email, role, location });
      if (!response.success) {
        setError(response.error || "Registration failed");
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        phone,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; location?: string; phone?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch("/users", data);
      if (!response.success) {
        setError(response.error || "Failed to update profile");
        return false;
      }
      // Trigger NextAuth session refresh
      await updateSession();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: session?.user ? {
      id: (session.user as any).id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as any).role,
      phone: (session.user as any).phone,
      walletBalance: (session.user as any).walletBalance || 0,
      location: (session.user as any).location || "India"
    } : null,
    isAuthenticated: status === "authenticated",
    isAuthenticating: status === "loading",
    loading,
    error,
    register,
    loginWithPhone,
    updateProfile,
    logout: () => signOut({ callbackUrl: "/auth" })
  };
}
