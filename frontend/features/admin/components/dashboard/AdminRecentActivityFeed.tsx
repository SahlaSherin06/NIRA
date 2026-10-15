"use client";

import { UserPlus, Crown, ShieldAlert, Sparkles, Clock, Loader2 } from "lucide-react";
import { AdminActivityItem } from "../../admin.api";

interface AdminRecentActivityFeedProps {
  activities?: AdminActivityItem[];
  isLoading: boolean;
}

export function AdminRecentActivityFeed({
  activities = [],
  isLoading,
}: AdminRecentActivityFeedProps) {
  // Format timestamp relative to now
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getEventMeta = (type: AdminActivityItem["type"]) => {
    switch (type) {
      case "signup":
        return {
          icon: UserPlus,
          bg: "bg-brand-50 text-brand-900 border-brand-100",
          tag: "New Member",
          tagColor: "bg-brand-50 text-brand-900 border-brand-100",
        };
      case "premium":
        return {
          icon: Crown,
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          tag: "VIP Upgrade",
          tagColor: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "report":
        return {
          icon: ShieldAlert,
          bg: "bg-red-50 text-red-600 border-red-200",
          tag: "Safety Flag",
          tagColor: "bg-red-50 text-red-700 border-red-200",
        };
      default:
        return {
          icon: Sparkles,
          bg: "bg-gray-50 text-gray-700 border-gray-200",
          tag: "Activity",
          tagColor: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-gray-50 text-brand-900 border border-gray-100">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="font-sans font-bold text-base text-gray-900">
              Live Recent Activity
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time feed of new members, VIP upgrades, and safety reports
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Updates</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-sm text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-900 mb-2" />
            <span>Fetching live activities...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No recent activity recorded today.
          </div>
        ) : (
          activities.map((item) => {
            const meta = getEventMeta(item.type);
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                className="p-3 sm:p-3.5 rounded-xl border border-gray-100 bg-[#FCFAF8] hover:bg-gray-50/80 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 shrink-0 transition-transform group-hover:scale-105 ${meta.bg}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.tagColor}`}
                      >
                        {meta.tag}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                  {formatTimeAgo(item.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
