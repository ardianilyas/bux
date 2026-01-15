"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputError } from "@/components/ui/input-error";
import Link from "next/link";
import { AuthCard, AuthSubmitButton } from "./auth-card";
import { useLogin } from "../hooks/use-auth";
import { useState } from "react";
import { loginSchema } from "@/lib/validations/auth";
import { z } from "zod";

export function LoginForm() {
  const { login, isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validateField = (field: "email" | "password", value: string) => {
    try {
      if (field === "email") {
        loginSchema.shape.email.parse(value);
      } else {
        loginSchema.shape.password.parse(value);
      }
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.issues[0]?.message }));
      }
    }
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === "email" ? email : password;
    validateField(field, value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      validateField("email", value);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      validateField("password", value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      await login({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as "email" | "password"] = err.message;
          }
        });
        setErrors(fieldErrors);
        setTouched({ email: true, password: true });
      }
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your account"
      footer={
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => handleBlur("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            <InputError message={errors.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => handleBlur("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            <InputError message={errors.password} />
          </div>
          <AuthSubmitButton
            isLoading={isLoading}
            loadingText="Signing in..."
            text="Sign in"
          />
        </div>
      </form>
    </AuthCard>
  );
}
