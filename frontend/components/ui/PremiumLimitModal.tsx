import React from "react";
import { Crown, Sparkles, X, Heart, Infinity } from "lucide-react";
import Link from "next/link";

interface PremiumLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function PremiumLimitModal({ 
  isOpen, 
  onClose, 
  title = "Out of Swipes!", 
  description = "You've reached your daily limit. Upgrade to NIRA Premium for unlimited likes and much more." 
}: PremiumLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header pattern */}
        <div className="bg-gradient-to-r from-[#82444D] to-[#5a2e34] p-8 text-center relative overflow-hidden">
          <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-400/50 animate-pulse" />
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
            <Crown className="w-10 h-10 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Body features */}
        <div className="p-6 bg-white">
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mr-4">
                <Infinity className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Unlimited Swipes</h4>
                <p className="text-xs text-gray-500">Never run out of likes again</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mr-4">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">See who likes you</h4>
                <p className="text-xs text-gray-500">Unblur your admirers instantly</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link 
              href="/premium"
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-xl font-bold transition-all shadow-md flex justify-center items-center"
            >
              Unlock Premium
            </Link>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-semibold transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        
        {/* Close cross */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
