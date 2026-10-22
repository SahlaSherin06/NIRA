import { Lock } from "lucide-react";
import React, { useState } from "react";
import { Recommendation } from "../feed.api";
import { useSession } from "@/features/auth/auth.queries";
import { useRouter } from "next/navigation";
import { 
  MapPin,
    Crown, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  User, 
  Globe, 
  Utensils, 
  Languages, 
  Ban,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface ProfileCardProps {
  user: Recommendation;
  isMatch?: boolean;
  onAction?: (action: "block" | "report", reason?: string) => void;
}

export function ProfileCard({ user, onAction, isMatch = false }: ProfileCardProps) {
  const { data: session } = useSession();
  const isPremium = session?.user?.subscription?.plan === 'premium';
  const router = useRouter();
  const { profile } = user;
  const isBlurred = profile.photoPrivacy === "Blurred" && !isPremium && !isMatch;
  const [confirmAction, setConfirmAction] = useState<"block" | "report" | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  
  // Calculate Age from dob
  const age = new Date().getFullYear() - new Date(profile.dob).getFullYear();

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col mb-0 pb-4">
      <div className="flex-1 pb-28 md:pb-20">
        
        {/* SECTION 1: Main Photo */}
        <div className="relative w-full aspect-[4/5] bg-gray-100">
          <img 
            src={profile.mainPhoto || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80"} 
            alt={user.name}
            className={`w-full h-full object-cover ${isBlurred ? 'blur-2xl scale-110 grayscale-[50%]' : ''}`}
          />
          {isBlurred && (
            <div onClick={(e) => { e.stopPropagation(); router.push('/premium'); }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10 cursor-pointer hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-bold text-lg drop-shadow-md px-6 text-center">Private Photo</p>
              <button className="mt-3 px-4 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">Upgrade to view</button>
            </div>
          )}
          {/* Gradient overlay for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-4xl font-bold font-serif shadow-sm flex items-center">{user.name}, {age}
                  {user.subscription?.plan === 'premium' && (
                    <span className="ml-3 bg-gradient-to-r from-yellow-400 to-yellow-600 p-1.5 rounded-full shadow-lg inline-flex" title="Premium Member">
                      <Crown className="w-6 h-6 text-white" />
                    </span>
                  )}</h2>
            <div className="flex items-center mt-2 space-x-2 text-white/90 font-medium">
              <MapPin className="w-4 h-4" />
              <span>{profile.city}, {profile.country}</span>
            </div>
            <div className="flex items-center mt-1 space-x-2 text-white/90 font-medium">
              <Briefcase className="w-4 h-4" />
              <span>{profile.profession}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: About (Vitals) */}
        <div className="p-6 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4">About</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-50">
              <span className="block text-xs text-brand-900 uppercase tracking-wider font-bold mb-1">Height</span>
              <span className="text-gray-900 font-medium">{profile.height} cm</span>
            </div>
            <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-50">
              <span className="block text-xs text-brand-900 uppercase tracking-wider font-bold mb-1">Weight</span>
              <span className="text-gray-900 font-medium">{profile.weight} kg</span>
            </div>
            <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-50">
              <span className="block text-xs text-brand-900 uppercase tracking-wider font-bold mb-1">Marital Status</span>
              <span className="text-gray-900 font-medium">{profile.maritalStatus}</span>
            </div>
            <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-50">
              <span className="block text-xs text-brand-900 uppercase tracking-wider font-bold mb-1">Children</span>
              <span className="text-gray-900 font-medium">{profile.haveChildren}</span>
            </div>
          </div>
          
          {profile.bio && (
            <p className="mt-6 text-gray-700 leading-relaxed italic border-l-4 border-brand-200 pl-4">
              "{profile.bio}"
            </p>
          )}
        </div>

        {/* SECTION 3: Marriage Intent Timeline */}
        <div className="p-6 bg-cream border-t border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-brand-900 fill-brand-900" />
            Marriage Intentions
          </h3>
          
          <div className="relative pl-6 border-l-2 border-brand-200 space-y-8">
            <div className="relative">
              <div className="absolute -left-[31px] bg-brand-900 w-4 h-4 rounded-full border-4 border-cream"></div>
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Looking for</p>
              <p className="text-gray-600 font-medium">{profile.whatBringsYouHere}</p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-[31px] bg-brand-900 w-4 h-4 rounded-full border-4 border-cream"></div>
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Wants to know someone for</p>
              <p className="text-gray-600 font-medium">{profile.knowSomeoneFor}</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] bg-brand-900 w-4 h-4 rounded-full border-4 border-cream"></div>
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Wants to marry within</p>
              <p className="text-brand-900 font-bold">{profile.marryWithin}</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: Gallery Photo 1 & Hobbies */}
        {profile.galleryPhotos && profile.galleryPhotos.length > 0 && (
          <div className="w-full aspect-square bg-gray-100 relative">
            <img 
              src={profile.galleryPhotos[0]} 
              alt={`${user.name} gallery 1`}
              className={`w-full h-full object-cover ${isBlurred ? 'blur-2xl scale-110 grayscale-[30%]' : ''}`}
            />
            {isBlurred && (
              <div onClick={(e) => { e.stopPropagation(); router.push('/premium'); }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10 cursor-pointer hover:bg-black/40 transition-colors">
                <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-white/20">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-bold text-sm drop-shadow-md">Private Photo</p>
                <button className="mt-2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md hover:bg-yellow-300">Upgrade to view</button>
              </div>
            )}
          </div>
        )}

        <div className="p-6 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lifestyle & Interests</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.interests?.map((interest, i) => (
              <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <Utensils className="w-5 h-5 text-gray-500 mr-4" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Diet</p>
                <p className="font-medium text-gray-900">{profile.diet}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-gray-500 mr-4" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Personality</p>
                <p className="font-medium text-gray-900">{profile.personality?.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Gallery Photo 2 & Career */}
        {profile.galleryPhotos && profile.galleryPhotos.length > 1 && (
          <div className="w-full aspect-square bg-gray-100 relative">
            <img 
              src={profile.galleryPhotos[1]} 
              alt={`${user.name} gallery 2`}
              className={`w-full h-full object-cover ${isBlurred ? 'blur-2xl scale-110 grayscale-[30%]' : ''}`}
            />
            {isBlurred && (
              <div onClick={(e) => { e.stopPropagation(); router.push('/premium'); }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10 cursor-pointer hover:bg-black/40 transition-colors">
                <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-white/20">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-bold text-sm drop-shadow-md">Private Photo</p>
                <button className="mt-2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md hover:bg-yellow-300">Upgrade to view</button>
              </div>
            )}
          </div>
        )}

        <div className="p-6 bg-white pb-12">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Background</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-brand-50/30 rounded-xl border border-brand-50">
              <GraduationCap className="w-5 h-5 text-brand-900 mr-4" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Education</p>
                <p className="font-medium text-gray-900">{profile.educationLevel}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-brand-50/30 rounded-xl border border-brand-50">
              <Languages className="w-5 h-5 text-brand-900 mr-4" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Mother Tongue</p>
                <p className="font-medium text-gray-900">{profile.motherTongue}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-brand-50/30 rounded-xl border border-brand-50">
              <Globe className="w-5 h-5 text-brand-900 mr-4" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Ethnicity & Religion</p>
                <p className="font-medium text-gray-900">{profile.ethnicity}, {profile.religion}</p>
              </div>
            </div>
          </div>
          
          
            {/* Remaining Gallery Photos (Photo 3, 4, 5, 6...) */}
            {profile.galleryPhotos && profile.galleryPhotos.length > 2 && (
              <div className="mt-6 space-y-4 mb-8">
                {profile.galleryPhotos.slice(2).map((photo, index) => (
                  <div key={index + 2} className="w-full aspect-square bg-gray-100 relative overflow-hidden shadow-sm rounded-3xl border border-gray-100">
                    <img 
                      src={photo} 
                      alt={`${user.name} gallery ${index + 3}`}
                      className={`w-full h-full object-cover ${isBlurred ? 'blur-2xl scale-110 grayscale-[30%]' : ''}`}
                    />
                    {isBlurred && (
                      <div onClick={(e) => { e.stopPropagation(); router.push('/premium'); }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10 cursor-pointer hover:bg-black/40 transition-colors">
                        <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-white/20">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white font-bold text-sm drop-shadow-md">Private Photo</p>
                        <button className="mt-2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md hover:bg-yellow-300">Upgrade to view</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
<div className="mt-8 border-t border-gray-100 pt-8">
            {confirmAction === "block" ? (
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center animate-in fade-in zoom-in duration-200">
                <Ban className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm font-bold text-gray-700 mb-4 text-center">Are you sure you want to block {user.name}?</p>
                <div className="flex space-x-3 w-full">
                  <button 
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-2 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setConfirmAction(null);
                      if (onAction) onAction("block");
                    }}
                    className="flex-1 py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
                  >
                    Confirm Block
                  </button>
                </div>
              </div>
            ) : confirmAction === "report" ? (
              <div className="bg-red-50 rounded-xl p-4 flex flex-col items-center animate-in fade-in zoom-in duration-200">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm font-bold text-red-900 mb-4 text-center">Report {user.name} for inappropriate behavior?</p>
                
                <div className="w-full mb-4 space-y-2">
                  {["Fake Profile", "Inappropriate Content", "Harassment or bullying", "Underage", "Spam or Scam", "Other"].map((reason) => (
                    <label key={reason} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-red-100 cursor-pointer hover:bg-red-50/50 transition">
                      <input 
                        type="radio" 
                        name="reportReason" 
                        value={reason} 
                        checked={reportReason === reason}
                        onChange={() => setReportReason(reason)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="flex space-x-3 w-full">
                  <button 
                    onClick={() => {
                      setConfirmAction(null);
                      setReportReason("");
                    }}
                    className="flex-1 py-2 text-sm font-bold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!reportReason}
                    onClick={() => {
                      if (!reportReason) return;
                      setConfirmAction(null);
                      if (onAction) onAction("report", reportReason);
                      setReportReason("");
                    }}
                    className="flex-1 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center space-x-4">
                <button 
                  onClick={() => setConfirmAction("block")}
                  className="flex items-center text-sm font-bold text-gray-400 hover:text-gray-700 transition"
                >
                  <Ban className="w-4 h-4 mr-1.5" />
                  Block Profile
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => setConfirmAction("report")}
                  className="flex items-center text-sm font-bold text-red-400 hover:text-red-600 transition"
                >
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  Report User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


