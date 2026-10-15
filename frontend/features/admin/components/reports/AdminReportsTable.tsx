"use client";

import { AdminReport } from "../../admin.api";
import {
  ShieldAlert,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
  User,
  Crown,
  MapPin,
  Clock,
  Check,
} from "lucide-react";

interface AdminReportsTableProps {
  reports: AdminReport[];
  isLoading: boolean;
  onOpenWarningModal: (report: AdminReport) => void;
  onSuspendUser: (report: AdminReport) => void;
  isSuspendPending: boolean;
  onDismissReport: (reportId: string) => void;
  isDismissPending: boolean;
  onViewProfile: (userId: string) => void;
}

export function AdminReportsTable({
  reports,
  isLoading,
  onOpenWarningModal,
  onSuspendUser,
  isSuspendPending,
  onDismissReport,
  isDismissPending,
  onViewProfile,
}: AdminReportsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-12 text-center text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-brand-900" />
        <span className="text-xs font-semibold">Loading safety complaints...</span>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-12 text-center text-gray-500 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="font-bold text-gray-900 text-sm">No Matching Reports Found</div>
        <p className="text-xs text-gray-400">All member profiles and interactions are in good standing.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string, isBanned?: boolean) => {
    if (isBanned || status === "resolved") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
          <Ban className="w-3 h-3" />
          <span>Suspended</span>
        </span>
      );
    }
    if (status === "warned") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
          <AlertTriangle className="w-3 h-3" />
          <span>Warned</span>
        </span>
      );
    }
    if (status === "dismissed") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-3 h-3" />
          <span>Dismissed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3" />
        <span>Pending Review</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs sm:text-sm text-gray-600 border-collapse min-w-[760px] lg:min-w-full">
          <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Accused Member</th>
              <th className="py-3.5 px-3 sm:px-5">Reported By</th>
              <th className="py-3.5 px-3 sm:px-5">Reason & Evidence</th>
              <th className="py-3.5 px-3 sm:px-5">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => {
              const target = report.targetId;
              const prof = report.targetProfile;
              const realPhoto = prof?.mainPhoto;
              const initials = target?.name ? target.name.charAt(0).toUpperCase() : "U";
              const reportDate = new Date(report.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr
                  key={report._id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  {/* 1. Accused Member */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center space-x-3">
                      {/* Photo Thumbnail */}
                      <div
                        onClick={() => target?._id && onViewProfile(target._id)}
                        className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0 relative cursor-pointer group-hover:ring-2 group-hover:ring-brand-900/20 transition-all shadow-2xs"
                        title="Click to inspect accused member's biodata and photos"
                      >
                        {realPhoto ? (
                          <img
                            src={realPhoto}
                            alt={target?.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-900 font-serif font-bold text-sm">
                            {initials}
                          </div>
                        )}

                        {target?.subscription?.plan === "premium" && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 rounded-tl-md flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>

                      {/* Name & Indicators */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => target?._id && onViewProfile(target._id)}
                            className="font-bold text-gray-900 hover:text-brand-900 text-xs sm:text-sm tracking-tight text-left truncate block transition-colors cursor-pointer"
                            title="Click to view full biodata"
                          >
                            {target?.name || "Deleted User"}
                          </button>

                          {/* Repeated offender tag */}
                          {(report.targetReportCount || 1) > 1 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                              🚩 {report.targetReportCount} Reports
                            </span>
                          )}

                          {/* Warnings count tag */}
                          {(target?.warningsCount || 0) > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800">
                              ⚠️ {target?.warningsCount} Warned
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] sm:text-xs text-gray-400 truncate max-w-[150px] sm:max-w-[200px]">
                          {target?.email}
                        </div>
                        {prof?.city && (
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{prof.city}{prof.state ? `, ${prof.state}` : ""}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Reported By */}
                  <td className="py-3.5 px-3 sm:px-5">
                    <div className="font-semibold text-gray-800 text-xs truncate max-w-[140px]">
                      {report.actorId?.name || "Member"}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                      {report.actorId?.email}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {reportDate}
                    </div>
                  </td>

                  {/* 3. Reason & Evidence */}
                  <td className="py-3.5 px-3 sm:px-5">
                    <div className="max-w-[240px] space-y-1">
                      <p className="text-xs text-gray-800 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 leading-relaxed font-medium">
                        "{report.reason || "Flagged as inappropriate behaviour or fake profile"}"
                      </p>
                      {report.adminNote && (
                        <div className="text-[10px] text-gray-500 font-sans italic pl-1">
                          Admin note: <span className="font-semibold">{report.adminNote}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 4. Status Badge */}
                  <td className="py-3.5 px-3 sm:px-5 whitespace-nowrap">
                    {getStatusBadge(report.status, target?.isBanned)}
                  </td>

                  {/* 5. Moderation Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    {report.status === "resolved" || target?.isBanned ? (
                      <div className="inline-flex items-center gap-2 justify-end">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          <span>Suspended</span>
                        </span>
                        {target && (
                          <button
                            onClick={() => onSuspendUser(report)}
                            disabled={isSuspendPending}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="Unban and restore member account"
                          >
                            Unban
                          </button>
                        )}
                      </div>
                    ) : report.status === "dismissed" ? (
                      <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Dismissed</span>
                      </span>
                    ) : report.status === "warned" ? (
                      <div className="inline-flex items-center space-x-1.5 justify-end">
                        {/* Disabled Warned Button - already warned for this specific report */}
                        <button
                          disabled
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-50/70 text-orange-400 border border-orange-200/70 cursor-not-allowed inline-flex items-center gap-1 opacity-75"
                          title="A warning has already been issued for this complaint. If user receives another report, you can warn again."
                        >
                          <Check className="w-3 h-3 text-orange-400" />
                          <span>Warned</span>
                        </button>

                        {/* Suspend Button remains active if admin wants to escalate */}
                        <button
                          onClick={() => onSuspendUser(report)}
                          disabled={isSuspendPending}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-2xs shadow-red-600/20 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                          title="Escalate and suspend member"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Suspend</span>
                        </button>
                      </div>
                    ) : (
                      /* Active Pending Report */
                      <div className="inline-flex items-center space-x-1.5 justify-end">
                        {/* Warning Button: Shows 'Warn Again' if user already has prior strikes, otherwise 'Warn' */}
                        <button
                          onClick={() => onOpenWarningModal(report)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title={
                            (target?.warningsCount || 0) > 0
                              ? `Issue another warning to this member (Current strikes: ${target?.warningsCount})`
                              : "Issue official guideline warning to this member"
                          }
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{(target?.warningsCount || 0) > 0 ? "Warn Again" : "Warn"}</span>
                        </button>

                        {/* Suspend / Ban Button */}
                        <button
                          onClick={() => onSuspendUser(report)}
                          disabled={isSuspendPending}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-2xs shadow-red-600/20 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                          title="Suspend member and resolve complaint"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Suspend</span>
                        </button>

                        {/* Dismiss Button */}
                        <button
                          onClick={() => onDismissReport(report._id)}
                          disabled={isDismissPending}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-40 cursor-pointer"
                          title="Dismiss report as false alarm / safe"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
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
