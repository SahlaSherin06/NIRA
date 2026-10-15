"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Filter, ChevronDown, Users, Check } from "lucide-react";

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
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (genderRef.current && !genderRef.current.contains(event.target as Node)) {
        setIsGenderOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const currentStatusLabel = statusTabs.find((t) => t.id === filter)?.label || "All Members";
  const currentGenderLabel = genderOptions.find((t) => t.id === gender)?.label || "All Genders";

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-2xs space-y-3">
      {/* 1. Top Row: Search Input & (Desktop Gender Filter + Count) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
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

        {/* Desktop Gender Filter & Count (hidden on mobile, visible on md+) */}
        <div className="hidden md:flex items-center space-x-2.5 justify-end">
          <div className="flex items-center space-x-1 p-1 bg-gray-100/70 rounded-xl border border-gray-200/60">
            {genderOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onGenderChange(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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

      {/* 2. Responsive Mobile Dropdowns (< md) */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden pt-0.5">
        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
            <Filter className="w-2.5 h-2.5 text-brand-900" />
            <span>Status</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen((prev) => !prev);
                setIsGenderOpen(false);
              }}
              className="w-full pl-3 pr-7 py-2 rounded-xl bg-gray-50/90 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-between cursor-pointer shadow-2xs transition-all text-left"
            >
              <span className="truncate">{currentStatusLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-200 ${
                  isStatusOpen ? "rotate-180 text-brand-900" : ""
                }`}
              />
            </button>

            {isStatusOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {statusTabs.map((tab) => {
                  const isSelected = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        onFilterChange(tab.id);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-brand-50 text-brand-900 font-bold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-brand-900 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Gender Dropdown */}
        <div className="relative" ref={genderRef}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
            <Users className="w-2.5 h-2.5 text-brand-900" />
            <span>Gender</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsGenderOpen((prev) => !prev);
                setIsStatusOpen(false);
              }}
              className="w-full pl-3 pr-7 py-2 rounded-xl bg-gray-50/90 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-between cursor-pointer shadow-2xs transition-all text-left"
            >
              <span className="truncate">{currentGenderLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-200 ${
                  isGenderOpen ? "rotate-180 text-brand-900" : ""
                }`}
              />
            </button>

            {isGenderOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {genderOptions.map((opt) => {
                  const isSelected = gender === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onGenderChange(opt.id);
                        setIsGenderOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-brand-50 text-brand-900 font-bold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-brand-900 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Total Results Badge */}
        {totalResults !== undefined && (
          <div className="col-span-2 flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
            <span className="font-medium">Total matching:</span>
            <span className="font-bold text-gray-900 bg-gray-100/80 px-2 py-0.5 rounded-md">
              {totalResults} {totalResults === 1 ? "member" : "members"}
            </span>
          </div>
        )}
      </div>

      {/* 3. Desktop Bottom Row: Status Filter Tabs (hidden on mobile, visible on md+) */}
      <div className="hidden md:flex items-center space-x-1.5 overflow-x-auto pb-0.5 pt-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" />
          <span>Status:</span>
        </span>

        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
