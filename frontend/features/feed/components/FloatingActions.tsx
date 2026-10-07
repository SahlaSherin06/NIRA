import React from "react";
import { X, Check } from "lucide-react";

interface FloatingActionsProps {
  onPass: () => void;
  onLike: () => void;
  disabled?: boolean;
  className?: string;
}

export function FloatingActions({ onPass, onLike, disabled, className }: FloatingActionsProps) {
  return (
    <div className={`flex items-center justify-between w-full px-6 md:px-12 z-50 pointer-events-none ${className || ''}`}>
      
      {/* Pass / Cross Button */}
      <button
        onClick={onPass}
        disabled={disabled}
        className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-800 shadow-[0_10px_30px_rgba(31,41,55,0.4)] flex items-center justify-center text-white hover:bg-gray-900 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 border-2 border-gray-600 group"
        aria-label="Pass"
      >
        <X className="w-6 h-6 md:w-7 md:h-7 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all" strokeWidth={3} />
      </button>

      {/* Like / Tick Button (Right Side of Card) */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="pointer-events-auto w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand-900 shadow-[0_15px_35px_rgba(139,66,83,0.4)] flex items-center justify-center text-white hover:bg-brand-800 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 border-2 border-white group"
        aria-label="Like"
      >
        <Check className="w-7 h-7 md:w-8 md:h-8 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all" strokeWidth={3} />
      </button>
      
    </div>
  );
}
