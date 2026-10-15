"use client";

import { useState } from "react";
import { Crown, X, Search, Check, Loader2, Sparkles, User as UserIcon } from "lucide-react";
import { useEligibleUsersForGrant, useGrantVipAccess } from "../../admin.queries";
import { EligibleUserForGrant } from "../../admin.api";

interface AdminGrantVipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminGrantVipModal({ isOpen, onClose }: AdminGrantVipModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<EligibleUserForGrant | null>(null);
  const [duration, setDuration] = useState<"1_month" | "3_months" | "6_months" | "lifetime">("1_month");
  const [note, setNote] = useState("");

  const { data, isLoading: isSearching } = useEligibleUsersForGrant(searchTerm);
  const grantMutation = useGrantVipAccess();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedUser) return;
    grantMutation.mutate(
      {
        userId: selectedUser._id,
        duration,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setSelectedUser(null);
          setSearchTerm("");
          setNote("");
          onClose();
        },
      }
    );
  };

  const durationOptions = [
    { id: "1_month", label: "1 Month VIP", desc: "30 Days Access (₹499)", badge: "Standard" },
    { id: "3_months", label: "3 Months VIP", desc: "90 Days Access (₹1,199)", badge: "Popular" },
    { id: "6_months", label: "6 Months VIP", desc: "180 Days Access (₹1,999)", badge: "Semi-Annual" },
    { id: "lifetime", label: "Lifetime VIP", desc: "Unlimited Access (₹4,999)", badge: "Perpetual" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-900 via-[#8f3b4d] to-[#7a303f] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <Crown className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Grant VIP Membership</h3>
              <p className="text-xs text-brand-100 mt-0.5">Manually gift or assign a VIP pass to any member</p>
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
          {/* 1. Member Selector / Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              1. Select Member
            </label>

            {selectedUser ? (
              <div className="p-3 rounded-2xl bg-brand-50/70 border border-brand-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-brand-200 shrink-0">
                    {selectedUser.photo ? (
                      <img src={selectedUser.photo} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-brand-900">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{selectedUser.name}</div>
                    <div className="text-xs text-gray-500">{selectedUser.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-brand-900 hover:underline font-semibold cursor-pointer px-2 py-1"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search member by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/10 focus:border-brand-900"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-gray-100 p-1 bg-gray-50/50 custom-scrollbar">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-900" /> Searching members...
                    </div>
                  ) : !data?.users || data.users.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">
                      No matching members found.
                    </div>
                  ) : (
                    data.users.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="w-full text-left p-2 rounded-lg hover:bg-white flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-brand-100/50 text-brand-900 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {u.photo ? (
                              <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-gray-800 truncate">{u.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{u.email}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-brand-900 opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              2. VIP Duration
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {durationOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDuration(opt.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    duration === opt.id
                      ? "bg-brand-50 border-brand-900 shadow-2xs"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${duration === opt.id ? "text-brand-900" : "text-gray-900"}`}>
                      {opt.label}
                    </span>
                    {duration === opt.id && <Check className="w-3.5 h-3.5 text-brand-900" />}
                  </div>
                  <span className="text-[10px] text-gray-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Admin Reason / Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              3. Note / Grant Reason (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Promotional VIP pass, Customer support complimentary, Influencer partner..."
              rows={2}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/10 focus:border-brand-900 font-sans"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedUser || grantMutation.isPending}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-900 hover:bg-brand-800 text-white transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            {grantMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm & Grant VIP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
