"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Filter, ChevronDown, Check, Crown } from "lucide-react";

interface AdminSubscriptionsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  totalResults?: number;
}

export function AdminSubscriptionsFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  totalResults,
}: AdminSubscriptionsFilterBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusTabs = [
    { id: "active", label: "Active VIP" },
    { id: "expiring_soon", label: "Expiring Soon" },
    { id: "expired", label: "Expired / Cancelled" },
    { id: "all", label: "All Subscribers" },
  ];

  const currentLabel = statusTabs.find((t) => t.id === status)?.label || "Active VIP";

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-2xs space-y-3">
      {/* 1. Top Row: Search Input & (Desktop Count Badge) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subscriber by name or email..."
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

        {/* Count Badge on desktop */}
        {totalResults !== undefined && (
          <div className="hidden md:flex items-center text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            {totalResults} {totalResults === 1 ? "subscriber" : "subscribers"}
          </div>
        )}
      </div>

      {/* 2. Responsive Mobile / Tablet Row (< md): Custom Dropdown & Count side-by-side */}
      <div className="flex md:hidden items-center gap-2.5 pt-0.5">
        <div className="flex-1 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full pl-3.5 pr-8 py-2 rounded-xl bg-gray-50/90 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-between cursor-pointer shadow-2xs transition-all text-left"
          >
            <span className="truncate">{currentLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-brand-900" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {statusTabs.map((tab) => {
                const isSelected = status === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onStatusChange(tab.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-brand-50 text-brand-900 font-bold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-900" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {totalResults !== undefined && (
          <div className="shrink-0 text-[11px] font-bold text-gray-700 bg-gray-100/90 px-3 py-2 rounded-xl border border-gray-200/60 whitespace-nowrap">
            {totalResults} {totalResults === 1 ? "subscriber" : "subscribers"}
          </div>
        )}
      </div>

      {/* 3. Desktop Bottom Row: Status Filter Tabs (>= md) */}
      <div className="hidden md:flex items-center space-x-1.5 overflow-x-auto pb-0.5 pt-0.5 custom-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3 text-brand-900" />
          <span>Plan Filter:</span>
        </span>

        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onStatusChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              status === tab.id
                ? "bg-brand-900 text-white shadow-2xs font-bold"
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
