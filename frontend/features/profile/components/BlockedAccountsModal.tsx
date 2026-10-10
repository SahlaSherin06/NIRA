import React from "react";
import { X, User, Loader2, Ban, Unlock } from "lucide-react";
import { useBlockedUsers, useRemoveAction } from "@/features/feed/feed.api";

interface BlockedAccountsModalProps {
  onClose: () => void;
}

export function BlockedAccountsModal({ onClose }: BlockedAccountsModalProps) {
  const { data, isLoading } = useBlockedUsers();
  const unblockMutation = useRemoveAction();

  const handleUnblock = (targetId: string) => {
    unblockMutation.mutate(targetId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center text-gray-900">
            <Ban className="w-5 h-5 mr-2 text-red-500" />
            <h2 className="text-xl font-bold font-serif">Blocked Accounts</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-900" />
            </div>
          ) : !data?.blockedUsers || data.blockedUsers.length === 0 ? (
            <div className="text-center py-10 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No blocked accounts</h3>
              <p className="text-sm text-gray-500">When you block someone, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.blockedUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden mr-3">
                      {user.mainPhoto ? (
                        <img src={user.mainPhoto} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 m-auto mt-3 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{user.name}</h4>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                        Blocked on {new Date(user.blockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUnblock(user._id)}
                    disabled={unblockMutation.isPending}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center"
                  >
                    <Unlock className="w-3.5 h-3.5 mr-1" />
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
