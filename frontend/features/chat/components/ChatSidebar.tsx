import React, { useState } from "react";
import { User } from "lucide-react";

interface ChatSidebarProps {
  conversations: any[];
  activeChat: string | null;
  setActiveChat: (id: string | null) => void;
  filter: "all" | "unread";
  setFilter: (f: "all" | "unread") => void;
  allCount: number;
  unreadChatsCount: number;
}

const formatChatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (date.getTime() < 1000) return "";
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
  if (isSameDay(date, today)) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export function ChatSidebar({
  conversations,
  activeChat,
  setActiveChat,
  filter,
  setFilter,
  allCount,
  unreadChatsCount
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredConversations = conversations?.filter(c => {
    const matchesSearch = c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "unread") return c.unreadCount && c.unreadCount > 0;
    return true;
  });

  return (
    <div className={`w-full md:w-80 bg-[#FCF8F9] border-r border-gray-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-6 border-b border-gray-100/50">
        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6">Messages</h2>
        
        {/* Search placeholder */}
        <div className="relative mb-5">
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100/80 border-transparent focus:bg-white focus:border-brand-200 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex space-x-2 mb-2">
          <button 
            onClick={() => setFilter("all")}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-colors ${filter === "all" ? 'bg-[#EBD8DB] text-[#82444D]' : 'bg-[#F4EFEF] text-gray-500 hover:text-gray-700'}`}
          >
            All ({allCount})
          </button>
          <button 
            onClick={() => setFilter("unread")}
            className={`px-5 py-1.5 text-xs font-bold rounded-full transition-colors ${filter === "unread" ? 'bg-[#EBD8DB] text-[#82444D]' : 'bg-[#F4EFEF] text-gray-500 hover:text-gray-700'}`}
          >
            Unread ({unreadChatsCount})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!filteredConversations || filteredConversations.length === 0 ? (
          <div className="text-center p-8"><p className="text-sm text-gray-400">No conversations yet.</p></div>
        ) : (
          <div className="flex flex-col">
            {filteredConversations?.map((convo) => {
              const isActive = activeChat === convo.otherUser._id;
              const dateText = formatChatDate(convo.updatedAt);
                
              return (
                <button
                  key={convo._id}
                  onClick={() => setActiveChat(convo.otherUser._id)}
                  className={`w-full text-left p-4 flex items-start transition-all ${isActive ? 'bg-[#F1D7D9]/50 border-l-4 border-[#82444D]' : 'border-l-4 border-transparent hover:bg-gray-50/50'}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {convo.otherUser.mainPhoto ? (
                        <img src={convo.otherUser.mainPhoto} alt={convo.otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 m-auto mt-3 text-gray-400" />
                      )}
                    </div>
                    {convo.otherUser.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                        {convo.otherUser.name}
                      </h3>
                      <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap ml-2">
                        {dateText}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-[13px] truncate pr-2 ${convo.unreadCount && convo.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {convo.lastMessage ? convo.lastMessage.content : "Start a conversation"}
                      </p>
                      {convo.unreadCount && convo.unreadCount > 0 ? (
                        <span className="bg-[#82444D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                          {convo.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
