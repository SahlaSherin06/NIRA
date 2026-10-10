"use client";

import React, { useState, useEffect } from "react";
import { useConversations, useMessages, useSendMessage, useClearChat } from "@/features/chat/chat.queries";
import { useSession } from "@/features/auth/auth.queries";
import { useSearchParams } from "next/navigation";
import { Loader2, Trash2, Ban } from "lucide-react";
import io, { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/features/chat/chat.queries";
import { useMyProfile } from "@/features/profile/profile.queries";
import { useInteract, useRemoveAction } from "@/features/feed/feed.api";

import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { ChatWindow } from "@/features/chat/components/ChatWindow";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";

export function MessagesView() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"clear" | "block" | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const { data: myProfile } = useMyProfile();
  const { data: conversations, isLoading: isConversationsLoading } = useConversations();
  const { data: messages, isLoading: isMessagesLoading } = useMessages(activeChat || "");
  
  const sendMessageMutation = useSendMessage();
  const clearChatMutation = useClearChat();
  const interactMutation = useInteract();
  const unblockMutation = useRemoveAction();

  const activeConvo = conversations?.find((c) => c.otherUser._id === activeChat);

  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) setActiveChat(userId);
  }, [searchParams]);

  useEffect(() => {
    if (!session?.user?._id && !session?.user?.userId) return;
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.emit("join", session.user._id || session.user.userId);
    
    newSocket.on("receiveMessage", (message) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      if (message.conversationId === activeConvo?._id) {
        queryClient.invalidateQueries({ queryKey: chatKeys.messages(activeChat!) });
        newSocket.emit("markAsRead", { 
          conversationId: message.conversationId, 
          userId: session.user._id || session.user.userId 
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [session, activeChat, activeConvo, queryClient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;
    
    sendMessageMutation.mutate(
      { targetId: activeChat, content: messageText },
      { onSuccess: () => setMessageText("") }
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
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-white overflow-hidden">
      <div className="flex-1 flex bg-white w-full">
        
        <ChatSidebar 
          conversations={conversations || []}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          filter={filter}
          setFilter={setFilter}
          allCount={allCount}
          unreadChatsCount={unreadChatsCount}
        />

        <ChatWindow 
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          activeConvo={activeConvo}
          messages={messages}
          isMessagesLoading={isMessagesLoading}
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
