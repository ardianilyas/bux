"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signIn, signUp, signOut, useSession } from "../config/auth-client";
import type { LoginCredentials, RegisterCredentials } from "../types";
import { useUserStore } from "@/store/use-user-store";

export { useSession };

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to sign in");
        return { error: result.error };
      }

      // Store user details in Zustand
      if (result.data?.user) {
        setUser({
          email: result.data.user.email,
          name: result.data.user.name || "",
        });
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
      return { error: null };
    } catch (error) {
      toast.error("An unexpected error occurred");
      return { error: { message: "An unexpected error occurred" } };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}

export function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);

    try {
      const result = await signUp.email({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create account");
        return { error: result.error };
      }

      // Store user details in Zustand
      if (result.data?.user) {
        setUser({
          email: result.data.user.email,
          name: result.data.user.name || "",
        });
      }

      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
      return { error: null };
    } catch (error) {
      toast.error("An unexpected error occurred");
      return { error: { message: "An unexpected error occurred" } };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
}

export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const clearUser = useUserStore((state) => state.clearUser);

  const logout = async () => {
    setIsLoading(true);

    try {
      await signOut();
      clearUser(); // Clear user store on logout
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
}
