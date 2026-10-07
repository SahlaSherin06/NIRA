"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMatchesData, useAcceptInterest, useRemoveInterest, useReportInterest } from "../matches.queries";
import { MatchProfile } from "../matches.api";
import { MessageCircle, Check, MoreHorizontal, ShieldCheck, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NewMatchesCarousel = ({ profiles }: { profiles: MatchProfile[] }) => {
  if (profiles.length === 0) return null;

  return (
    <div className="w-full bg-brand-50/30 rounded-3xl p-6 mb-8 border border-brand-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-serif font-bold text-gray-900">New Matches</h3>
        <button className="text-xs font-semibold text-brand-900 hover:underline">View All Active</button>
      </div>
      <div className="flex space-x-6 overflow-x-auto pb-4 custom-scrollbar">
        {profiles.map(p => (
          <div key={p._id} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-brand-400 to-brand-900 mb-2 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                <img src={p.profile.mainPhoto} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-xs font-bold text-gray-900">{p.name.split(' ')[0]}</span>
            <span className="text-[10px] text-gray-500">
              {formatDistanceToNow(new Date(p.matchedAt), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MatchCard = React.memo(({ profile, type }: { profile: MatchProfile, type: 'mutual' | 'received' | 'sent' }) => {
  const { mutate: acceptInterest, isPending } = useAcceptInterest();
  const { mutate: removeInterest, isPending: isRemoving } = useRemoveInterest();
  const { mutate: reportInterest, isPending: isReporting } = useReportInterest();
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReport = () => {
    if (!reportReason) return;
    reportInterest({ targetId: profile._id, reason: reportReason });
    setShowReport(false);
    setReportReason("");
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50 flex flex-col h-full group cursor-pointer relative">
      
      {/* Image Section */}
      <div className="relative h-80 w-full bg-gray-100 overflow-hidden">
        <img 
          src={profile.profile.mainPhoto} 
          alt={profile.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        
        {/* Deep Gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-900 mr-1.5" />
          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Verified</span>
        </div>

        {/* Text overlaid on image */}
        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="text-2xl font-serif font-bold text-white mb-1.5 drop-shadow-md">
            {profile.name.split(' ')[0]}, {new Date().getFullYear() - new Date(profile.profile.dob).getFullYear()}
          </h3>
          <p className="text-xs font-medium text-white/90 drop-shadow-md">
            {profile.profile.profession} • {profile.profile.city}
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 flex-1 flex flex-col bg-white">
        
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
          {type === 'mutual' ? 'Matched' : type === 'received' ? 'Received' : 'Sent'} {formatDistanceToNow(new Date(profile.matchedAt), { addSuffix: true })}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1.5 bg-brand-50/70 text-brand-900 text-[11px] font-bold rounded-xl border border-brand-100/50">
            {profile.profile.religion}
          </span>
          <span className="px-3 py-1.5 bg-gray-50 text-gray-700 text-[11px] font-bold rounded-xl border border-gray-100">
            {profile.profile.educationLevel}
          </span>
          <span className="px-3 py-1.5 bg-gray-50 text-gray-700 text-[11px] font-bold rounded-xl border border-gray-100">
            {profile.profile.diet}
          </span>
        </div>

        <div className="mt-auto flex space-x-3 pt-2">
          {type === 'mutual' && (
            <Link href={`/messages?user=${profile._id}`} className="flex-1 bg-brand-900 hover:bg-brand-800 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat Now
            </Link>
          )}

          {type === 'received' && (
            <button 
              onClick={() => acceptInterest(profile._id)}
              disabled={isPending}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-2" />
              {isPending ? 'Accepting...' : 'Accept'}
            </button>
          )}

          {type === 'sent' && (
            <button disabled className="flex-1 bg-gray-50 text-gray-400 py-3 rounded-2xl text-sm font-bold flex items-center justify-center cursor-not-allowed border border-gray-100">
              Interest Sent
            </button>
          )}

          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="w-12 h-12 border-2 border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute bottom-14 right-0 w-36 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in zoom-in-95">
                {type === 'sent' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); removeInterest(profile._id); }}
                    disabled={isRemoving}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowReport(true); }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REPORT OVERLAY */}
      {showReport && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Report Profile</h3>
          <p className="text-xs text-gray-500 mb-4">Please select a reason for reporting.</p>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar">
            {["Fake Profile", "Inappropriate Content", "Harassment", "Spam", "Other"].map((reason) => (
              <label key={reason} className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${reportReason === reason ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
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

          <div className="flex space-x-3 mt-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowReport(false); setReportReason(""); }}
              className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={!reportReason || isReporting}
              onClick={(e) => { e.stopPropagation(); handleReport(); }}
              className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isReporting ? '...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Component: MatchesFeed
 * Renders the UI and handles the internal logic for the Matches Feed.
 */
export function MatchesFeed() {
  const { data, isLoading, isError, error } = useMatchesData();
  const [activeTab, setActiveTab] = useState<'mutual' | 'received' | 'sent'>('mutual');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-red-500 font-medium">Error loading matches. Please try again. {(error as Error)?.message}</div>
      </div>
    );
  }

  const getActiveProfiles = () => {
    if (activeTab === 'mutual') return data.mutualMatches;
    if (activeTab === 'received') return data.interestsReceived;
    return data.interestsSent;
  };

  const activeProfiles = getActiveProfiles();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col pt-4">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Your Matches & Connections</h1>
        <p className="text-gray-500 text-sm font-medium">People with mutual interest who are ready to connect and converse.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button 
          onClick={() => setActiveTab('mutual')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center transition-all shadow-sm border ${
            activeTab === 'mutual' ? 'bg-brand-100 border-brand-200 text-brand-900' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}
        >
          Mutual Matches
          <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'mutual' ? 'bg-brand-900 text-white' : 'bg-gray-100'}`}>
            {data.mutualMatches.length}
          </span>
        </button>
        
        <button 
          onClick={() => setActiveTab('received')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center transition-all shadow-sm border ${
            activeTab === 'received' ? 'bg-brand-100 border-brand-200 text-brand-900' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}
        >
          Interests Received
          <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'received' ? 'bg-brand-900 text-white' : 'bg-gray-100'}`}>
            {data.interestsReceived.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('sent')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center transition-all shadow-sm border ${
            activeTab === 'sent' ? 'bg-brand-100 border-brand-200 text-brand-900' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}
        >
          Interests Sent
          <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'sent' ? 'bg-brand-900 text-white' : 'bg-gray-100'}`}>
            {data.interestsSent.length}
          </span>
        </button>
      </div>

      {/* New Matches Carousel (Only shown in Mutual Matches) */}
      {activeTab === 'mutual' && (
        <NewMatchesCarousel profiles={data.mutualMatches.slice(0, 8)} />
      )}

      {/* Grid of Cards */}
      {activeProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activeProfiles.map(profile => (
            <MatchCard key={profile._id} profile={profile} type={activeTab} />
          ))}
        </div>
      ) : (
        <div className="w-full p-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm text-center mb-12">
          <Heart className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No profiles found</h3>
          <p className="text-sm text-gray-500">
            {activeTab === 'mutual' && "You don't have any mutual matches yet. Keep exploring!"}
            {activeTab === 'received' && "You haven't received any interests yet."}
            {activeTab === 'sent' && "You haven't sent any interests yet."}
          </p>
        </div>
      )}

    </div>
  );
}

