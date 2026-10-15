"use client";

import React, { useMemo, useEffect } from "react";
import { Bell, Heart, Users, Sparkles, Check, MessageCircle, User as UserIcon, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { useNotifications, useMarkNotificationsRead } from "../notification.queries";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import Link from "next/link";
import { NotificationData } from "../notification.api";

export function NotificationsView() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationsRead();

  // Group notifications
    useEffect(() => {
    // Auto mark as read when user visits this page/view
    if (notifications && notifications.some(n => !n.isRead)) {
      markAsRead.mutate();
    }
  }, [notifications]);

  const groupedNotifications = useMemo(() => {
    if (!notifications) return { new: [], earlier: [] };
    
    return notifications.reduce((acc, notif) => {
      if (!notif.isRead) {
        acc.new.push(notif);
      } else {
        acc.earlier.push(notif);
      }
      return acc;
    }, { new: [] as NotificationData[], earlier: [] as NotificationData[] });
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleMarkAsRead = () => {
    markAsRead.mutate();
  };

  const hasUnread = groupedNotifications.new.length > 0;

  const renderNotification = (notification: NotificationData) => {
    const isWarning = notification.type === 'warning';
    const isMatch = notification.type === 'match';
    const isLike = notification.type === 'interest_received' || notification.type === 'superlike_received';
    const isMessage = notification.type === 'new_message';
    const isSystem = notification.type === 'system';
    const user = notification.relatedUser;

    // Dedicated Safety / Admin Warning Notification View
    if (isWarning) {
      return (
        <div 
          key={notification._id} 
          className={`p-4 md:p-5 rounded-2xl transition-all duration-300 relative group border ${
            !notification.isRead 
              ? "bg-gradient-to-r from-amber-50 via-orange-50/70 to-white border-amber-400 shadow-md shadow-amber-500/10" 
              : "bg-amber-50/30 border-amber-200/80 hover:bg-amber-50/60"
          } flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4`}
        >
          {/* Unread Indicator */}
          {!notification.isRead && (
            <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
          )}

          {/* Warning Icon Area */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md shadow-amber-500/20">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>

            {/* Badge Icon Overlay */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center bg-red-600 text-white shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-900 border border-amber-300/60 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-700 inline" /> Official Warning Notice
              </span>
              {!notification.isRead && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-100 text-red-700 border border-red-200">
                  New Alert
                </span>
              )}
            </div>

            <p className={`text-sm md:text-[15px] leading-snug ${!notification.isRead ? 'text-gray-950 font-bold' : 'text-gray-800 font-semibold'}`}>
              {notification.message}
            </p>

            <div className="mt-2 text-xs text-amber-900 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Community Standard Notice:</strong> Repeated guideline violations or accumulated strikes will result in permanent account suspension. Please ensure all interactions remain respectful.
              </span>
            </div>

            <span className="text-xs text-gray-400 font-medium mt-2 block">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      );
    }

    // System Notification View (for resolutions / review updates)
    if (isSystem) {
      return (
        <div 
          key={notification._id} 
          className={`p-4 md:p-5 rounded-2xl transition-all duration-300 relative group border ${
            !notification.isRead 
              ? "bg-white shadow-md border-blue-200" 
              : "bg-white/60 hover:bg-white border-gray-100 hover:shadow-sm"
          } flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4`}
        >
          {!notification.isRead && (
            <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
          )}

          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm bg-blue-50 text-blue-600">
              <Info className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center bg-blue-500 text-white">
              <Bell className="w-3 h-3" />
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                Moderation Team
              </span>
            </div>
            <p className={`text-sm md:text-[15px] leading-snug ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium'}`}>
              {notification.message}
            </p>
            <span className="text-xs text-gray-400 font-medium mt-1.5 block">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={notification._id} 
        className={`p-4 md:p-5 rounded-2xl transition-all duration-300 relative group ${
          !notification.isRead 
            ? "bg-white shadow-md border border-brand-100 transform hover:-translate-y-0.5" 
            : "bg-white/60 hover:bg-white border border-gray-100 hover:shadow-sm"
        } flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4`}
      >
        {/* Unread Indicator */}
        {!notification.isRead && (
          <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-brand-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(230,57,70,0.6)]"></div>
        )}

        {/* Avatar Area */}
        <div className="relative flex-shrink-0">
          {user && user.mainPhoto ? (
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src={user.mainPhoto} alt={user.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm ${
              isMatch ? 'bg-gradient-to-br from-pink-400 to-red-500 text-white' : 
              isLike ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white' :
              'bg-gray-100 text-gray-500'
            }`}>
                            {isMatch ? <Users className="w-6 h-6" /> : 
               notification.type === 'superlike_received' ? <Sparkles className="w-6 h-6 text-yellow-300" /> :
               isLike ? <Heart className="w-6 h-6" /> : 
               user ? <UserIcon className="w-6 h-6" /> :
               <Sparkles className="w-6 h-6" />}
            </div>
          )}

          {/* Badge Icon Overlay */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
            isMatch ? 'bg-green-500 text-white' : 
            notification.type === 'superlike_received' ? 'bg-yellow-500 text-white' :
            isLike ? 'bg-brand-900 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {isMatch ? <Users className="w-3 h-3" /> : 
             notification.type === 'superlike_received' ? <Sparkles className="w-3 h-3" /> :
             isLike ? <Heart className="w-3 h-3" /> : 
             <Bell className="w-3 h-3" />}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pr-6">
          <p className={`text-sm md:text-[15px] leading-snug ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium'}`}>
            {notification.message}
          </p>
          <span className="text-xs text-gray-400 font-medium mt-1.5 block">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        {/* Action Buttons */}
        {user && (
          <div className="w-full sm:w-auto flex space-x-2 pt-2 sm:pt-0">
            {isLike && (
              <Link href="/matches" className="flex-1 sm:flex-none px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-900 text-xs font-bold rounded-full transition-colors text-center whitespace-nowrap">
                View Profile
              </Link>
            )}
            {isMatch && (
              <Link href={`/messages?user=${user._id}`} className="flex-1 sm:flex-none px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold rounded-full transition-colors flex items-center justify-center whitespace-nowrap shadow-sm hover:shadow-md">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Chat Now
              </Link>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 relative min-h-[calc(100vh-140px)]">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-brand-50/50 to-transparent rounded-full blur-3xl -z-10 opacity-60"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 mt-2 font-medium">Keep track of your latest matches and profile activity.</p>
        </div>
        
      </div>

      <div className="space-y-8">
        {!notifications || notifications.length === 0 ? (
          <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-20"></div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10 border-4 border-white">
                <Bell className="w-10 h-10 text-brand-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">When you receive new interests, matches, or messages, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* New Notifications Section */}
            {groupedNotifications.new.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 px-1 flex items-center">
                  New 
                  <span className="ml-2 bg-brand-900 text-white text-[10px] px-2 py-0.5 rounded-full">{groupedNotifications.new.length}</span>
                </h3>
                <div className="space-y-3">
                  {groupedNotifications.new.map(renderNotification)}
                </div>
              </section>
            )}

            {/* Earlier Notifications Section */}
            {groupedNotifications.earlier.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">
                  Earlier
                </h3>
                <div className="space-y-3">
                  {groupedNotifications.earlier.map(renderNotification)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
