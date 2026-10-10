"use client";

import React from "react";
import { Activity, User, ThumbsUp, ThumbsDown, AlertCircle, Ban, ArrowLeft } from "lucide-react";
import { useActivityLogs } from "@/features/feed/feed.api";
import Link from "next/link";

export function ActivityView() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivityLogs();

  const getIcon = (action: string) => {
    switch (action) {
      case "like": return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case "pass": return <ThumbsDown className="w-4 h-4 text-gray-400" />;
      case "block": return <Ban className="w-4 h-4 text-red-500" />;
      case "report": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "like": return "You liked";
      case "pass": return "You passed";
      case "block": return "You blocked";
      case "report": return "You reported";
      default: return "You interacted with";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col relative pb-20">
      
      {/* Header */}
      <div className="mb-8 flex items-center">
        <Link href="/profile" className="p-2 mr-4 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">View your complete history of interactions.</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !data || data.pages[0].logs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-500">Your interaction history will appear here once you start exploring profiles.</p>
              <Link href="/home" className="inline-block mt-6 px-6 py-3 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors">
                Discover Profiles
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.pages.map((page, i) => (
                <React.Fragment key={i}>
                  {page.logs.map((log) => (
                    <div key={log._id} className="flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-50 hover:border-gray-100 group">
                      
                      {/* Target Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 relative">
                        {log.targetProfile?.mainPhoto ? (
                          <img src={log.targetProfile.mainPhoto} alt={log.targetUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 m-auto text-gray-400 mt-3.5" />
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                          {getIcon(log.action)}
                        </div>
                      </div>

                      {/* Log Details */}
                      <div className="ml-5 flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">
                          <span className="text-gray-500">{getActionText(log.action)}</span>{' '}
                          <span className="font-bold">{log.targetUser.name}</span>
                        </p>
                        {log.targetProfile?.profession && (
                          <p className="text-sm text-gray-500 truncate">{log.targetProfile.profession}</p>
                        )}
                      </div>

                      {/* Time */}
                      <div className="text-sm font-medium text-gray-400 ml-4 flex-shrink-0">
                        {getTimeAgo(log.createdAt)}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {hasNextPage && (
                <button 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="w-full py-4 mt-8 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 border border-gray-100"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load Older Activity'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
