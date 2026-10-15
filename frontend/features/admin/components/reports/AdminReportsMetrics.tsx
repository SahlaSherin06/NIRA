"use client";

import { ShieldAlert, AlertTriangle, UserX, CheckCircle2 } from "lucide-react";

interface AdminReportsMetricsProps {
  metrics?: {
    total: number;
    pending: number;
    warned: number;
    resolved: number;
    dismissed: number;
  };
  isLoading: boolean;
}

export function AdminReportsMetrics({ metrics, isLoading }: AdminReportsMetricsProps) {
  const cards = [
    {
      label: "Pending Review",
      value: metrics?.pending ?? 0,
      icon: ShieldAlert,
      badge: "Action Required",
      badgeStyle: "bg-amber-50 text-amber-800 border-amber-200/70",
      iconBg: "bg-amber-100 text-amber-800",
    },
    {
      label: "Warnings Issued",
      value: metrics?.warned ?? 0,
      icon: AlertTriangle,
      badge: "Noticed Users",
      badgeStyle: "bg-orange-50 text-orange-800 border-orange-200/70",
      iconBg: "bg-orange-100 text-orange-800",
    },
    {
      label: "Suspended Frauds",
      value: metrics?.resolved ?? 0,
      icon: UserX,
      badge: "Accounts Banned",
      badgeStyle: "bg-red-50 text-red-800 border-red-200/70",
      iconBg: "bg-red-100 text-red-700",
    },
    {
      label: "Dismissed",
      value: metrics?.dismissed ?? 0,
      icon: CheckCircle2,
      badge: "Cleared",
      badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
      iconBg: "bg-emerald-100 text-emerald-700",
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
                {isLoading ? "..." : card.value.toLocaleString()}
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
