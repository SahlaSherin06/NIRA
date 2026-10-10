"use client";

import React, { useState, useRef } from "react";
import { useMyProfile, useUpdateMyProfile } from "../profile.queries";
import { Settings, Edit3, ShieldCheck, MapPin,
  Crown, Briefcase, GraduationCap, Heart, Camera, Globe, Activity, Image as ImageIcon, Lock, Unlock, Plus, Trash2, X, User, ChevronRight, Ban } from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";
import { SecuritySettingsModal } from "./SecuritySettingsModal";
import { BlockedAccountsModal } from "./BlockedAccountsModal";
import Link from "next/link";

/**
 * Component: ProfileView
 * Renders the UI and handles the internal logic for the Profile View.
 */
export function ProfileView() {
  const { data, isLoading } = useMyProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateMyProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && data) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentGallery = data.profile.galleryPhotos || [];
        updateProfile({
          profile: {
            ...data.profile,
            galleryPhotos: [...currentGallery, reader.result as string]
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveGalleryPhoto = (indexToRemove: number) => {
    if (data) {
      const newGallery = (data.profile.galleryPhotos || []).filter((_, idx) => idx !== indexToRemove);
      updateProfile({
        profile: {
          ...data.profile,
          galleryPhotos: newGallery
        }
      });
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { user, profile } = data;
  const age = new Date().getFullYear() - new Date(profile.dob).getFullYear();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 pt-4 pb-12">
      
      {/* Left Column: Photo & Quick Actions */}
      <div className="w-full md:w-[340px] flex-shrink-0 flex flex-col gap-6">
        
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-brand-100/50">
          <div className="aspect-[4/5] w-full rounded-[1.5rem] overflow-hidden mb-6 relative group shadow-inner">
            <img 
              src={profile.mainPhoto || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80"} 
              alt={user.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center">
            {user.name}, {age}
            {user.subscription?.plan === 'premium' && (
              <span className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 p-1.5 rounded-full shadow-lg inline-flex" title="Premium Member">
                  <Crown className="w-5 h-5 text-white" />
                </span>
            )}
          </h2>
          <p className="text-gray-500 font-medium mt-1.5 text-sm flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-brand-400" /> 
            {profile.city}, {profile.state}
          </p>
          
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-brand-900 to-brand-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:from-brand-800 hover:to-brand-700 transition-all flex items-center justify-center"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Account Settings */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-serif font-bold text-gray-900 mb-5 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Account Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Privacy</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Public Profile</p>
                  </div>
                </div>
              </div>
              
              
              <button 
                onClick={() => setIsSecurityModalOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-200 transition-colors group"
              >
                <div className="flex items-center text-left">
                  <ShieldCheck className="w-5 h-5 text-brand-900 mr-3 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-brand-900 transition-colors">Password & Security</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">Change Email and Password</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-900 transition-colors" />
              </button>

                
              <button 
                onClick={() => setIsBlockedModalOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-200 transition-colors group"
              >
                <div className="flex items-center text-left">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                    <Ban className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-red-500 transition-colors">Blocked Accounts</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">Manage users you have blocked</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>

                <Link href="/activity" className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 transition-colors cursor-pointer block w-full">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center mr-3">
                    <Activity className="w-4 h-4 text-brand-900" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 text-left group-hover:text-brand-900 transition-colors">Activity Logs</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5 text-left">View your likes, passes & history</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-900 transition-colors" />
              </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Details */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* About Me */}
        <div className="bg-gradient-to-br from-brand-50/30 to-white rounded-[2rem] p-8 shadow-sm border border-brand-50">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-5 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-brand-100/50 flex items-center justify-center mr-3 text-brand-900">
              <User className="w-5 h-5" />
            </div>
            About Me
          </h3>
          <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base">
            {profile.bio || "No bio added yet. Tell potential matches about yourself!"}
          </p>
        </div>

        {/* Basic Details & Background (Side by side on large screens) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Basic Details */}
          <div className="bg-gradient-to-br from-blue-50/30 to-white rounded-[2rem] p-8 shadow-sm border border-blue-50">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center mr-3 text-blue-600">
                <Heart className="w-5 h-5" />
              </div>
              Basic Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Height & Weight</p>
                <p className="font-semibold text-gray-900">{profile.height} cm • {profile.weight} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Blood Group</p>
                <p className="font-semibold text-gray-900">{profile.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Marital Status</p>
                <p className="font-semibold text-gray-900">{profile.maritalStatus}</p>
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="bg-gradient-to-br from-purple-50/30 to-white rounded-[2rem] p-8 shadow-sm border border-purple-50">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-100/50 flex items-center justify-center mr-3 text-purple-600">
                <Globe className="w-5 h-5" />
              </div>
              Background
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Religion</p>
                <p className="font-semibold text-gray-900">{profile.religion}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Mother Tongue</p>
                <p className="font-semibold text-gray-900">{profile.motherTongue}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Grew up in</p>
                <p className="font-semibold text-gray-900">{profile.grewUpIn || profile.nationality}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education & Career */}
        <div className="bg-gradient-to-br from-emerald-50/30 to-white rounded-[2rem] p-8 shadow-sm border border-emerald-50">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center mr-3 text-emerald-600">
              <Briefcase className="w-5 h-5" />
            </div>
            Education & Career
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Education Level</p>
              <p className="font-semibold text-gray-900 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-emerald-500" />
                {profile.educationLevel}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Profession</p>
              <p className="font-semibold text-gray-900">{profile.profession}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Annual Income</p>
              <p className="font-semibold text-gray-900">{profile.income || "Not Specified"}</p>
            </div>
          </div>
        </div>

        {/* Lifestyle & Interests */}
        <div className="bg-gradient-to-br from-orange-50/30 to-white rounded-[2rem] p-8 shadow-sm border border-orange-50">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center mr-3 text-orange-600">
              <Activity className="w-5 h-5" />
            </div>
            Lifestyle & Interests
          </h3>
          
          <h4 className="text-sm font-bold text-gray-900 mb-3">Habits</h4>
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-4 py-2 bg-orange-50 text-orange-700 font-semibold text-sm rounded-xl border border-orange-100/50">
              Diet: {profile.diet}
            </span>
            <span className="px-4 py-2 bg-gray-50 text-gray-600 font-semibold text-sm rounded-xl border border-gray-200/50">
              Smoking: {profile.smoke}
            </span>
            <span className="px-4 py-2 bg-gray-50 text-gray-600 font-semibold text-sm rounded-xl border border-gray-200/50">
              Drinking: {profile.drink}
            </span>
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Interests & Hobbies</h4>
              <div className="flex flex-wrap gap-2 mb-8">
                {profile.interests.map((interest: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-white text-gray-700 font-medium text-sm rounded-full border border-orange-100 shadow-sm cursor-default">
                    {interest}
                  </span>
                ))}
              </div>
            </>
          )}

          {profile.personality && profile.personality.length > 0 && (
            <>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Personality</h4>
              <div className="flex flex-wrap gap-2">
                {profile.personality.map((trait: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-brand-50/50 text-brand-900 font-medium text-sm rounded-full border border-brand-100 cursor-default">
                    {trait}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="bg-gradient-to-br from-indigo-50/30 to-white rounded-[2rem] p-8 shadow-sm border border-indigo-50 relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center mr-3 text-indigo-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              Photo Gallery
            </h3>
            {profile.galleryPhotos && profile.galleryPhotos.length > 0 && profile.galleryPhotos.length < 10 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isUpdating ? 'Uploading...' : 'Add Photo'}
              </button>
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleGalleryUpload} 
            className="hidden" 
          />

          {profile.galleryPhotos && profile.galleryPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.galleryPhotos.map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-[1.5rem] overflow-hidden bg-gray-100 border border-gray-100 relative group shadow-sm">
                    <img src={photo} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveGalleryPhoto(idx); }}
                      disabled={isUpdating}
                      title="Remove Photo"
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-indigo-200">
              <p className="text-sm font-medium text-gray-500">No gallery photos added yet.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="mt-4 text-sm font-bold text-white bg-indigo-600 px-6 py-2.5 rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
              >
                {isUpdating ? 'Uploading...' : 'Upload Photos'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          data={data}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      
      
    
      {isSecurityModalOpen && (
        <SecuritySettingsModal onClose={() => setIsSecurityModalOpen(false)} />
      )}
      {isBlockedModalOpen && (
        <BlockedAccountsModal onClose={() => setIsBlockedModalOpen(false)} />
      )}
  </div>
  );
}
