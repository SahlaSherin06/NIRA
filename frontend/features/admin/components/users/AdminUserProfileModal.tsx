"use client";

import { useState } from "react";
import { AdminUser } from "../../admin.api";
import {
  X,
  Crown,
  Ban,
  CheckCircle2,
  Briefcase,
  Heart,
  User,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

interface AdminUserProfileModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBan: (id: string) => void;
  isBanPending: boolean;
}

export function AdminUserProfileModal({
  user,
  isOpen,
  onClose,
  onToggleBan,
  isBanPending,
}: AdminUserProfileModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const prof = user.profile;
  const realMainPhoto = user.photo || prof?.mainPhoto || null;
  const gallery = user.galleryPhotos?.length ? user.galleryPhotos : prof?.galleryPhotos || [];
  const allPhotos = realMainPhoto ? [realMainPhoto, ...gallery.filter(p => p !== realMainPhoto)] : gallery;
  const activeDisplayPhoto = selectedPhoto || realMainPhoto || allPhotos[0] || null;

  // Format age from DOB
  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? age : null;
    } catch {
      return null;
    }
  };

  const age = calculateAge(prof?.dob);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100/70 flex items-center justify-center text-brand-900 font-serif font-bold text-sm">
              N
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-sans text-gray-900 leading-tight">
                Member Biodata & Verification
              </h2>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate block max-w-[180px] sm:max-w-none">
                ID: {user._id}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">

          {/* 1. Identity & Real Photos Section */}
          <div className="bg-[#FCFAF8] p-4 sm:p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-5 sm:gap-6 items-start">
            
            {/* Real Photo Viewer */}
            <div className="w-full md:w-56 shrink-0 flex flex-col items-center">
              <div className="w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md relative group">
                {activeDisplayPhoto ? (
                  <img
                    src={activeDisplayPhoto}
                    alt={user.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-400">
                    <User className="w-12 h-12 stroke-[1.5] mb-2 text-gray-300" />
                    <span className="text-xs font-semibold">No Real Photo Uploaded</span>
                  </div>
                )}

                {/* VIP / Verification overlay tag */}
                {user.subscription?.plan === "premium" && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-white" />
                    <span>VIP Member</span>
                  </span>
                )}
              </div>

              {/* Gallery Thumbnails Strip */}
              {allPhotos.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1">
                  {allPhotos.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPhoto(img)}
                      className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeDisplayPhoto === img ? "border-brand-900 ring-2 ring-brand-900/20 scale-105" : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Member Primary Info */}
            <div className="flex-1 space-y-3.5 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-sans text-gray-900 tracking-tight">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.isBanned ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspended</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  )}

                  {user.isEmailVerified ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      Email Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                      Unverified
                    </span>
                  )}

                  {user.isOnboardingComplete ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Profile Complete
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      Draft Profile
                    </span>
                  )}
                </div>
              </div>

              {/* Key Biodata Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Gender & Intent</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {user.gender || "Not set"} • {user.createdFor || "Self"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Age & Height</span>
                  <span className="font-semibold text-gray-900">
                    {age ? `${age} yrs` : "DOB not set"}{prof?.height ? ` • ${prof.height}` : ""}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Location</span>
                  <span className="font-semibold text-gray-900 truncate block">
                    {prof?.city ? `${prof.city}, ${prof.state || ""}` : "Not specified"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Religion & Caste</span>
                  <span className="font-semibold text-gray-900 truncate block">
                    {prof?.religion ? `${prof.religion}${prof.caste ? ` (${prof.caste})` : ""}` : "Not specified"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Profession</span>
                  <span className="font-semibold text-gray-900 truncate block">
                    {prof?.profession || "Not specified"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Registered On</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Bio summary */}
              {prof?.bio && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    About / Bio
                  </span>
                  <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100 leading-relaxed italic">
                    "{prof.bio}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Detailed Biodata Tabs / Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Background & Lifestyle */}
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Heart className="w-3.5 h-3.5 text-brand-900" />
                <span>Background & Lifestyle</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Marital Status</span>
                  <span className="font-semibold text-gray-800 capitalize">{prof?.maritalStatus || "Unmarried"}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Mother Tongue</span>
                  <span className="font-semibold text-gray-800">{prof?.motherTongue || "Not set"}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Diet & Habits</span>
                  <span className="font-semibold text-gray-800 capitalize">{prof?.diet || "Not set"}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Blood Group</span>
                  <span className="font-semibold text-gray-800">{prof?.bloodGroup || "Not set"}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Smoking / Drinking</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {prof?.smoke || "No"} / {prof?.drink || "No"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Marry Within</span>
                  <span className="font-semibold text-gray-800">{prof?.marryWithin || "Flexible"}</span>
                </div>
              </div>
            </div>

            {/* Education & Career */}
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Briefcase className="w-3.5 h-3.5 text-brand-900" />
                <span>Career & Education</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Highest Education</span>
                  <span className="font-semibold text-gray-800">{prof?.educationLevel || "Not set"}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Profession</span>
                  <span className="font-semibold text-gray-800">{prof?.profession || "Not set"}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Annual Income</span>
                  <span className="font-semibold text-gray-800">{prof?.annualIncome || "Undisclosed"}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Country of Residence</span>
                  <span className="font-semibold text-gray-800">{prof?.country || "India"}</span>
                </div>
              </div>

              {/* Personality / Interests tags */}
              {prof?.personality && prof.personality.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Personality Traits</span>
                  <div className="flex flex-wrap gap-1">
                    {prof.personality.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 text-[10px] font-medium border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Bottom Moderation Action Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-medium">
            Administrative controls for <span className="font-bold text-gray-900">{user.name}</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {/* Toggle Ban */}
            <button
              onClick={() => onToggleBan(user._id)}
              disabled={isBanPending}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs ${
                user.isBanned
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {isBanPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Ban className="w-3.5 h-3.5" />
              )}
              <span>{user.isBanned ? "Unban Account" : "Suspend Account"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
