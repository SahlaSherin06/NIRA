"use client";

import { Search, X, Filter } from "lucide-react";

interface AdminUsersFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: string;
  onFilterChange: (val: string) => void;
  gender: string;
  onGenderChange: (val: string) => void;
  totalResults?: number;
}

export function AdminUsersFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  gender,
  onGenderChange,
  totalResults,
}: AdminUsersFilterBarProps) {
  const statusTabs = [
    { id: "all", label: "All Members" },
    { id: "premium", label: "VIP Members" },
    { id: "banned", label: "Suspended" },
  ];

  const genderOptions = [
    { id: "all", label: "All Genders" },
    { id: "male", label: "Grooms (Male)" },
    { id: "female", label: "Brides (Female)" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs space-y-3.5">
      {/* Top Row: Search & Gender Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by member name or email..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/10 focus:border-brand-900 placeholder:text-gray-400 transition-all font-sans"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Gender Filter & Total Matching Count */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1 p-1 bg-gray-100/70 rounded-xl border border-gray-200/60">
            {genderOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onGenderChange(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  gender === opt.id
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {totalResults !== undefined && (
            <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">
              {totalResults} {totalResults === 1 ? "member" : "members"}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 custom-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" />
          <span>Status:</span>
        </span>

        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filter === tab.id
                ? "bg-brand-900 text-white shadow-2xs"
                : "bg-gray-100/70 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
