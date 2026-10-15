"use client";

import { Crown, TrendingUp, Sparkles, Clock } from "lucide-react";

interface AdminSubscriptionsMetricsProps {
  metrics?: {
    activeVip: number;
    mrr: number;
    conversionRate: number;
    expiringSoon: number;
    expired: number;
    totalUsers: number;
  };
  isLoading: boolean;
}

export function AdminSubscriptionsMetrics({ metrics, isLoading }: AdminSubscriptionsMetricsProps) {
  const cards = [
    {
      label: "Active VIP Members",
      value: isLoading ? "..." : (metrics?.activeVip ?? 0).toLocaleString(),
      icon: Crown,
      badge: "VIP Active",
      badgeStyle: "bg-brand-50 text-brand-900 border-brand-200/80 font-bold",
      iconBg: "bg-brand-100 text-brand-900",
    },
    {
      label: "Estimated Monthly Revenue",
      value: isLoading ? "..." : `₹${(metrics?.mrr ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      badge: "VIP Revenue",
      badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
      iconBg: "bg-emerald-100 text-emerald-800",
    },
    {
      label: "Free vs VIP Conversion",
      value: isLoading ? "..." : `${metrics?.conversionRate ?? 0}%`,
      icon: Sparkles,
      badge: "Platform Base",
      badgeStyle: "bg-purple-50 text-purple-800 border-purple-200/70",
      iconBg: "bg-purple-100 text-purple-900",
    },
    {
      label: "Expiring Soon (7 Days)",
      value: isLoading ? "..." : (metrics?.expiringSoon ?? 0).toLocaleString(),
      icon: Clock,
      badge: "Renewal Due",
      badgeStyle: "bg-rose-50 text-rose-800 border-rose-200/70 font-semibold",
      iconBg: "bg-rose-100 text-rose-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex flex-col justify-between transition-all hover:border-gray-200"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-gray-500">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
                {card.value}
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${card.badgeStyle}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
