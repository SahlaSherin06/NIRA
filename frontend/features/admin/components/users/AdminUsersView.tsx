"use client";

import { useState } from "react";
import {
  useAdminUsers,
  useToggleBanUser,
} from "../../admin.queries";
import { AdminUser } from "../../admin.api";
import { AdminUsersMetrics } from "./AdminUsersMetrics";
import { AdminUsersFilterBar } from "./AdminUsersFilterBar";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminUserProfileModal } from "./AdminUserProfileModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminUsersView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [gender, setGender] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data, isLoading } = useAdminUsers({ page, search, filter, gender });
  const toggleBan = useToggleBanUser();

  // Keep modal user data in sync when toggled
  const handleToggleBan = (id: string) => {
    toggleBan.mutate(id, {
      onSuccess: () => {
        if (selectedUser && selectedUser._id === id) {
          setSelectedUser((prev) => (prev ? { ...prev, isBanned: !prev.isBanned } : null));
        }
      },
    });
  };

  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-brand-900 tracking-tight">
            Member Management & Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real photos, verified biodata, matrimonial intents, and administrative access controls.
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics */}
      <AdminUsersMetrics metrics={data?.metrics} isLoading={isLoading} />

      {/* 3. Search & Smart Filters Toolbar */}
      <AdminUsersFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filter={filter}
        onFilterChange={(val) => {
          setFilter(val);
          setPage(1);
        }}
        gender={gender}
        onGenderChange={(val) => {
          setGender(val);
          setPage(1);
        }}
        totalResults={data?.total}
      />

      {/* 4. Enhanced Users Data Table with Real Photos */}
      <AdminUsersTable
        users={data?.users || []}
        isLoading={isLoading}
        onViewProfile={(u) => setSelectedUser(u)}
        onToggleBan={handleToggleBan}
        isBanPending={toggleBan.isPending}
      />

      {/* 5. Pagination Controls */}
      {data && data.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-2xs text-xs">
          <div className="text-gray-500 font-medium text-center sm:text-left">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {(page - 1) * 12 + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-900">
              {Math.min(page * 12, data.total)}
            </span>{" "}
            of <span className="font-bold text-gray-900">{data.total}</span> members
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/60 font-semibold text-gray-700">
              Page {page} of {totalPages}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Member Biodata & Photos Inspector Modal */}
      <AdminUserProfileModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleBan={handleToggleBan}
        isBanPending={toggleBan.isPending}
      />
    </div>
  );
}
