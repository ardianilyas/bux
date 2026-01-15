"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputError } from "@/components/ui/input-error";
import Link from "next/link";
import { AuthCard, AuthSubmitButton } from "./auth-card";
import { useRegister } from "../hooks/use-auth";
import { useState } from "react";
import { registerSchema } from "@/lib/validations/auth";
import { z } from "zod";

export function RegisterForm() {
  const { register, isLoading } = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const validateField = (
    field: "name" | "email" | "password" | "confirmPassword",
    value: string
  ) => {
    try {
      if (field === "confirmPassword") {
        // Special handling for confirm password
        registerSchema.parse({ name, email, password, confirmPassword: value });
      } else {
        registerSchema.shape[field].parse(value);
      }
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues.find((err) => err.path.includes(field));
        setErrors((prev) => ({
          ...prev,
          [field]: fieldError?.message,
        }));
      }
    }
  };

  const handleBlur = (field: "name" | "email" | "password" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const values = { name, email, password, confirmPassword };
    validateField(field, values[field]);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) {
      validateField("name", value);
    }
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
    // Also revalidate confirmPassword if it's been touched
    if (touched.confirmPassword) {
      validateField("confirmPassword", confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      validateField("confirmPassword", value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    try {
      registerSchema.parse({ name, email, password, confirmPassword });
      setErrors({});
      await register({ name, email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          if (field) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
        setTouched({ name: true, email: true, password: true, confirmPassword: true });
      }
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;

    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <AuthCard
      title="Create an account"
      description="Start tracking your expenses today"
      footer={
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => handleBlur("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            <InputError message={errors.name} />
          </div>
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
            {touched.password && passwordStrength !== null && !errors.password && (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength
                      ? passwordStrength === 4
                        ? "bg-green-500"
                        : passwordStrength === 3
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      : "bg-muted"
                      }`}
                  />
                ))}
              </div>
            )}
            <InputError message={errors.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            <InputError message={errors.confirmPassword} />
          </div>
          <AuthSubmitButton
            isLoading={isLoading}
            loadingText="Creating account..."
            text="Create account"
          />
        </div>
      </form>
    </AuthCard>
  );
}
