"use client";

import { AdminUser } from "../../admin.api";
import {
  Ban,
  CheckCircle2,
  Crown,
  Eye,
  Loader2,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

interface AdminUsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  onViewProfile: (user: AdminUser) => void;
  onToggleBan: (id: string) => void;
  isBanPending: boolean;
}

export function AdminUsersTable({
  users,
  isLoading,
  onViewProfile,
  onToggleBan,
  isBanPending,
}: AdminUsersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/70 text-[11px] uppercase tracking-wider font-semibold text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3.5 px-6">Member Profile</th>
              <th className="py-3.5 px-6">Gender & Intent</th>
              <th className="py-3.5 px-6">Location & Career</th>
              <th className="py-3.5 px-6">Plan Status</th>
              <th className="py-3.5 px-6">Account Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-900" />
                  <span className="text-xs font-semibold">Loading member directory...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-gray-700">No members found</p>
                  <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const realPhoto = user.photo || user.profile?.mainPhoto;
                const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";
                const location = user.profile?.city
                  ? `${user.profile.city}${user.profile.state ? `, ${user.profile.state}` : ""}`
                  : null;
                const profession = user.profile?.profession;

                return (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* 1. Member: Real Photo + Name + Email */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-3">
                        {/* Real Photo Thumbnail */}
                        <div 
                          onClick={() => onViewProfile(user)}
                          className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0 relative cursor-pointer group-hover:ring-2 group-hover:ring-brand-900/20 transition-all shadow-2xs"
                        >
                          {realPhoto ? (
                            <img
                              src={realPhoto}
                              alt={user.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-900 font-serif font-bold text-sm">
                              {initials}
                            </div>
                          )}

                          {user.subscription?.plan === "premium" && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 rounded-tl-md flex items-center justify-center">
                              <Crown className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </div>

                        {/* Name & Email */}
                        <div className="min-w-0">
                          <button
                            onClick={() => onViewProfile(user)}
                            className="font-bold text-gray-900 hover:text-brand-900 text-sm tracking-tight text-left truncate block transition-colors cursor-pointer"
                          >
                            {user.name}
                          </button>
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Gender & Intent */}
                    <td className="py-3.5 px-6">
                      <div className="text-xs font-semibold text-gray-800 capitalize">
                        {user.gender || "Not set"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        For: <span className="font-medium text-gray-600">{user.createdFor || "Self"}</span>
                      </div>
                    </td>

                    {/* 3. Location & Career */}
                    <td className="py-3.5 px-6">
                      <div className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">
                        {profession || "Profession not set"}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[160px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{location || "Location not set"}</span>
                      </div>
                    </td>

                    {/* 4. Plan Status */}
                    <td className="py-3.5 px-6">
                      {user.subscription?.plan === "premium" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                          <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>VIP Member</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                          Free
                        </span>
                      )}
                    </td>

                    {/* 5. Account Status */}
                    <td className="py-3.5 px-6">
                      {user.isBanned ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <Ban className="w-3 h-3" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    {/* 6. Actions */}
                    <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* View Biodata Button */}
                      <button
                        onClick={() => onViewProfile(user)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title="View Full Biodata & Photos"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>View Biodata</span>
                      </button>

                      {/* Ban / Unban Button */}
                      <button
                        onClick={() => onToggleBan(user._id)}
                        disabled={isBanPending}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                          user.isBanned
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        }`}
                      >
                        {user.isBanned ? "Unban" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
