"use client";

import React, { useState } from "react";
import { useSession } from "@/features/auth/auth.queries";
import { useDevUpgrade } from "@/features/subscription/subscription.queries";
import {
  CheckCircle2,
  Crown,
  Star,
  Heart,
  Infinity,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MockRazorpayModal, VipPlanConfig } from "@/features/subscription/components/MockRazorpayModal";

export function PremiumView() {
  const { data: session } = useSession();
  const devUpgrade = useDevUpgrade();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [showMockPayment, setShowMockPayment] = useState(false);

  const vipPlans: VipPlanConfig[] = [
    {
      duration: "1_month",
      label: "1 Month VIP",
      price: 499,
      durationDesc: "30 Days Full VIP Access",
    },
    {
      duration: "3_months",
      label: "3 Months VIP",
      price: 1199,
      durationDesc: "90 Days Access (Save 20%)",
    },
    {
      duration: "6_months",
      label: "6 Months VIP",
      price: 1999,
      durationDesc: "180 Days Access (Save 33%)",
    },
    {
      duration: "lifetime",
      label: "Lifetime VIP",
      price: 4999,
      durationDesc: "Unlimited Perpetual VIP Access",
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<VipPlanConfig>(vipPlans[1]); // Default to 3 Months

  const isPremium = session?.user?.subscription?.plan === "premium";

  const handleUpgrade = () => {
    setShowMockPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowMockPayment(false);
    setSuccess(true);
    setTimeout(() => {
      router.push("/explore");
    }, 2500);
  };

  if (isPremium && !success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-brand-50/40 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mb-5 border border-brand-200/80 shadow-xs">
          <Crown className="w-10 h-10 text-brand-900" />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-900 border border-brand-200 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-900" />
          <span>Active VIP Subscriber</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-900 mb-2">
          You are a NIRA VIP Member!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-md">
          Enjoy unlimited likes, priority discovery visibility, super likes, and direct contact options.
        </p>
        <Link
          href="/explore"
          className="px-7 py-3 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all hover:shadow-md cursor-pointer"
        >
          Explore Matches Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-50/30 py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-900 border border-brand-200 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-brand-900" />
            <span>NIRA Matrimony Premium</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-brand-900 tracking-tight">
            Select Your VIP Membership Plan
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Choose the package that suits you best. Get unlimited likes, unlock blurred photos, and boost your matchmaking success.
          </p>
        </div>

        {/* Plan Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vipPlans.map((plan) => {
            const isSelected = selectedPlan.duration === plan.duration;
            const isPopular = plan.duration === "3_months";
            const isLifetime = plan.duration === "lifetime";

            return (
              <div
                key={plan.duration}
                onClick={() => setSelectedPlan(plan)}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-brand-900 bg-white shadow-md ring-2 ring-brand-900/10 scale-[1.02]"
                    : "border-gray-200 bg-white/80 hover:border-brand-200 hover:bg-white shadow-2xs"
                }`}
              >
                {/* Popular or Lifetime Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-900 text-white uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}
                {isLifetime && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-900 text-white uppercase tracking-wider shadow-xs">
                    Best Value
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{plan.label}</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-brand-900 bg-brand-900 text-white" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {plan.duration === "lifetime" ? "one-time" : "total"}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium mt-0.5">{plan.durationDesc}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 space-y-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited Likes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>View Liked Profiles</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified VIP Badge</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Action Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-900">
              <Zap className="w-4 h-4 text-brand-900" />
              <span>Ready to upgrade with {selectedPlan.label}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Total Investment: ₹{selectedPlan.price.toLocaleString()} ({selectedPlan.durationDesc})
            </h3>
            <p className="text-xs text-gray-500">
              Instant activation via secure Razorpay checkout. Cancel or modify anytime.
            </p>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={devUpgrade.isPending || success}
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-900 hover:bg-brand-800 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            {devUpgrade.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : success ? (
              <span>Activated! Redirecting...</span>
            ) : (
              <>
                <Crown className="w-4 h-4 text-brand-100" />
                <span>Proceed to Pay ₹{selectedPlan.price.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>

        {/* VIP Perks Features Breakdown */}
        <div className="bg-white/80 rounded-2xl p-6 border border-gray-100 shadow-2xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-4 text-center">
            All VIP Membership Benefits Included
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-brand-50/50">
              <Infinity className="w-5 h-5 text-brand-900 mx-auto mb-1.5" />
              <div className="font-bold text-xs text-gray-900">Unlimited Swipes</div>
              <div className="text-[10px] text-gray-500">Never run out of daily likes</div>
            </div>
            <div className="p-3 rounded-xl bg-brand-50/50">
              <Heart className="w-5 h-5 text-brand-900 mx-auto mb-1.5" />
              <div className="font-bold text-xs text-gray-900">Who Liked You</div>
              <div className="text-[10px] text-gray-500">See interested matches instantly</div>
            </div>
            <div className="p-3 rounded-xl bg-brand-50/50">
              <Star className="w-5 h-5 text-brand-900 mx-auto mb-1.5" />
              <div className="font-bold text-xs text-gray-900">Priority Placement</div>
              <div className="text-[10px] text-gray-500">Show up first on candidate feeds</div>
            </div>
            <div className="p-3 rounded-xl bg-brand-50/50">
              <ShieldCheck className="w-5 h-5 text-brand-900 mx-auto mb-1.5" />
              <div className="font-bold text-xs text-gray-900">Verified VIP Badge</div>
              <div className="text-[10px] text-gray-500">Boost trust and response rates</div>
            </div>
          </div>
        </div>
      </div>

      <MockRazorpayModal
        isOpen={showMockPayment}
        onClose={() => setShowMockPayment(false)}
        onSuccess={handlePaymentSuccess}
        plan={selectedPlan}
      />
    </div>
  );
}
