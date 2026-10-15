"use client";

import { useState } from "react";
import { AdminReport } from "../../admin.api";
import { AlertTriangle, X, Loader2, ShieldAlert } from "lucide-react";

interface AdminIssueWarningModalProps {
  report: AdminReport | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmWarning: (reportId: string, message: string) => void;
  isPending: boolean;
}

export function AdminIssueWarningModal({
  report,
  isOpen,
  onClose,
  onConfirmWarning,
  isPending,
}: AdminIssueWarningModalProps) {
  const PRESET_MESSAGES = [
    "Safety Notice: Inappropriate language or harassing behaviour violates NIRA community guidelines.",
    "Profile Photo Notice: Please upload a clear and genuine picture of yourself. Non-compliant photos may lead to suspension.",
    "Policy Notice: Sharing personal phone numbers or social links in public bio is not permitted.",
    "Financial Safety Notice: Solicitations or requests for money are strictly prohibited on NIRA.",
  ];

  const [selectedPreset, setSelectedPreset] = useState(PRESET_MESSAGES[0]);
  const [customNote, setCustomNote] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen || !report) return null;

  const currentWarnings = report.targetId?.warningsCount || 0;
  const nextWarningNumber = currentWarnings + 1;

  const handleSend = () => {
    const finalMsg = useCustom ? customNote.trim() : selectedPreset;
    if (!finalMsg) return;
    onConfirmWarning(report._id, finalMsg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200/80 flex items-center justify-center text-orange-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-gray-900 leading-tight">
                Issue Official Warning
              </h2>
              <span className="text-xs text-gray-400">
                Member: <strong className="text-gray-700">{report.targetId?.name}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Warning Level Alert Box */}
          <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/70 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-950 space-y-1">
              <div className="font-bold">
                Warning Strike #{nextWarningNumber} for this member
              </div>
              <p className="text-orange-800 leading-relaxed">
                This official notice will be recorded on the user's profile and displayed as an in-app safety alert when they log in.
              </p>
            </div>
          </div>

          {/* Original Complaint Context */}
          <div className="text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Complaint filed by {report.actorId?.name || "Member"}:
            </span>
            <p className="text-gray-700 italic">
              "{report.reason || "Flagged for safety/policy violation"}"
            </p>
          </div>

          {/* Preset Warning Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 block">
              Select Warning Reason:
            </span>

            <div className="space-y-2">
              {PRESET_MESSAGES.map((msg, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    !useCustom && selectedPreset === msg
                      ? "bg-brand-50/70 border-brand-900/30 text-gray-900 shadow-2xs"
                      : "bg-white border-gray-200/80 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedPreset(msg);
                    setUseCustom(false);
                  }}
                >
                  <input
                    type="radio"
                    name="warningPreset"
                    checked={!useCustom && selectedPreset === msg}
                    onChange={() => {
                      setSelectedPreset(msg);
                      setUseCustom(false);
                    }}
                    className="mt-0.5 text-brand-900"
                  />
                  <span className="leading-relaxed">{msg}</span>
                </label>
              ))}

              {/* Custom message option */}
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  useCustom
                    ? "bg-brand-50/70 border-brand-900/30 text-gray-900 shadow-2xs"
                    : "bg-white border-gray-200/80 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setUseCustom(true)}
              >
                <input
                  type="radio"
                  name="warningPreset"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                  className="mt-0.5 text-brand-900"
                />
                <span className="leading-relaxed font-semibold">Write Custom Warning Message</span>
              </label>

              {useCustom && (
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Type specific guidelines or violation details for this user..."
                  rows={3}
                  className="w-full mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-900/10 focus:border-brand-900"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isPending || (useCustom && !customNote.trim())}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center space-x-1.5 shadow-2xs disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>Send Official Warning</span>
          </button>
        </div>
      </div>
    </div>
  );
}
