"use client";

import { Crown, TrendingUp, Sparkles, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

interface AdminRevenueCounterProps {
  revenue?: {
    monthlyRevenue: number;
    totalSubscriptions: number;
    planPrice: number;
  };
  isLoading: boolean;
}

export function AdminRevenueCounter({ revenue, isLoading }: AdminRevenueCounterProps) {
  const monthlyRevenue = revenue?.monthlyRevenue || 0;
  const subscriptions = revenue?.totalSubscriptions || 0;
  const planPrice = revenue?.planPrice || 499;

  // Monthly revenue goal benchmark (e.g. ₹10,000)
  const monthlyTarget = 10000;
  const targetPercent = Math.min(Math.round((monthlyRevenue / monthlyTarget) * 100), 100);
  const projectedARR = monthlyRevenue * 12;

  return (
    <div className="bg-gradient-to-br from-[#7a303f] via-[#652331] to-[#40131d] rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-brand-900/15 relative overflow-hidden flex flex-col justify-between h-full border border-white/10 group">
      {/* Background ambient lighting glows */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner Row */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300 shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Revenue Telemetry</span>
          </div>

          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center space-x-1 text-xs font-medium text-brand-100 hover:text-white transition-colors bg-white/5 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/10"
          >
            <span>Manage</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Large Currency Display with Trend Badge */}
        <div className="mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-200 block mb-1">
            Monthly Recurring Revenue (MRR)
          </span>

          <div className="flex items-baseline space-x-3">
            <div className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-white">
              {isLoading ? (
                "..."
              ) : (
                <span>₹{monthlyRevenue.toLocaleString("en-IN")}</span>
              )}
            </div>
            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-brand-100/75 leading-relaxed">
          Real-time earnings derived from active VIP memberships and unlocks.
        </p>
      </div>

      {/* Middle Section 1: Monthly Target Progress Bar */}
      <div className="relative z-10 my-3.5 p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-brand-100 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Monthly Target (₹10,000)</span>
          </span>
          <span className="text-amber-300 font-bold">{targetPercent}%</span>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${Math.max(targetPercent, 6)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-[10px] text-brand-200/80">
          <span>Current: ₹{monthlyRevenue.toLocaleString("en-IN")}</span>
          <span>Goal: ₹10,000</span>
        </div>
      </div>

      {/* Middle Section 2: Financial Telemetry Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-2 my-1">
        <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-200 block mb-0.5">
            Projected ARR
          </span>
          <span className="text-base font-bold font-sans text-white">
            ₹{projectedARR.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-brand-200/70 block mt-0.5">Annual run rate</span>
        </div>

        <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-200 block mb-0.5">
            Avg / Member
          </span>
          <span className="text-base font-bold font-sans text-amber-300">
            ₹{planPrice}
          </span>
          <span className="text-[10px] text-brand-200/70 block mt-0.5">Per VIP unlock</span>
        </div>
      </div>

      {/* Bottom KPI metrics */}
      <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-3 border-t border-white/15">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <span className="text-[11px] text-brand-200 block font-medium">
            Active VIP Subscribers
          </span>
          <span className="text-base font-bold font-sans text-white">
            {subscriptions} VIPs
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <span className="text-[11px] text-brand-200 block font-medium">
            Billing Frequency
          </span>
          <span className="text-base font-bold font-sans text-amber-300">
            Monthly
          </span>
        </div>
      </div>
    </div>
  );
}
