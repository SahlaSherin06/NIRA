"use client";

import { useAdminStats } from "../../admin.queries";
import { AdminLiveStatsCards } from "./AdminLiveStatsCards";
import { AdminRegistrationChart } from "./AdminRegistrationChart";
import { AdminGenderChart } from "./AdminGenderChart";
import { AdminRecentActivityFeed } from "./AdminRecentActivityFeed";
import { AdminRevenueCounter } from "./AdminRevenueCounter";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../../admin.queries";
import { Outfit } from "next/font/google";

const headingFont = Outfit({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export function AdminDashboardView() {
  const { data: stats, isLoading, isFetching } = useAdminStats();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-brand-900">
            Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time platform telemetry, matrimonial registrations, and member activity.
          </p>
        </div>

        {/* Refresh Live Data Button */}
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-brand-900" : "text-gray-500"}`} />
          <span>{isFetching ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* 1. Live Stats Cards (Total Users, Active Today, VIP Members, Total Matches) */}
      <AdminLiveStatsCards stats={stats} isLoading={isLoading} />

      {/* 2. Registration Growth Chart & Gender Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <AdminRegistrationChart
            data={stats?.registrationGrowth}
            isLoading={isLoading}
          />
        </div>
        <div className="flex flex-col">
          <AdminGenderChart
            genderRatio={stats?.genderRatio}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 3. Live Recent Activity & Revenue Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <AdminRecentActivityFeed
            activities={stats?.recentActivities}
            isLoading={isLoading}
          />
        </div>
        <div className="flex flex-col">
          <AdminRevenueCounter
            revenue={stats?.revenue}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
