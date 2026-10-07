import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConversationsApi, getMessagesApi, sendMessageApi } from "./chat.api";

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

  return useMutation({
    mutationFn: sendMessageApi,
    onSuccess: (data, variables) => {
      // Optimistically add message to cache or invalidate
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.targetId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
