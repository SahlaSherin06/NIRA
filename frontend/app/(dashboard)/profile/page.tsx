"use client";

import { ProfileView } from "@/features/profile/components/ProfileView";

/**
 * Component: ProfilePage
 * Renders the UI and handles the internal logic for the Profile Page.
 */
export default function ProfilePage() {
  return (
    <div className="w-full flex flex-col relative">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brand-900">My Profile</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Manage your details, photos, and partner preferences.</p>
      </div>
      <ProfileView />
    </div>
  );
}
