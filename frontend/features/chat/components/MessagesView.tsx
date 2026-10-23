"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConversations, useMessages, useSendMessage, useClearChat } from "@/features/chat/chat.queries";
import { useSession } from "@/features/auth/auth.queries";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Trash2, Ban } from "lucide-react";
import io, { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/features/chat/chat.queries";
import { Message } from "@/features/chat/chat.api";
import { useMyProfile } from "@/features/profile/profile.queries";
import { useInteract, useRemoveAction } from "@/features/feed/feed.api";

import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { ChatWindow } from "@/features/chat/components/ChatWindow";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";

export function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("user");

  const [activeChat, setActiveChat] = useState<string | null>(urlUserId || null);
  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"clear" | "block" | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const { data: myProfile } = useMyProfile();
  const { data: conversations, isLoading: isConversationsLoading } = useConversations();
  const { data: messages, isLoading: isMessagesLoading, error: messagesError } = useMessages(activeChat || "");
  const isSuspendedUser = !!(messagesError as any)?.response?.data?.isSuspended;
  
  const sendMessageMutation = useSendMessage();
  const clearChatMutation = useClearChat();
  const interactMutation = useInteract();
  const unblockMutation = useRemoveAction();

  const activeConvo = conversations?.find((c) => c.otherUser._id === activeChat);

  // Sync activeChat when URL search parameter changes (e.g. browser back/forward or deep link)
  useEffect(() => {
    setActiveChat(urlUserId || null);
  }, [urlUserId]);

  const handleSelectChat = (userId: string | null) => {
    setActiveChat(userId);
    if (userId) {
      router.replace(`/messages?user=${userId}`, { scroll: false });
    } else {
      router.replace(`/messages`, { scroll: false });
    }
  };

  // Keep latest refs so socket listeners never disconnect on activeChat switch
  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const activeConvoRef = useRef(activeConvo);
  useEffect(() => {
    activeConvoRef.current = activeConvo;
  }, [activeConvo]);

  useEffect(() => {
    const currentUserId = session?.user?._id || session?.user?.userId;
    if (!currentUserId) return;
    
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    setSocket(newSocket);
    
    newSocket.on("connect", () => {
      newSocket.emit("join", currentUserId);
    });
    
    newSocket.on("receiveMessage", (message: Message & { conversationId?: string }) => {
      const currentChatId = activeChatRef.current;
      const isFromActiveUser = currentChatId && (message.senderId === currentChatId);

      if (isFromActiveUser) {
        // Direct instant cache update: 0ms latency for incoming bubble!
        queryClient.setQueryData<Message[]>(chatKeys.messages(currentChatId), (old = []) => {
          if (!old) return [message];
          if (old.some((m) => m._id === message._id)) return old;
          return [...old, message];
        });
        
        newSocket.emit("markAsRead", { 
          conversationId: message.conversationId || activeConvoRef.current?._id, 
          userId: currentUserId,
          targetId: message.senderId,
        });
      }

      // Update conversations list in-place directly without full network round-trip
      let found = false;
      queryClient.setQueryData<any[]>(chatKeys.conversations(), (old = []) => {
        if (!old) return old;
        const updated = old.map((convo) => {
          if (convo.otherUser._id === message.senderId) {
            found = true;
            return {
              ...convo,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
              },
              unreadCount: isFromActiveUser ? 0 : (convo.unreadCount || 0) + 1,
              updatedAt: message.createdAt,
            };
          }
          return convo;
        });
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      if (!found) {
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      }
    });

    // When recipient reads messages, mark our sent messages as read (blue double ticks)
    newSocket.on("messagesRead", () => {
      const currentChatId = activeChatRef.current;
      if (currentChatId) {
        queryClient.setQueryData<Message[]>(chatKeys.messages(currentChatId), (old = []) => {
          if (!old) return old;
          return old.map((m) => ({ ...m, isRead: true }));
        });
      }
    });

    // Real-time Force Logout if admin suspends this account while on chat page
    newSocket.on("accountSuspended", () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nira_access_token");
        queryClient.clear();
        window.location.href = "/login?suspended=true";
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?._id, session?.user?.userId, queryClient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;
    
    const textToSend = messageText.trim();
    setMessageText(""); // Snappy zero-delay UI clear
    
    sendMessageMutation.mutate(
      { targetId: activeChat, content: textToSend },
      { 
        onError: (err: any) => {
          setMessageText(textToSend); // Restore user text if network failed
          if (err?.response?.data?.isSuspended) {
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
          }
        }
      }
    );
  };

  const handleClearChat = () => {
    setShowMenu(false);
    setConfirmAction("clear");
  };

  const handleBlockUser = () => {
    setShowMenu(false);
    setConfirmAction("block");
  };

  
  const handleSendLike = () => {
    if (!activeChat) return;
    interactMutation.mutate(
      { targetId: activeChat, action: "like" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        }
      }
    );
  };

  const handleUnblockUser = () => {
    if (!activeChat) return;
    
    // Optimistic Update
    queryClient.setQueryData(["chat", "conversations"], (old: any) => {
      if (!old) return old;
      return old.map((c: any) => c.otherUser._id === activeChat ? { ...c, isBlockedByMe: false } : c);
    });
    
    unblockMutation.mutate(activeChat, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
        queryClient.invalidateQueries({ queryKey: ["feed", "blocked"] });
      }
    });
  };

  const executeConfirmAction = () => {
    if (!activeChat) return;
    if (confirmAction === "clear") {
      clearChatMutation.mutate(activeChat, {
        onSuccess: () => setConfirmAction(null)
      });
    } else if (confirmAction === "block") {
      // Optimistic Update
      queryClient.setQueryData(["chat", "conversations"], (old: any) => {
        if (!old) return old;
        return old.map((c: any) => c.otherUser._id === activeChat ? { ...c, isBlockedByMe: true } : c);
      });
      setConfirmAction(null);
      
      interactMutation.mutate({ targetId: activeChat, action: "block" }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
          queryClient.invalidateQueries({ queryKey: ["feed", "blocked"] });
        },
        onError: () => {
          // Revert on error
          queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
        }
      });
    }
  };

  const allCount = conversations?.length || 0;
  const unreadChatsCount = conversations?.filter(c => c.unreadCount && c.unreadCount > 0).length || 0;

  return (
    <div className="flex h-[calc(100dvh-144px)] md:h-[calc(100vh-140px)] bg-white overflow-hidden w-full rounded-none md:rounded-3xl border-0 md:border md:border-gray-100 shadow-none md:shadow-sm">
      <div className="flex-1 flex bg-white w-full h-full overflow-hidden">
        
        <ChatSidebar 
          conversations={conversations || []}
          activeChat={activeChat}
          setActiveChat={handleSelectChat}
          filter={filter}
          setFilter={setFilter}
          allCount={allCount}
          unreadChatsCount={unreadChatsCount}
        />

        <ChatWindow 
          activeChat={activeChat}
          setActiveChat={handleSelectChat}
          activeConvo={activeConvo}
          messages={messages}
          isMessagesLoading={isMessagesLoading}
          isConversationsLoading={isConversationsLoading}
          myProfile={myProfile}
          session={session}
          messageText={messageText}
          setMessageText={setMessageText}
          isSending={sendMessageMutation.isPending}
          handleSend={handleSend}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          handleClearChat={handleClearChat}
          handleBlockUser={handleBlockUser}
          handleUnblockUser={handleUnblockUser}
          unblockMutationPending={unblockMutation.isPending}
          handleSendLike={handleSendLike}
          isSendLikePending={interactMutation.isPending}
          isSuspended={isSuspendedUser}
        />

      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4 mx-auto">
              {confirmAction === "clear" ? <Trash2 className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              {confirmAction === "clear" ? "Clear Chat?" : "Block User?"}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {confirmAction === "clear" 
                ? "Are you sure you want to clear all messages? This action cannot be undone." 
                : "Are you sure you want to block this user? They will be permanently removed from your matches."}
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmAction}
                disabled={clearChatMutation.isPending || interactMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                {clearChatMutation.isPending || interactMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Do it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
