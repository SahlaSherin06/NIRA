"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ShieldAlert,
  UserPlus,
  Crown,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  Check,
  Filter,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  useAdminNotifications,
  useMarkAllAdminNotificationsRead,
  useMarkAdminNotificationRead,
  useDeleteAdminNotification,
  useClearAllAdminNotifications,
} from "../../admin.queries";
import { AdminNotification } from "../../admin.api";

export function AdminNotificationList() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState<number>(1);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { data, isLoading, isFetching } = useAdminNotifications({
    page,
    limit: 20,
    type: selectedType,
    filter: statusFilter,
  });

  const markAllRead = useMarkAllAdminNotificationsRead();
  const markRead = useMarkAdminNotificationRead();
  const deleteNotification = useDeleteAdminNotification();
  const clearAll = useClearAllAdminNotifications();

  const notifications = data?.notifications || [];
  const counts = data?.counts || {
    all: 0,
    unread: 0,
    reports: 0,
    registrations: 0,
    subscriptions: 0,
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "admin_report":
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case "admin_registration":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
            <UserPlus className="w-5 h-5" />
          </div>
        );
      case "admin_subscription":
        return (
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-900 border border-brand-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <Crown className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-600 border border-gray-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-5 h-5" />
          </div>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "admin_report":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Safety Report
          </span>
        );
      case "admin_registration":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <UserPlus className="w-3 h-3 mr-1" />
            New Member
          </span>
        );
      case "admin_subscription":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-900 border border-brand-200/80">
            <Crown className="w-3 h-3 mr-1" />
            VIP Upgrade
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
            Alert
          </span>
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

  const handleClearAllConfirm = async () => {
    await clearAll.mutateAsync();
    setConfirmClearOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-900 border border-brand-200/80 flex items-center justify-center shadow-2xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                Admin Notification Center
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-sans">
                Real-time security alerts, registration tracking, and VIP revenue events
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => markAllRead.mutate()}
            disabled={counts.unread === 0 || markAllRead.isPending}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              counts.unread > 0
                ? "bg-brand-50 text-brand-900 border border-brand-200/80 hover:bg-brand-100"
                : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed opacity-60"
            }`}
          >
            {markAllRead.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5 text-brand-900" />
            )}
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={() => setConfirmClearOpen(true)}
            disabled={notifications.length === 0 || clearAll.isPending}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              notifications.length > 0
                ? "bg-white text-gray-600 border border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50"
                : "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed opacity-60"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs / Stat Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Category Tabs */}
        <div className="flex items-center overflow-x-auto pb-1 sm:pb-0 gap-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedType("all");
              setPage(1);
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedType === "all"
                ? "bg-brand-900 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>All Alerts</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedType === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedType("admin_report");
              setPage(1);
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedType === "admin_report"
                ? "bg-rose-700 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-rose-50/40"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Reports</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedType === "admin_report" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"
              }`}
            >
              {counts.reports}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedType("admin_registration");
              setPage(1);
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedType === "admin_registration"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-emerald-50/40"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
            <span>Registrations</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedType === "admin_registration" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {counts.registrations}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedType("admin_subscription");
              setPage(1);
            }}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedType === "admin_subscription"
                ? "bg-brand-900 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-100 hover:bg-brand-50/40"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-brand-800" />
            <span>VIP Upgrades</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedType === "admin_subscription" ? "bg-white/20 text-white" : "bg-brand-100 text-brand-900"
              }`}
            >
              {counts.subscriptions}
            </span>
          </button>
        </div>

        {/* Read/Unread Filter */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border border-gray-100 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => {
              setStatusFilter("all");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setStatusFilter("unread");
              setPage(1);
            }}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "unread"
                ? "bg-brand-900 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>Unread</span>
            {counts.unread > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === "unread" ? "bg-white/20 text-white" : "bg-brand-100 text-brand-900"
                }`}
              >
                {counts.unread}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setStatusFilter("read");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "read" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-900" />
            <p className="text-xs font-medium text-gray-500">Loading platform notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">
              No Notifications Found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {statusFilter === "unread"
                ? "You're all caught up! There are no unread notifications right now."
                : "No platform alerts matching your current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const actionTarget = getActionTarget(notif);
              const isUnread = !notif.isRead;

              return (
                <div
                  key={notif._id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4 group ${
                    isUnread
                      ? "bg-brand-50/20 hover:bg-brand-50/40"
                      : "bg-white hover:bg-gray-50/60"
                  }`}
                >
                  {/* Left: Icon & Notification Info */}
                  <div className="flex items-start space-x-3.5 sm:space-x-4 flex-1 min-w-0">
                    {getNotificationIcon(notif.type)}

                    <div className="flex-1 min-w-0">
                      {/* Top Badges & Time */}
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        {getTypeBadge(notif.type)}

                        {isUnread && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-900 text-white animate-pulse">
                            <span>UNREAD</span>
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight mb-1">
                        {notif.title || "Platform Alert"}
                      </h4>

                      {/* Message Content */}
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                        {notif.message}
                      </p>

                      {/* Metadata Highlights if available */}
                      {notif.metadata && (
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          {notif.metadata.planLabel && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-900 border border-brand-200/80">
                              Package: {notif.metadata.planLabel}
                            </span>
                          )}
                          {notif.metadata.amount && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              Amount: ₹{Number(notif.metadata.amount).toLocaleString("en-IN")}
                            </span>
                          )}
                          {notif.metadata.reason && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/80">
                              Reason: {notif.metadata.reason}
                            </span>
                          )}
                        </div>
                      )}

                      {/* User Context Preview if available */}
                      {notif.relatedUser && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500 pt-1">
                          <span className="font-semibold text-gray-700">Member:</span>
                          <span className="font-medium text-gray-900">{notif.relatedUser.name}</span>
                          <span>({notif.relatedUser.email})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                    {/* Mark as Read / Read Status */}
                    {isUnread ? (
                      <button
                        onClick={() => markRead.mutate(notif._id)}
                        disabled={markRead.isPending}
                        title="Mark as read"
                        className="p-2 rounded-xl text-gray-400 hover:text-brand-900 hover:bg-brand-50 border border-transparent hover:border-brand-200/80 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <span
                        title="Read"
                        className="p-2 rounded-xl text-gray-300"
                      >
                        <CheckCheck className="w-4 h-4 text-emerald-500" />
                      </span>
                    )}

                    {/* Quick Jump Action Link */}
                    <Link
                      href={actionTarget}
                      onClick={() => {
                        if (isUnread) {
                          markRead.mutate(notif._id);
                        }
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-brand-50 text-gray-700 hover:text-brand-900 border border-gray-200 hover:border-brand-200/80 transition-all shadow-2xs"
                    >
                      <span>
                        {notif.type === "admin_report"
                          ? "Review Report"
                          : notif.type === "admin_subscription"
                          ? "View VIP"
                          : "View User"}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    {/* Delete Notification Button */}
                    <button
                      onClick={() => deleteNotification.mutate(notif._id)}
                      disabled={deleteNotification.isPending}
                      title="Delete notification"
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {data.page} of {data.pages} ({data.total} alerts)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear All */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
              Clear All Admin Notifications?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              This action will permanently delete all platform alerts and notification logs from the admin dashboard. This cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllConfirm}
                disabled={clearAll.isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                {clearAll.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Yes, Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
