"use client";

import { useState } from "react";
import {
  useAdminReports,
  useWarnReportUser,
  useDismissAdminReport,
  useResolveAdminReport,
  useToggleBanUser,
} from "@/features/admin/admin.queries";
import { AdminReport, AdminUser } from "@/features/admin/admin.api";
import { AdminReportsMetrics } from "@/features/admin/components/reports/AdminReportsMetrics";
import { AdminReportsFilterBar } from "@/features/admin/components/reports/AdminReportsFilterBar";
import { AdminReportsTable } from "@/features/admin/components/reports/AdminReportsTable";
import { AdminIssueWarningModal } from "@/features/admin/components/reports/AdminIssueWarningModal";
import { AdminUserProfileModal } from "@/features/admin/components/users/AdminUserProfileModal";

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Modals state
  const [warningReport, setWarningReport] = useState<AdminReport | null>(null);
  const [inspectedUser, setInspectedUser] = useState<AdminUser | null>(null);

  // Queries & Mutations
  const { data, isLoading } = useAdminReports({ search, status });
  const warnMutation = useWarnReportUser();
  const dismissMutation = useDismissAdminReport();
  const resolveMutation = useResolveAdminReport();
  const toggleBanMutation = useToggleBanUser();

  // Handlers
  const handleOpenWarning = (report: AdminReport) => {
    setWarningReport(report);
  };

  const handleConfirmWarning = (reportId: string, message: string) => {
    warnMutation.mutate(
      { reportId, message },
      {
        onSuccess: () => {
          setWarningReport(null);
        },
      }
    );
  };

  const handleSuspendUser = (report: AdminReport) => {
    if (report.targetId?.isBanned) {
      // Unban
      toggleBanMutation.mutate(report.targetId._id);
    } else {
      // Suspend & Resolve report
      resolveMutation.mutate({
        reportId: report._id,
        note: `Suspended by admin following complaint by ${report.actorId?.name || "member"}`,
      });
    }
  };

  const handleDismissReport = (reportId: string) => {
    dismissMutation.mutate({
      reportId,
      note: "Cleared as safe / false report by admin",
    });
  };

  const handleViewProfile = (userId: string) => {
    const report = data?.reports.find((r) => r.targetId?._id === userId);
    if (!report || !report.targetId) return;

    const constructedUser: AdminUser = {
      _id: report.targetId._id,
      name: report.targetId.name,
      email: report.targetId.email,
      gender: report.targetId.gender || "Not set",
      createdFor: "Self",
      isEmailVerified: true,
      isOnboardingComplete: true,
      isBanned: report.targetId.isBanned,
      photo: report.targetProfile?.mainPhoto || null,
      galleryPhotos: report.targetProfile?.mainPhoto ? [report.targetProfile.mainPhoto] : [],
      profile: {
        city: report.targetProfile?.city || undefined,
        state: report.targetProfile?.state || undefined,
        profession: report.targetProfile?.profession || undefined,
        religion: report.targetProfile?.religion || undefined,
        dob: report.targetProfile?.dob || undefined,
        mainPhoto: report.targetProfile?.mainPhoto || undefined,
      },
      subscription: {
        plan: (report.targetId.subscription?.plan as "free" | "premium") || "free",
      },
      createdAt: report.createdAt,
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
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-gray-900 tracking-tight">
            Safety, Moderation & Member Complaints
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review reported behavior, fake profile flags, issue safety warnings, and enforce account suspensions.
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics */}
      <AdminReportsMetrics metrics={data?.metrics} isLoading={isLoading} />

      {/* 3. Search & Smart Filters Toolbar */}
      <AdminReportsFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        totalResults={data?.reports.length}
      />

      {/* 4. Enhanced Safety Reports Table */}
      <AdminReportsTable
        reports={data?.reports || []}
        isLoading={isLoading}
        onOpenWarningModal={handleOpenWarning}
        onSuspendUser={handleSuspendUser}
        isSuspendPending={resolveMutation.isPending || toggleBanMutation.isPending}
        onDismissReport={handleDismissReport}
        isDismissPending={dismissMutation.isPending}
        onViewProfile={handleViewProfile}
      />

      {/* 5. Issue Warning Modal */}
      <AdminIssueWarningModal
        report={warningReport}
        isOpen={!!warningReport}
        onClose={() => setWarningReport(null)}
        onConfirmWarning={handleConfirmWarning}
        isPending={warnMutation.isPending}
      />

      {/* 6. Accused Member Biodata & Photos Inspector Modal */}
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
