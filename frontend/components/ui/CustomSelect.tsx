"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Component: CustomSelect
 * Mobile-responsive custom select dropdown.
 * - On Mobile (screen < 640px): Opens a Bottom Sheet Modal via React Portal directly into document.body with z-[9999],
 *   completely bypassing any CSS stacking context or card overflow clipping.
 * - On Desktop (screen >= 640px): Opens a smooth dropdown menu below the trigger.
 * - Pure selectable options list: no upfront text search box.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Do not close if click was inside container or inside mobile sheet
      if (containerRef.current?.contains(target)) return;
      if (sheetRef.current?.contains(target)) return;

      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Lock mobile body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
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

      {/* DESKTOP Dropdown Menu (>= sm) */}
      {isOpen && (
        <div
          className="hidden sm:block absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl shadow-brand-900/10 border border-gray-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ maxWidth: "100%" }}
        >
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200">
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-brand-900 text-white font-semibold"
                      : "text-gray-700 hover:bg-brand-50 hover:text-brand-900"
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MOBILE Bottom Sheet Portal (< sm) */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="sm:hidden fixed inset-0 z-[9999] flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Drawer Sheet */}
            <div
              ref={sheetRef}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-h-[80vh] bg-white rounded-t-[2rem] shadow-2xl p-5 pb-8 flex flex-col animate-in slide-in-from-bottom duration-300"
            >
              {/* Top Handle Pill */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3.5 shrink-0" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0 px-1">
                <h3 className="font-serif font-semibold text-gray-900 text-base">
                  {placeholder}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options List */}
              <div className="overflow-y-auto max-h-[60vh] py-2.5 space-y-1.5 scrollbar-thin">
                {options.map((opt) => {
                  const isSelected = value === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-brand-900 text-white font-semibold shadow-sm"
                          : "text-gray-700 bg-gray-50/70 hover:bg-brand-50 hover:text-brand-900 active:bg-gray-100"
                      }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
