"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

/**
 * Component: CustomSelect
 * Mobile-responsive custom select dropdown that strictly adheres to the layout width,
 * avoiding native browser OS popup overflow issues in mobile views.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  searchable,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search for lists with more than 10 items unless explicitly set
  const isSearchable = searchable ?? options.length > 10;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  const filteredOptions = isSearchable && searchTerm.trim()
    ? options.filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    : options;

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left flex items-center justify-between cursor-pointer select-none transition-all ${className} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${isOpen ? "ring-4 ring-brand-900/10 border-brand-900/40" : ""}`}
      >
        <span className={`truncate mr-2 ${value ? "text-gray-800 font-medium" : "text-gray-400"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-900" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu (Strictly constrained within parent width) */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-brand-900/10 border border-gray-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ maxWidth: "100%" }}
        >
          {isSearchable && (
            <div className="p-2 border-b border-gray-100 bg-[#FAF8F7]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-900/20 text-gray-800 placeholder:text-gray-400"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm("");
                    }}
                    className="absolute right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-56 sm:max-h-64 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-brand-900 text-white font-semibold"
                        : "text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-gray-400">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
