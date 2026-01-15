// Announcement type constants
export const ANNOUNCEMENT_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  CRITICAL: "critical",
} as const;

export type AnnouncementType = typeof ANNOUNCEMENT_TYPES[keyof typeof ANNOUNCEMENT_TYPES];

// User status constants
export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
