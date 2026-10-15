"use client";

import { useAdminStats, useAdminUsers } from "@/features/admin/admin.queries";
import { Crown, Sparkles, TrendingUp, CheckCircle, ShieldCheck } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const { data: stats } = useAdminStats();
  const { data: premiumUsers, isLoading } = useAdminUsers({ filter: "premium", limit: 20 } as any);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-5 sm:p-6 text-white shadow-md shadow-amber-600/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-white mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>VIP Subscriptions Overview</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
            Premium Membership Base
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Track active paid plans, unlimited swipes access, and VIP accounts.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 text-center min-w-[130px]">
          <div className="text-2xl font-bold font-sans">{stats?.premiumUsers ?? 0}</div>
          <div className="text-xs text-amber-100 font-medium">Active VIP Members</div>
        </div>
      </div>

      {/* Premium Users List */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
        <h3 className="font-sans font-bold text-base text-gray-900 mb-4">
          Subscribed Members
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/70 text-[11px] uppercase tracking-wider font-semibold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Plan Status</th>
                <th className="py-3 px-4">Expires At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">Loading subscriptions...</td>
                </tr>
              ) : premiumUsers?.users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">No active premium users yet.</td>
                </tr>
              ) : (
                premiumUsers?.users.map((user) => (
                  <tr key={user._id} className="hover:bg-brand-50/30">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{user.name} ({user.email})</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>Premium</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {user.subscription?.expiresAt
                        ? new Date(user.subscription.expiresAt).toLocaleDateString()
                        : "Active (Lifetime / Dev)"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
