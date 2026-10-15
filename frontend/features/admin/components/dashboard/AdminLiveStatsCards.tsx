"use client";

import { Users, UserCheck, Crown, HeartHandshake, Loader2 } from "lucide-react";
import { AdminStats } from "../../admin.api";

interface AdminLiveStatsCardsProps {
  stats?: AdminStats;
  isLoading: boolean;
}

export function AdminLiveStatsCards({ stats, isLoading }: AdminLiveStatsCardsProps) {
  const cards = [
    {
      title: "Total Registered",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      badge: "Platform Base",
      badgeColor: "bg-brand-50 text-brand-900 border-brand-100",
      iconBg: "bg-brand-100/60 text-brand-900",
      subtext: "All verified profiles",
    },
    {
      title: "Active Users Today",
      value: stats?.activeUsersToday ?? 0,
      icon: UserCheck,
      badge: "Real-time Active",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      iconBg: "bg-emerald-100/60 text-emerald-700",
      subtext: "Logged in or swiped today",
      isLive: true,
    },
    {
      title: "Paid VIP Members",
      value: stats?.premiumUsers ?? 0,
      icon: Crown,
      badge: "VIP Subscribers",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200/60",
      iconBg: "bg-amber-100 text-amber-700",
      subtext: "Active premium plans",
    },
    {
      title: "Total Matches Formed",
      value: stats?.totalMatches ?? 0,
      icon: HeartHandshake,
      badge: "Mutual Connections",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-100",
      iconBg: "bg-rose-100 text-brand-900",
      subtext: "Reciprocal mutual likes",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-gray-200 hover:shadow-sm transition-all duration-150 flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle: Number */}
            <div className="mb-3">
              <div className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight flex items-center space-x-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-900" />
                ) : (
                  <span>{card.value.toLocaleString()}</span>
                )}
                {card.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Badge & Description */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
              <span className="text-gray-400 font-normal text-[11px]">{card.subtext}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
