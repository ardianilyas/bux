"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export type AnnouncementType = "info" | "success" | "warning" | "critical";

export interface AnnouncementFormData {
  title: string;
  message: string;
  type: AnnouncementType;
  isActive: boolean;
}

interface AnnouncementFormProps {
  initialData?: AnnouncementFormData;
  onSubmit: (data: AnnouncementFormData) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

export function AnnouncementForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [message, setMessage] = useState(initialData?.message || "");
  const [type, setType] = useState<AnnouncementType>(initialData?.type || "info");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Update form if initialData changes (e.g. when opening edit dialog for different item)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setMessage(initialData.message);
      setType(initialData.type);
      setIsActive(initialData.isActive);
    } else {
      // Reset for create mode if needed, though usually remounting handles this. 
      // Keeping it simple for now, the parent controls the key or open state.
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({ title, message, type, isActive });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Announcement message"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="active">Active immediately</Label>
        <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={isLoading || !title || !message}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
