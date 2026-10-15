"use client";

import { useState } from "react";
import { PlusCircle, X, Check, Loader2, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { useExtendVipSubscription } from "../../admin.queries";
import { AdminSubscriber } from "../../admin.api";

interface AdminExtendVipModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: AdminSubscriber | null;
}

export function AdminExtendVipModal({ isOpen, onClose, subscriber }: AdminExtendVipModalProps) {
  const [days, setDays] = useState<number>(30);
  const [note, setNote] = useState("");

  const extendMutation = useExtendVipSubscription();

  if (!isOpen || !subscriber) return null;

  const handleConfirm = () => {
    extendMutation.mutate(
      {
        subscriberId: subscriber._id,
        days,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setDays(30);
          setNote("");
          onClose();
        },
      }
    );
  };

  const extensionOptions = [
    { value: 30, label: "+30 Days", desc: "1 Month Validity", badge: "Popular" },
    { value: 90, label: "+90 Days", desc: "3 Months Validity", badge: "Quarterly" },
    { value: 180, label: "+180 Days", desc: "6 Months Validity", badge: "Half Year" },
    { value: 36500, label: "Lifetime", desc: "Perpetual VIP Access", badge: "Infinite" },
  ];

  const currentExpiry = subscriber.subscription.expiresAt
    ? new Date(subscriber.subscription.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Lifetime / No Expiry";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-900 via-[#8f3b4d] to-[#7a303f] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <PlusCircle className="w-5 h-5 text-brand-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Extend VIP Validity</h3>
              <p className="text-xs text-brand-100 mt-0.5">Add extra premium validity days to this member's account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Subscriber Info Box */}
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-white border border-brand-200 shrink-0 shadow-2xs">
                {subscriber.photo ? (
                  <img src={subscriber.photo} alt={subscriber.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-brand-900 bg-brand-100">
                    {subscriber.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>{subscriber.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-100 text-brand-900">
                    VIP
                  </span>
                </div>
                <div className="text-xs text-gray-500">{subscriber.email}</div>
                <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-900" />
                  <span>Current Expiry: <strong className="text-gray-700">{currentExpiry}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Extension Duration Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Select Extension Duration
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {extensionOptions.map((opt) => {
                const isSelected = days === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDays(opt.value)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-brand-900 bg-brand-50/70 text-brand-900 ring-2 ring-brand-900/10 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isSelected ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Admin Note / Reason (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Loyalty reward, compensated service issue, customer request"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-brand-900 focus:ring-1 focus:ring-brand-900/20 text-gray-800 placeholder-gray-400 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={extendMutation.isPending}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={extendMutation.isPending}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            {extendMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extending...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-brand-100" />
                <span>Confirm Extension</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
