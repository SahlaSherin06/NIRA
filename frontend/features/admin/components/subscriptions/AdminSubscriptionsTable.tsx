"use client";

import { AdminSubscriber } from "../../admin.api";
import {
  Crown,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
  Eye,
  PlusCircle,
  Ban,
  Sparkles,
} from "lucide-react";

interface AdminSubscriptionsTableProps {
  subscribers: AdminSubscriber[];
  isLoading: boolean;
  onExtendVip: (subscriber: AdminSubscriber) => void;
  onRevokeVip: (subscriber: AdminSubscriber) => void;
  onViewProfile: (userId: string) => void;
  isActionPending?: boolean;
}

export function AdminSubscriptionsTable({
  subscribers,
  isLoading,
  onExtendVip,
  onRevokeVip,
  onViewProfile,
  isActionPending,
}: AdminSubscriptionsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-12 text-center text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-brand-900" />
        <span className="text-xs font-semibold">Loading VIP subscribers...</span>
      </div>
    );
  }

  if (subscribers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-12 text-center text-gray-500 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-900 flex items-center justify-center mx-auto">
          <Crown className="w-6 h-6" />
        </div>
        <div className="font-bold text-gray-900 text-sm">No Subscribers Found</div>
        <p className="text-xs text-gray-400">There are no subscribers matching your current filter.</p>
      </div>
    );
  }

  const getPlanBadge = (sub: AdminSubscriber["subscription"]) => {
    if (sub.plan === "free" || sub.status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          <span>Free Tier</span>
        </span>
      );
    }

    const label = sub.planLabel || (sub.duration === "lifetime" ? "Lifetime VIP (₹4,999)" : "1 Month VIP (₹499)");

    if (sub.duration === "lifetime" || label.toLowerCase().includes("lifetime")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
          <span>{label}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-900 border border-brand-200 shadow-2xs">
        <Crown className="w-3.5 h-3.5 text-brand-900" />
        <span>{label}</span>
      </span>
    );
  };

  const getValidityBadge = (sub: AdminSubscriber["subscription"]) => {
    if (sub.status === "expired" || sub.plan === "free") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
          <XCircle className="w-3 h-3 text-gray-500" />
          <span>Expired / Free</span>
        </span>
      );
    }

    if (sub.daysRemaining === null || sub.duration === "lifetime") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-900 border border-purple-200/70">
          <Sparkles className="w-3 h-3 text-purple-700" />
          <span>Lifetime Access</span>
        </span>
      );
    }

    if (sub.status === "expiring_soon") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <Clock className="w-3 h-3 text-rose-600" />
          <span>
            {sub.daysRemaining != null && sub.daysRemaining <= 0
              ? "Expires Today"
              : `${sub.daysRemaining ?? 0} days left`}
          </span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>{sub.daysRemaining != null ? `${sub.daysRemaining} days left` : "Active"}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs sm:text-sm text-gray-600 border-collapse min-w-[720px] lg:min-w-full">
          <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Subscribed Member</th>
              <th className="py-3.5 px-3 sm:px-5">Selected Plan Package</th>
              <th className="py-3.5 px-3 sm:px-5">Dates & Validity</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">VIP Management Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {subscribers.map((subscriber) => {
              const sub = subscriber.subscription;
              const isCurrentlyActive = sub.plan === "premium" && sub.status !== "expired";

              return (
                <tr key={subscriber._id} className="hover:bg-brand-50/20 transition-colors">
                  {/* 1. Member Info */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-brand-50 border border-brand-100 shrink-0">
                        {subscriber.photo ? (
                          <img
                            src={subscriber.photo}
                            alt={subscriber.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-brand-900 text-xs">
                            {subscriber.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isCurrentlyActive && (
                          <span
                            className="absolute bottom-0 right-0 w-3 h-3 bg-brand-900 border-2 border-white rounded-full flex items-center justify-center"
                            title="VIP Premium Member"
                          >
                            <Crown className="w-1.5 h-1.5 text-white" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                          {subscriber.name}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[160px] sm:max-w-[200px]">
                          {subscriber.email}
                        </div>
                        {subscriber.profile?.city && (
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>
                              {subscriber.profile.city}
                              {subscriber.profile.state ? `, ${subscriber.profile.state}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Selected Plan Package */}
                  <td className="py-3.5 px-3 sm:px-5 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div>{getPlanBadge(sub)}</div>
                      {sub.adminNote && (
                        <div className="text-[10px] text-gray-400 italic truncate max-w-[170px]" title={sub.adminNote}>
                          {sub.adminNote}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 3. Dates & Validity */}
                  <td className="py-3.5 px-3 sm:px-5 whitespace-nowrap">
                    <div className="space-y-1">
                      <div>{getValidityBadge(sub)}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>
                          {sub.expiresAt
                            ? `Expires: ${new Date(sub.expiresAt).toLocaleDateString()}`
                            : "Unlimited / Lifetime"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 4. Quick Admin Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1.5 justify-end">
                      {/* Extend VIP Button */}
                      <button
                        onClick={() => onExtendVip(subscriber)}
                        disabled={isActionPending}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-900 hover:bg-brand-100 border border-brand-200 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="Extend VIP validity for this member"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-brand-900" />
                        <span>Extend VIP</span>
                      </button>

                      {/* Revoke VIP Button (Only if active) */}
                      {isCurrentlyActive && (
                        <button
                          onClick={() => onRevokeVip(subscriber)}
                          disabled={isActionPending}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Revoke VIP plan and return to Free"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                          <span>Revoke</span>
                        </button>
                      )}

                      {/* View Profile Button */}
                      <button
                        onClick={() => onViewProfile(subscriber._id)}
                        className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="View member biodata profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>Profile</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
