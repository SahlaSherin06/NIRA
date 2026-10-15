"use client";

import { useAdminReports, useToggleBanUser } from "@/features/admin/admin.queries";
import { ShieldAlert, Ban, CheckCircle2, Loader2, UserX } from "lucide-react";

export default function AdminReportsPage() {
  const { data, isLoading } = useAdminReports();
  const toggleBan = useToggleBanUser();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-sans font-bold text-xl text-gray-900 tracking-tight">
            Safety & Member Complaints
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Review reported behavior, fake profile flags, and inappropriate interactions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-900" />
            Loading safety reports...
          </div>
        ) : data?.reports.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="font-bold text-gray-900">No Pending Reports</div>
            <p className="text-xs text-gray-400">All member interactions are clear.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.reports.map((report) => (
              <div key={report._id} className="p-6 hover:bg-brand-50/20 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">
                      {report.targetId?.name || "Unknown Profile"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                      Reported
                    </span>
                    {report.targetId?.isBanned && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
                        Already Suspended
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Reported by: <span className="font-medium text-gray-700">{report.actorId?.name || "Member"}</span> ({report.actorId?.email})
                  </p>

                  <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                    <span className="font-bold text-gray-900">Reason / Notes: </span>
                    {report.reason || "Flagged as inappropriate or fake profile."}
                  </div>
                </div>

                <div className="flex sm:flex-col justify-end gap-2 items-end">
                  {report.targetId?._id && (
                    <button
                      onClick={() => toggleBan.mutate(report.targetId._id)}
                      disabled={toggleBan.isPending}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                        report.targetId.isBanned
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20"
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{report.targetId.isBanned ? "Unban Account" : "Ban Account"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
