"use client";

import React from "react";
import { Bell, Heart, Users, Sparkles, Check } from "lucide-react";
import { useNotifications, useMarkNotificationsRead } from "../api/notificationqueries";
import { formatDistanceToNow } from "date-fns";

/**
 * Component: NotificationsView
 * Renders the UI and handles the internal logic for the Notifications View.
 */
export function NotificationsView() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationsRead();

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleMarkAsRead = () => {
    markAsRead.mutate();
  };

  const hasUnread = notifications?.some((n) => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your latest matches and interests.</p>
        </div>
        {hasUnread && (
          <button 
            onClick={handleMarkAsRead}
            disabled={markAsRead.isPending}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {!notifications || notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-brand-50 text-brand-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">No Notifications Yet</h3>
            <p className="text-gray-500">When you receive interests or matches, they will appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`p-5 rounded-2xl border transition-all ${
                notification.isRead 
                  ? "bg-white border-gray-100 shadow-sm" 
                  : "bg-brand-50/50 border-brand-100 shadow-md"
              } flex items-start space-x-4`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                notification.type === 'match' ? 'bg-gradient-to-br from-pink-400 to-red-500 text-white' : 
                notification.type === 'interest_received' ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {notification.type === 'match' ? <Users className="w-6 h-6" /> : 
                 notification.type === 'interest_received' ? <Heart className="w-6 h-6" /> : 
                 <Sparkles className="w-6 h-6" />}
              </div>

              <div className="flex-1">
                <p className={`text-sm md:text-base text-gray-900 ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500 font-medium mt-1 block">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-brand-900 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
