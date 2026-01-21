// Analytics feature exports

// Components
export { AdminDashboardView } from "./components/admin-dashboard-view";
export { SubscriptionIncomeView } from "./components/subscription-income-view";
export { HealthScoreView } from "./components/health-score-view";
export { HealthScoreWidget } from "./components/health-score-widget";

// Hooks
export {
  useSystemStats,
  useUserGrowth,
  useExpenseTrends,
  useRecentActivity,
} from "./hooks/use-analytics";
export { useHealthScore } from "./hooks/use-health-score";
