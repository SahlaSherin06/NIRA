"use client";

import React, { useState, useRef } from "react";
import { useUpdateMyProfile } from "../api/profilequeries";
import { MyProfileResponse } from "../api/profileapi";
import { X, Check, Camera, Image as ImageIcon, User, Briefcase, Heart, Filter } from "lucide-react";

interface EditProfileModalProps {
  data: MyProfileResponse;
  onClose: () => void;
}

type TabType = 'photos' | 'basic' | 'background' | 'lifestyle' | 'preferences';

/**
 * Component: EditProfileModal
 * Renders the UI and handles the internal logic for the Edit Profile Modal.
 */
export function EditProfileModal({ data, onClose }: EditProfileModalProps) {
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();
  
  const [activeTab, setActiveTab] = useState<TabType>('photos');
  
  // Flatten state for easy inputs
  const [profile, setProfile] = useState<any>({ ...data.profile });
  const [prefs, setPrefs] = useState<any>({ ...data.preferences });

  const mainPhotoRef = useRef<HTMLInputElement>(null);

  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePrefChange = (field: string, value: any) => {
    setPrefs((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfileChange("mainPhoto", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile({
      profile,
      preferences: prefs
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const tabs = [
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'background', label: 'Background', icon: Briefcase },
    { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
    { id: 'preferences', label: 'Preferences', icon: Filter },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Update your details and preferences to find better matches.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-2 overflow-y-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-brand-900 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
            
            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900">Profile Photos</h3>
                
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Main Photo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-50 shadow-sm relative group">
                      <img src={profile.mainPhoto} alt="Main" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => mainPhotoRef.current?.click()} className="text-white hover:scale-110 transition-transform">
                          <Camera className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => mainPhotoRef.current?.click()}
                        className="px-5 py-2.5 bg-brand-50 text-brand-900 rounded-xl text-sm font-bold hover:bg-brand-100 transition-colors"
                      >
                        Change Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-2 max-w-[200px]">Upload a clear photo of your face. Max size 5MB.</p>
                      <input type="file" accept="image/*" ref={mainPhotoRef} onChange={handleMainPhotoChange} className="hidden" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Bio</label>
                  <textarea 
                    value={profile.bio || ""}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500 min-h-[120px]"
                    placeholder="Write a little about yourself..."
                  />
                </div>
              </div>
            )}

            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Height</label>
                    <input 
                      type="text" value={profile.height || ""} onChange={(e) => handleProfileChange("height", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                    <input 
                      type="text" value={profile.weight || ""} onChange={(e) => handleProfileChange("weight", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
                    <select 
                      value={profile.maritalStatus || ""} onChange={(e) => handleProfileChange("maritalStatus", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Awaiting Divorce">Awaiting Divorce</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                    <input 
                      type="text" value={profile.bloodGroup || ""} onChange={(e) => handleProfileChange("bloodGroup", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BACKGROUND TAB */}
            {activeTab === 'background' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Background & Education</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input 
                      type="text" value={profile.city || ""} onChange={(e) => handleProfileChange("city", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input 
                      type="text" value={profile.state || ""} onChange={(e) => handleProfileChange("state", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
                    <input 
                      type="text" value={profile.religion || ""} onChange={(e) => handleProfileChange("religion", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mother Tongue</label>
                    <input 
                      type="text" value={profile.motherTongue || ""} onChange={(e) => handleProfileChange("motherTongue", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div className="col-span-2 border-t border-gray-100 pt-6"></div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
                    <input 
                      type="text" value={profile.educationLevel || ""} onChange={(e) => handleProfileChange("educationLevel", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profession</label>
                    <input 
                      type="text" value={profile.profession || ""} onChange={(e) => handleProfileChange("profession", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LIFESTYLE TAB */}
            {activeTab === 'lifestyle' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Lifestyle</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Diet</label>
                    <select 
                      value={profile.diet || ""} onChange={(e) => handleProfileChange("diet", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Vegan">Vegan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Smoking</label>
                    <select 
                      value={profile.smoke || ""} onChange={(e) => handleProfileChange("smoke", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    >
                      <option value="Non-smoker">Non-smoker</option>
                      <option value="Occasional">Occasional</option>
                      <option value="Regular">Regular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Drinking</label>
                    <select 
                      value={profile.drink || ""} onChange={(e) => handleProfileChange("drink", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    >
                      <option value="Non-drinker">Non-drinker</option>
                      <option value="Social drinker">Social drinker</option>
                      <option value="Regular">Regular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ready to move abroad?</label>
                    <select 
                      value={profile.moveAbroad || ""} onChange={(e) => handleProfileChange("moveAbroad", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2 border-t border-gray-100 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbies & Interests (comma separated)</label>
                    <input 
                      type="text" 
                      value={profile.interests?.join(", ") || ""} 
                      onChange={(e) => handleProfileChange("interests", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      placeholder="e.g. Reading, Traveling, Photography"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Personality Traits (comma separated)</label>
                    <input 
                      type="text" 
                      value={profile.personality?.join(", ") || ""} 
                      onChange={(e) => handleProfileChange("personality", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      placeholder="e.g. Introvert, Creative, Ambitious"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Partner Preferences</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age Range</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="number" value={prefs.prefAgeMin || 18} onChange={(e) => handlePrefChange("prefAgeMin", Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                        placeholder="Min Age"
                      />
                      <span className="text-gray-400 font-bold">to</span>
                      <input 
                        type="number" value={prefs.prefAgeMax || 40} onChange={(e) => handlePrefChange("prefAgeMax", Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                        placeholder="Max Age"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
                    <input 
                      type="text" value={prefs.prefReligion || ""} onChange={(e) => handlePrefChange("prefReligion", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
                    <input 
                      type="text" value={prefs.prefEducation || ""} onChange={(e) => handlePrefChange("prefEducation", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Smoking</label>
                    <select 
                      value={prefs.prefSmoking || ""} onChange={(e) => handlePrefChange("prefSmoking", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    >
                      <option value="Doesn't matter">Doesn't matter</option>
                      <option value="Non-smoker">Non-smoker</option>
                      <option value="Occasional">Occasional</option>
                      <option value="Regular">Regular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Drinking</label>
                    <select 
                      value={prefs.prefDrinking || ""} onChange={(e) => handlePrefChange("prefDrinking", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-brand-500"
                    >
                      <option value="Doesn't matter">Doesn't matter</option>
                      <option value="Non-drinker">Non-drinker</option>
                      <option value="Social drinker">Social drinker</option>
                      <option value="Regular">Regular</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end z-10">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 font-bold hover:text-gray-900 transition-colors mr-4"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="px-8 py-2.5 bg-brand-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-brand-800 transition-colors flex items-center hover:shadow-lg disabled:opacity-50"
          >
            {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" /> Save Profile</>}
          </button>
        </div>
        
      </div>
    </div>
  );
}
