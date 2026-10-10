import { api } from "@/lib/axios";

export interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    age?: number | string;
    mainPhoto: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount?: number;
  isBlockedByMe?: boolean;
  isBlockedByThem?: boolean;
  isMutual?: boolean;
  haveISentLike?: boolean;
  updatedAt: string;
}

export interface Message {
  _id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const getConversationsApi = async (): Promise<Conversation[]> => {
  const res = await api.get("/chat/conversations");
  return res.data;
};

export const getMessagesApi = async (targetId: string): Promise<Message[]> => {
  const res = await api.get(`/chat/${targetId}`);
  return res.data.messages;
};

export const sendMessageApi = async (data: { targetId: string; content: string }): Promise<Message> => {
  const res = await api.post(`/chat/${data.targetId}`, { content: data.content });
  return res.data;
};

export const clearChatApi = async (targetId: string) => {
  const res = await api.delete(`/chat/${targetId}`);
  return res.data;
};
