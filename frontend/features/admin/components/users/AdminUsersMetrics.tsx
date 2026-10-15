"use client";

import { Users, Crown, ShieldAlert } from "lucide-react";

interface AdminUsersMetricsProps {
  metrics?: {
    total: number;
    premium: number;
    banned: number;
  };
  isLoading: boolean;
}

export function AdminUsersMetrics({ metrics, isLoading }: AdminUsersMetricsProps) {
  const cards = [
    {
      label: "Total Registered",
      value: metrics?.total ?? 0,
      icon: Users,
      badge: "Platform Base",
      badgeStyle: "bg-brand-50/80 text-brand-900 border-brand-100",
      iconBg: "bg-brand-100/60 text-brand-900",
    },
    {
      label: "VIP Premium Members",
      value: metrics?.premium ?? 0,
      icon: Crown,
      badge: "VIP Access",
      badgeStyle: "bg-amber-50/80 text-amber-900 border-amber-200/70",
      iconBg: "bg-amber-100 text-amber-800",
    },
    {
      label: "Suspended Accounts",
      value: metrics?.banned ?? 0,
      icon: ShieldAlert,
      badge: "Moderated",
      badgeStyle: "bg-red-50/70 text-red-800 border-red-100",
      iconBg: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
                {isLoading ? "..." : card.value.toLocaleString()}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeStyle}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
