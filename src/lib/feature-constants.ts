// Feature toggle constants
export const FEATURE_KEYS = {
  BUDGETS: "budgets",
  SUBSCRIPTIONS: "subscriptions",
  SAVINGS: "savings",
  CALENDAR: "calendar",
  INSIGHTS: "insights",
} as const;

export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];

// Feature metadata
export const FEATURE_CONFIG = {
  [FEATURE_KEYS.BUDGETS]: {
    displayName: "Budgets",
    description: "Monthly budget management and tracking",
    icon: "pig-money",
    routes: ["/dashboard/budgets"],
  },
  [FEATURE_KEYS.SUBSCRIPTIONS]: {
    displayName: "Subscriptions",
    description: "Recurring subscription tracking and management",
    icon: "repeat",
    routes: ["/dashboard/subscriptions"],
  },
  [FEATURE_KEYS.SAVINGS]: {
    displayName: "Savings Goals",
    description: "Track and achieve your financial savings goals",
    icon: "target",
    routes: ["/dashboard/savings"],
  },
  [FEATURE_KEYS.CALENDAR]: {
    displayName: "Calendar",
    description: "View your expenses and bills in a calendar format",
    icon: "calendar",
    routes: ["/dashboard/calendar"],
  },
  [FEATURE_KEYS.INSIGHTS]: {
    displayName: "Insights",
    description: "Analytics and insights about your spending habits",
    icon: "pie-chart",
    routes: ["/dashboard/insights"],
  },
} as const;
