import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConversationsApi, getMessagesApi, sendMessageApi, clearChatApi, Message, Conversation } from "./chat.api";
import { useSession } from "@/features/auth/auth.queries";

export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  messages: (targetId: string) => [...chatKeys.all, "messages", targetId] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: getConversationsApi,
  });
}

export function useMessages(targetId: string | null) {
  return useQuery({
    queryKey: chatKeys.messages(targetId as string),
    queryFn: () => getMessagesApi(targetId as string),
    enabled: !!targetId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?._id || session?.user?.userId || "";

  return useMutation({
    mutationFn: sendMessageApi,
    onMutate: async (variables) => {
      // 1. Cancel ongoing refetches so optimistic data isn't overwritten
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(variables.targetId) });
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

      // 2. Snapshot previous state for rollback
      const previousMessages = queryClient.getQueryData<Message[]>(chatKeys.messages(variables.targetId));
      const previousConversations = queryClient.getQueryData<Conversation[]>(chatKeys.conversations());

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();
      const optimisticMessage: Message = {
        _id: tempId,
        senderId: currentUserId,
        content: variables.content,
        isRead: false,
        createdAt: nowIso,
      };

      // 3. Optimistically append message to active conversation cache (0ms lag!)
      queryClient.setQueryData<Message[]>(chatKeys.messages(variables.targetId), (old = []) => [
        ...(old || []),
        optimisticMessage,
      ]);

      // 4. Optimistically update conversations list (update preview and bring to top)
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations(), (old = []) => {
        if (!old) return old;
        return old.map((convo) => {
          if (convo.otherUser._id === variables.targetId) {
            return {
              ...convo,
              lastMessage: {
                content: variables.content,
                createdAt: nowIso,
              },
              updatedAt: nowIso,
            };
          }
          return convo;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      return { previousMessages, previousConversations, tempId, targetId: variables.targetId };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state on failure
      if (context?.previousMessages !== undefined) {
        queryClient.setQueryData(chatKeys.messages(context.targetId), context.previousMessages);
      }
      if (context?.previousConversations !== undefined) {
        queryClient.setQueryData(chatKeys.conversations(), context.previousConversations);
      }
    },
    onSuccess: (savedMessage, variables, context) => {
      // Swap temporary optimistic message with confirmed server message
      queryClient.setQueryData<Message[]>(chatKeys.messages(variables.targetId), (old = []) => {
        if (!old) return [savedMessage];
        const withoutTemp = old.filter((m) => m._id !== context?.tempId);
        if (withoutTemp.some((m) => m._id === savedMessage._id)) {
          return withoutTemp;
        }
        return [...withoutTemp, savedMessage];
      });

      queryClient.setQueryData<Conversation[]>(chatKeys.conversations(), (old = []) => {
        if (!old) return old;
        return old.map((convo) => {
          if (convo.otherUser._id === variables.targetId) {
            return {
              ...convo,
              lastMessage: {
                content: savedMessage.content,
                createdAt: savedMessage.createdAt,
              },
              updatedAt: savedMessage.createdAt,
            };
          }
          return convo;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    },
  });
}

export const useClearChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearChatApi,
    onMutate: async (targetId) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(targetId) });
      const previousMessages = queryClient.getQueryData<Message[]>(chatKeys.messages(targetId));
      queryClient.setQueryData(chatKeys.messages(targetId), []);
      return { previousMessages, targetId };
    },
    onError: (_err, _targetId, context) => {
      if (context?.previousMessages !== undefined) {
        queryClient.setQueryData(chatKeys.messages(context.targetId), context.previousMessages);
      }
    },
    onSuccess: (_, targetId) => {
      queryClient.setQueryData(chatKeys.messages(targetId), []);
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations(), (old = []) => {
        if (!old) return old;
        return old.map((c) => (c.otherUser._id === targetId ? { ...c, lastMessage: null } : c));
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};
