import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationsApi, markNotificationsReadApi } from "./notificationapi";

/**
 * Function: notificationKeys
 * Executes the core operations and logic for notification keys.
 */
export const notificationKeys = {
  all: ["notifications"] as const,
};

/**
 * Function: useNotifications
 * Executes the core operations and logic for use notifications.
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: getNotificationsApi,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

/**
 * Function: useMarkNotificationsRead
 * Executes the core operations and logic for use mark notifications read.
 */
export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
