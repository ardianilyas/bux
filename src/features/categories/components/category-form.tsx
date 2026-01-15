"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputError } from "@/components/ui/input-error";
import { PRESET_COLORS, type CategoryFormData } from "../types";
import { categorySchema } from "@/lib/validations/category";
import { z } from "zod";
import { useState } from "react";

type CategoryFormProps = {
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
  formData: CategoryFormData;
  setFormData: (data: CategoryFormData) => void;
  onCancel: () => void;
};

export function CategoryForm({
  onSubmit,
  isLoading,
  submitLabel,
  formData,
  setFormData,
  onCancel,
}: CategoryFormProps) {
  const [errors, setErrors] = useState<{ name?: string; color?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean }>({});

  const validateField = (field: "name" | "color", value: string) => {
    try {
      categorySchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.issues[0]?.message }));
      }
    }
  };

  const handleBlur = () => {
    setTouched({ name: true });
    validateField("name", formData.name);
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    if (touched.name) {
      validateField("name", value);
    }
  };

  const handleSubmit = () => {
    try {
      categorySchema.parse(formData);
      setErrors({});
      onSubmit();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { name?: string; color?: string } = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as "name" | "color";
          if (field) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
        setTouched({ name: true });
      }
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="e.g. Food, Transport, Entertainment"
          className={errors.name ? "border-destructive" : ""}
        />
        <InputError message={errors.name} />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${formData.color === color
                ? "ring-2 ring-offset-2 ring-foreground"
                : ""
                }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
        <InputError message={errors.color} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
