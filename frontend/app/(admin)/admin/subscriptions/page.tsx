"use client";

import { useState } from "react";
import { Crown, Sparkles, PlusCircle } from "lucide-react";
import {
  useAdminSubscriptions,
  useRevokeVipSubscription,
  useToggleBanUser,
} from "@/features/admin/admin.queries";
import { AdminSubscriber, AdminUser } from "@/features/admin/admin.api";
import { AdminSubscriptionsMetrics } from "@/features/admin/components/subscriptions/AdminSubscriptionsMetrics";
import { AdminSubscriptionsFilterBar } from "@/features/admin/components/subscriptions/AdminSubscriptionsFilterBar";
import { AdminSubscriptionsTable } from "@/features/admin/components/subscriptions/AdminSubscriptionsTable";
import { AdminGrantVipModal } from "@/features/admin/components/subscriptions/AdminGrantVipModal";
import { AdminExtendVipModal } from "@/features/admin/components/subscriptions/AdminExtendVipModal";
import { AdminUserProfileModal } from "@/features/admin/components/users/AdminUserProfileModal";

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");

  // Modal States
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [extendingSubscriber, setExtendingSubscriber] = useState<AdminSubscriber | null>(null);
  const [inspectedUser, setInspectedUser] = useState<AdminUser | null>(null);

  // Queries & Mutations
  const { data, isLoading } = useAdminSubscriptions({ search, status });
  const revokeMutation = useRevokeVipSubscription();
  const toggleBanMutation = useToggleBanUser();

  // Handlers
  const handleExtendVip = (subscriber: AdminSubscriber) => {
    setExtendingSubscriber(subscriber);
  };

  const handleRevokeVip = (subscriber: AdminSubscriber) => {
    if (
      window.confirm(
        `Are you sure you want to revoke VIP membership for ${subscriber.name}? Their account will be downgraded to the Free tier immediately.`
      )
    ) {
      revokeMutation.mutate({
        subscriberId: subscriber._id,
        note: "Revoked manually by Admin from Subscriptions dashboard",
      });
    }
  };

  const handleViewProfile = (userId: string) => {
    const subscriber = data?.subscribers.find((s) => s._id === userId);
    if (!subscriber) return;

    const constructedUser: AdminUser = {
      _id: subscriber._id,
      name: subscriber.name,
      email: subscriber.email,
      gender: subscriber.gender || "Not specified",
      createdFor: "Self",
      isEmailVerified: true,
      isOnboardingComplete: true,
      isBanned: subscriber.isBanned || false,
      photo: subscriber.photo || subscriber.profile?.mainPhoto || null,
      galleryPhotos: subscriber.photo ? [subscriber.photo] : [],
      profile: subscriber.profile || undefined,
      subscription: {
        plan: subscriber.subscription.plan,
      },
      createdAt: subscriber.createdAt,
    };

    setInspectedUser(constructedUser);
  };

  const handleToggleBanModal = (id: string) => {
    toggleBanMutation.mutate(id, {
      onSuccess: () => {
        if (inspectedUser && inspectedUser._id === id) {
          setInspectedUser((prev) => (prev ? { ...prev, isBanned: !prev.isBanned } : null));
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Section with Grant VIP Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-semibold text-brand-900 mb-1.5">
            <Crown className="w-3.5 h-3.5 text-brand-900" />
            <span>VIP Revenue & Membership</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-gray-900">
            VIP Subscriptions Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor paid subscriber revenue, track remaining validities, and grant VIP passes.
          </p>
        </div>

        {/* Grant VIP Access Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-brand-100" />
            <span>Grant VIP Access</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Revenue & Plan Metrics (Overview Cards) */}
      <AdminSubscriptionsMetrics metrics={data?.metrics} isLoading={isLoading} />

      {/* 3. Search & Filter Bar */}
      <AdminSubscriptionsFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        totalResults={data?.total}
      />

      {/* 4. Detailed Subscribers Table */}
      <AdminSubscriptionsTable
        subscribers={data?.subscribers || []}
        isLoading={isLoading}
        onExtendVip={handleExtendVip}
        onRevokeVip={handleRevokeVip}
        onViewProfile={handleViewProfile}
        isActionPending={revokeMutation.isPending}
      />

      {/* 5. Modals */}
      <AdminGrantVipModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
      />

      <AdminExtendVipModal
        isOpen={!!extendingSubscriber}
        onClose={() => setExtendingSubscriber(null)}
        subscriber={extendingSubscriber}
      />

      <AdminUserProfileModal
        user={inspectedUser}
        isOpen={!!inspectedUser}
        onClose={() => setInspectedUser(null)}
        onToggleBan={handleToggleBanModal}
        isBanPending={toggleBanMutation.isPending}
      />
    </div>
  );
}
