// Analytics feature exports

// Components
export { AdminDashboardView } from "./components/admin-dashboard-view";

// Hooks
export {
  useSystemStats,
  useUserGrowth,
  useExpenseTrends,
  useRecentActivity,
} from "./hooks/use-analytics";

// Router (for server-side import only)
export { analyticsRouter } from "./api/analytics.router";
