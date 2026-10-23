import React, { useRef, useEffect } from "react";
import { User, ArrowLeft, MoreVertical, Loader2, Send, CheckCheck, Unlock, Heart } from "lucide-react";
import { Message } from "@/features/chat/chat.api";

interface ChatWindowProps {
  activeChat: string | null;
  setActiveChat: (id: string | null) => void;
  activeConvo: any;
  messages: Message[] | undefined;
  isMessagesLoading: boolean;
  isConversationsLoading?: boolean;
  myProfile: any;
  session: any;
  messageText: string;
  setMessageText: (text: string) => void;
  isSending: boolean;
  handleSend: (e: React.FormEvent) => void;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  handleClearChat: () => void;
  handleBlockUser: () => void;
  handleUnblockUser: () => void;
  unblockMutationPending: boolean;
  handleSendLike: () => void;
  isSendLikePending: boolean;
  isSuspended?: boolean;
}

export function ChatWindow({
  activeChat,
  setActiveChat,
  activeConvo,
  messages,
  isMessagesLoading,
  isConversationsLoading,
  myProfile,
  session,
  messageText,
  setMessageText,
  isSending,
  handleSend,
  showMenu,
  setShowMenu,
  handleClearChat,
  handleBlockUser,
  handleUnblockUser,
  unblockMutationPending,
  handleSendLike,
  isSendLikePending,
  isSuspended
}: ChatWindowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L2 22l5.71-1.03C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Your Messages</h3>
          <p className="text-sm text-gray-500">Select a conversation to start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#FFF9FA] flex flex-col h-full ${
        activeChat
          ? "fixed inset-0 z-[60] bg-[#FFF9FA] flex flex-col h-[100dvh] w-full md:relative md:inset-auto md:z-auto md:flex-1 md:h-full"
          : "hidden md:flex md:flex-1 md:h-full"
      }`}
    >
      {/* Chat Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white border-b border-gray-100 flex items-center justify-between z-20 shrink-0 shadow-xs">
        <div className="flex items-center min-w-0">
          <button 
            onClick={() => setActiveChat(null)}
            className="md:hidden mr-2.5 p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition-transform"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5 text-brand-900" />
          </button>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
              {activeConvo?.otherUser?.mainPhoto ? (
                <img src={activeConvo.otherUser.mainPhoto} alt={activeConvo?.otherUser?.name || "avatar"} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 m-auto mt-2.5 text-gray-400" />
              )}
            </div>
            {activeConvo?.otherUser?.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="ml-3 truncate">
            {isConversationsLoading && !activeConvo ? (
              <div className="space-y-1 py-1">
                <div className="w-24 h-3.5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-14 h-2.5 bg-gray-100 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 truncate">
                  {activeConvo?.otherUser?.name || "Conversation"}
                </h3>
                <p className="text-xs font-medium text-green-600">
                  {activeConvo?.otherUser?.isOnline ? 'Active now' : ''}
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 relative shrink-0">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors focus:outline-none"
            aria-label="Chat options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute top-12 right-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
              <button 
                onClick={handleClearChat}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2.5 text-gray-400" />
                Clear Chat
              </button>
              <button 
                onClick={handleBlockUser}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center transition-colors"
              >
                <BanIcon className="w-4 h-4 mr-2.5" />
                Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Timeline */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3.5 sm:p-6 flex flex-col space-y-4 sm:space-y-6 custom-scrollbar relative z-10">
        
        {/* System Match Message */}
        <div className="flex justify-center mt-2 mb-4">
          <div className="bg-[#EBD8DB] text-[#82444D] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-[12px] font-medium text-center max-w-sm">
            You and {activeConvo?.otherUser?.name || "your match"} matched recently. Start the conversation!
          </div>
        </div>

        {isMessagesLoading ? (
          <div className="flex justify-center m-auto"><Loader2 className="w-6 h-6 animate-spin text-[#82444D]" /></div>
        ) : !messages || messages.length === 0 ? (
          <div className="m-auto text-center"></div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === session?.user?._id || msg.senderId === session?.user?.userId;
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                  <div className="flex items-end space-x-2">
                    
                    {/* Their Avatar on Left */}
                    {!isMine && (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-1">
                        {activeConvo?.otherUser?.mainPhoto ? (
                          <img src={activeConvo.otherUser.mainPhoto} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 m-auto text-gray-400 mt-1.5" />
                        )}
                      </div>
                    )}
                    
                    <div className={`px-4 sm:px-5 py-3 sm:py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${isMine ? 'bg-[#82444D] text-white rounded-2xl rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'}`}>
                      <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed break-words">{msg.content}</p>
                    </div>
                    
                    {/* My Avatar on Right */}
                    {isMine && (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-1 border border-gray-100">
                        {myProfile?.profile?.mainPhoto ? (
                          <img src={myProfile.profile.mainPhoto} alt="my avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 m-auto text-gray-400 mt-1.5" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-[10px] mt-1 font-medium text-gray-400 flex items-center ${isMine ? 'justify-end pr-8 sm:pr-9' : 'justify-start pl-8 sm:pl-9'}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && (
                      <CheckCheck className={`w-3.5 h-3.5 ml-1.5 ${msg.isRead ? 'text-[#34B7F1]' : 'text-gray-400'}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-5 bg-white border-t border-gray-100 z-20 shrink-0">
        {isConversationsLoading && !activeConvo ? (
          <div className="flex items-center justify-center py-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-[#82444D]" />
          </div>
        ) : isSuspended ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-red-700">This account has been suspended.</p>
            <p className="text-xs text-red-500 mt-1">This user is no longer active on NIRA due to community guidelines violations.</p>
          </div>
        ) : activeConvo?.isBlockedByMe ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">You blocked this profile.</p>
            <button 
              onClick={handleUnblockUser}
              disabled={unblockMutationPending}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-full transition-colors flex items-center"
            >
              {unblockMutationPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Unlock className="w-3.5 h-3.5 mr-1.5" />}
              Tap to Unblock
            </button>
          </div>
        ) : activeConvo?.isBlockedByThem ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-600">You cannot reply to this conversation.</p>
          </div>
        ) : !activeConvo?.isMutual ? (
          activeConvo?.haveISentLike ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-gray-600">Request sent. Waiting for {activeConvo?.otherUser?.name || "them"} to accept.</p>
            </div>
          ) : (
            <div className="bg-[#FFF4F6] border border-[#F1D7D9] rounded-xl px-6 py-4 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-[#82444D] mb-2">You need a mutual match to chat.</p>
              <button 
                onClick={handleSendLike}
                disabled={isSendLikePending}
                className="px-5 py-2 bg-[#82444D] hover:bg-[#6c3640] text-white text-xs font-bold rounded-full transition-colors flex items-center"
              >
                {isSendLikePending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />}
                Send Request
              </button>
            </div>
          )
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a thoughtful message..."
              className="flex-1 bg-[#F4EFEF] border-transparent focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:bg-white rounded-full pl-5 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all shadow-inner"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-brand-900 text-white rounded-full hover:bg-brand-800 transition-all disabled:opacity-50 shadow-md shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Temporary imports for the icons since they can't be aliased inside the JSX easily without creating another file or importing correctly
const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const BanIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
);
