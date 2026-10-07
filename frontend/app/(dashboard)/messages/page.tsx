"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConversations, useMessages, useSendMessage } from "@/features/chat/chat.queries";
import { useSession } from "@/features/auth/auth.queries";
import { useSearchParams } from "next/navigation";
import { User, Send, ArrowLeft, Loader2, MessageCircle, Phone, MoreVertical, Search, CheckCircle2 } from "lucide-react";
import io, { Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get("user");
  const { data: session } = useSession();
  const { data: conversations, isLoading: isConvosLoading } = useConversations();
  const [activeChat, setActiveChat] = useState<string | null>(userIdFromUrl || null);
  
  useEffect(() => {
    if (userIdFromUrl) setActiveChat(userIdFromUrl);
  }, [userIdFromUrl]);

  const [messageText, setMessageText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading: isMessagesLoading, refetch: refetchMessages } = useMessages(activeChat);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!session?.user?.userId) return;
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit("join", session.user.userId);
    newSocket.on("newMessage", () => refetchMessages());
    return () => { newSocket.disconnect(); };
  }, [session, refetchMessages]);

  const activeConvo = conversations?.find((c) => c.otherUser._id === activeChat);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    sendMessage({ targetId: activeChat, content: messageText }, {
      onSuccess: (newMsg) => {
        setMessageText("");
        socket?.emit("sendMessage", { receiverId: activeChat, message: newMsg });
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full max-w-6xl mx-auto bg-[#FEF9F9] rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className={`w-full md:w-[360px] flex-shrink-0 bg-[#FFFDFD] border-r border-gray-100/80 flex flex-col z-10 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-serif text-gray-900 tracking-tight">Messages</h2>
            <span className="bg-[#F1D7D9] text-[#82444D] text-[11px] font-bold px-3 py-1.5 rounded-full">2 Unread</span>
          </div>
          
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-[#F4EFEF] border-transparent rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#82444D]/30 transition-all placeholder:text-gray-500 text-gray-800" 
            />
          </div>

          <div className="flex space-x-2 mb-2">
            <button className="px-5 py-1.5 bg-[#EBD8DB] text-[#82444D] text-xs font-bold rounded-full">All (4)</button>
            <button className="px-5 py-1.5 bg-[#F4EFEF] text-gray-500 hover:text-gray-700 text-xs font-bold rounded-full transition-colors">Unread (2)</button>
          </div>
        </div>

        {/* Sidebar List */}
        <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
          {isConvosLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#82444D]" /></div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="text-center p-8"><p className="text-sm text-gray-400">No conversations yet.</p></div>
          ) : (
            <div className="flex flex-col">
              {conversations.map((convo) => {
                const isActive = activeChat === convo.otherUser._id;
                return (
                  <button
                    key={convo._id}
                    onClick={() => setActiveChat(convo.otherUser._id)}
                    className={`w-full text-left p-4 flex items-start transition-all ${isActive ? 'bg-white border-l-4 border-[#82444D] shadow-[0_2px_10px_rgba(0,0,0,0.02)]' : 'border-l-4 border-transparent hover:bg-gray-50/50'}`}
                  >
                    <div className="relative mr-4 flex-shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {convo.otherUser.mainPhoto ? (
                          <img src={convo.otherUser.mainPhoto} alt={convo.otherUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 m-auto text-gray-400 mt-3" />
                        )}
                      </div>
                      {/* Online dot */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="flex items-center">
                          <h3 className="text-[15px] font-semibold text-gray-900 truncate">{convo.otherUser.name}, 28</h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 ml-1.5 fill-yellow-500" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">10:14 AM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] text-gray-500 truncate pr-2">Tap to view your messages</p>
                        {/* Fake unread badge just for UI match */}
                        {!isActive && <div className="w-4 h-4 rounded-full bg-[#82444D] text-white text-[9px] flex items-center justify-center">1</div>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative bg-[#FEF9F9] ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-12 h-12 text-[#EBD8DB] mb-4" />
            <h3 className="text-xl font-serif text-gray-800">Select a conversation</h3>
            <p className="text-gray-500 text-sm mt-2">Choose someone from the list to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between z-20">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {activeConvo?.otherUser.mainPhoto ? (
                      <img src={activeConvo?.otherUser.mainPhoto} alt={activeConvo?.otherUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 m-auto text-gray-400 mt-2.5" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <h3 className="text-[15px] font-bold text-gray-900">{activeConvo?.otherUser.name}, 28</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 ml-1.5 fill-yellow-500" />
                  </div>
                  <p className="text-[11px] font-semibold text-green-600 mt-0.5">Active now</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Timeline */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6 custom-scrollbar relative z-10">
              
              {/* System Match Message */}
              <div className="flex justify-center mt-2 mb-4">
                <div className="bg-[#EBD8DB] text-[#82444D] px-6 py-3 rounded-xl text-[12px] font-medium text-center max-w-sm">
                  You and {activeConvo?.otherUser.name} matched recently. Start the conversation!
                </div>
              </div>

              {isMessagesLoading ? (
                <div className="flex justify-center m-auto"><Loader2 className="w-6 h-6 animate-spin text-[#82444D]" /></div>
              ) : !messages || messages.length === 0 ? (
                <div className="m-auto text-center"></div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === session?.user?.userId;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex flex-col max-w-[70%]">
                        <div className="flex items-end space-x-2">
                          {!isMine && (
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-1">
                              {activeConvo?.otherUser.mainPhoto ? (
                                <img src={activeConvo.otherUser.mainPhoto} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3 h-3 m-auto text-gray-400 mt-1.5" />
                              )}
                            </div>
                          )}
                          <div className={`px-5 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${isMine ? 'bg-[#82444D] text-white rounded-2xl rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'}`}>
                            <p className="text-[14.5px] leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                        <p className={`text-[10px] mt-1.5 font-medium text-gray-400 ${isMine ? 'text-right pr-1' : 'text-left pl-9'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white/50 backdrop-blur-md z-20">
              <form onSubmit={handleSend} className="flex items-center">
                <input
                  type="text"
                  placeholder="Type a thoughtful message..."
                  className="flex-1 bg-[#F4EFEF] border-transparent focus:outline-none focus:ring-1 focus:ring-[#82444D]/30 rounded-full pl-6 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-500 transition-all shadow-inner"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="ml-3 w-12 h-12 flex items-center justify-center bg-[#82444D] text-white rounded-full hover:bg-[#6c3640] transition-all disabled:opacity-50 shadow-md flex-shrink-0"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
