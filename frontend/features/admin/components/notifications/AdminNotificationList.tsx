"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ShieldAlert,
  UserPlus,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useAdminNotifications,
  useMarkAllAdminNotificationsRead,
} from "../../admin.queries";
import { AdminNotification } from "../../admin.api";

export function AdminNotificationList() {
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useAdminNotifications({
    page,
    limit: 50,
  });

  const markAllRead = useMarkAllAdminNotificationsRead();
  const notifications = data?.notifications || [];

  // Group notifications into New (unread when page loaded) and Earlier
  const grouped = useMemo(() => {
    const fresh: AdminNotification[] = [];
    const earlier: AdminNotification[] = [];

    notifications.forEach((item) => {
      if (!item.isRead) {
        fresh.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { fresh, earlier };
  }, [notifications]);

  // Auto mark as read on visit so navbar red dot is removed
  useEffect(() => {
    if (notifications && notifications.some((n) => !n.isRead)) {
      markAllRead.mutate();
    }
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "admin_report":
        return (
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case "admin_registration":
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
            <UserPlus className="w-5 h-5" />
          </div>
        );
      case "admin_subscription":
        return (
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-900 border border-brand-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <Crown className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-gray-50 text-gray-600 border border-gray-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  const getActionTarget = (notif: AdminNotification) => {
    if (notif.link) return notif.link;
    if (notif.type === "admin_report") return "/admin/reports";
    if (notif.type === "admin_registration") return "/admin/users";
    if (notif.type === "admin_subscription") return "/admin/subscriptions";
    return "/admin/dashboard";
  };

  const getActionLabel = (type: string) => {
    if (type === "admin_report") return "Review Report";
    if (type === "admin_subscription") return "View VIP";
    return "View User";
  };

  const renderCard = (notif: AdminNotification) => {
    const actionTarget = getActionTarget(notif);
    const actionLabel = getActionLabel(notif.type);
    const isNew = !notif.isRead;

    return (
      <div
        key={notif._id}
        className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
          isNew
            ? "bg-brand-50/25 border-brand-200/70 shadow-2xs hover:bg-brand-50/40"
            : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 shadow-2xs"
        }`}
      >
        {/* Left: Icon & Text */}
        <div className="flex items-start sm:items-center space-x-4 flex-1 min-w-0">
          {getNotificationIcon(notif.type)}

          <div className="flex-1 min-w-0">
            <p className={`text-sm sm:text-[15px] leading-snug ${isNew ? "text-gray-950 font-bold" : "text-gray-800 font-medium"}`}>
              {notif.message}
            </p>

            {/* Time ago */}
            <span className="text-xs text-gray-400 font-medium mt-1 block">
              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Right: Action button */}
        <div className="w-full sm:w-auto flex items-center justify-end shrink-0 pt-2 sm:pt-0">
          <Link
            href={actionTarget}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200/80 text-xs font-bold rounded-full transition-colors shadow-2xs whitespace-nowrap"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-brand-900 tracking-tight">
          Notifications
        </h1>
        <p className="text-gray-500 mt-1 text-xs sm:text-sm font-medium">
          Real-time security reports, user registrations, and premium upgrades
        </p>
      </div>

      {/* Notifications Feed */}
      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-900 flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif text-gray-900 mb-1">
            You&apos;re all caught up!
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto font-medium">
            When users report profiles, new members register, or members upgrade to VIP, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* New Section */}
          {grouped.fresh.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 px-1 flex items-center">
                New
                <span className="ml-2 bg-brand-900 text-white text-[10px] px-2 py-0.5 rounded-full font-sans">
                  {grouped.fresh.length}
                </span>
              </h3>
              <div className="space-y-2.5">
                {grouped.fresh.map(renderCard)}
              </div>
            </section>
          )}

          {/* Earlier Section */}
          {grouped.earlier.length > 0 && (
            <section>
              {grouped.fresh.length > 0 && (
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  Earlier
                </h3>
              )}
              <div className="space-y-2.5">
                {grouped.earlier.map(renderCard)}
              </div>
            </section>
          )}

          {/* Pagination if needed */}
          {data && data.pages > 1 && (
            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page {data.page} of {data.pages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page >= data.pages}
                  className="px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
