// "use client";

import { UserManagementTable, UserStatsCards } from "@/features/users";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
      </div>

      <UserStatsCards />
      <UserManagementTable />
    </div>
  );
}
