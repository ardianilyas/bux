export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.ban"
  | "user.suspend"
  | "user.activate"
  | "user.update_role"
  | "expense.create"
  | "expense.update"
  | "expense.delete"
  | "category.create"
  | "category.update"
  | "category.delete"
  | "budget.create"
  | "budget.update"
  | "budget.delete"
  | "announcement.create"
  | "announcement.update"
  | "announcement.delete"
  | "ticket.create"
  | "ticket.update"
  | "ticket.close"
  | "ticket.message"
  | "subscription.create"
  | "subscription.update"
  | "subscription.delete"
  | "subscription.process"
  | "savings_goal.create"
  | "savings_goal.update"
  | "savings_goal.delete"
  | "savings_goal.add_funds"
  | "feature.enable"
  | "feature.disable";

// Action constants to avoid magic strings
export const AUDIT_ACTIONS = {
  USER: {
    LOGIN: "user.login" as const,
    LOGOUT: "user.logout" as const,
    REGISTER: "user.register" as const,
    BAN: "user.ban" as const,
    SUSPEND: "user.suspend" as const,
    ACTIVATE: "user.activate" as const,
    UPDATE_ROLE: "user.update_role" as const,
  },
  EXPENSE: {
    CREATE: "expense.create" as const,
    UPDATE: "expense.update" as const,
    DELETE: "expense.delete" as const,
  },
  CATEGORY: {
    CREATE: "category.create" as const,
    UPDATE: "category.update" as const,
    DELETE: "category.delete" as const,
  },
  BUDGET: {
    CREATE: "budget.create" as const,
    UPDATE: "budget.update" as const,
    DELETE: "budget.delete" as const,
  },
  ANNOUNCEMENT: {
    CREATE: "announcement.create" as const,
    UPDATE: "announcement.update" as const,
    DELETE: "announcement.delete" as const,
  },
  TICKET: {
    CREATE: "ticket.create" as const,
    UPDATE: "ticket.update" as const,
    CLOSE: "ticket.close" as const,
    MESSAGE: "ticket.message" as const,
  },
  SUBSCRIPTION: {
    CREATE: "subscription.create" as const,
    UPDATE: "subscription.update" as const,
    DELETE: "subscription.delete" as const,
    PROCESS: "subscription.process" as const,
  },
  SAVINGS_GOAL: {
    CREATE: "savings_goal.create" as const,
    UPDATE: "savings_goal.update" as const,
    DELETE: "savings_goal.delete" as const,
    ADD_FUNDS: "savings_goal.add_funds" as const,
    CONTRIBUTE: "savings_goal.contribute" as const, // Added based on the user's snippet
  },

  // Feature Toggle actions
  FEATURE: {
    ENABLE: "feature.enable" as const,
    DISABLE: "feature.disable" as const,
  },
} as const;
