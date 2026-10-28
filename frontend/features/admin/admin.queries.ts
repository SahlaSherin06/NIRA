import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStatsApi,
  getAdminUsersApi,
  toggleBanUserApi,
  getAdminReportsApi,
  warnReportUserApi,
  dismissAdminReportApi,
  resolveAdminReportApi,
  getAdminSubscriptionsApi,
  getEligibleUsersForGrantApi,
  grantVipAccessApi,
  extendVipSubscriptionApi,
  revokeVipSubscriptionApi,
  getAdminNotificationsApi,
  markAllAdminNotificationsReadApi,
  markAdminNotificationReadApi,
  deleteAdminNotificationApi,
  clearAllAdminNotificationsApi,
} from "./admin.api";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (params: any) => [...adminKeys.all, "users", params] as const,
  reports: (params?: any) => [...adminKeys.all, "reports", params] as const,
  subscriptions: (params?: any) => [...adminKeys.all, "subscriptions", params] as const,
  eligibleUsers: (search?: string) => [...adminKeys.all, "eligible-users", search] as const,
  notifications: (params?: any) => [...adminKeys.all, "notifications", params] as const,
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStatsApi,
  });
};

export const useAdminUsers = (params: { page?: number; search?: string; filter?: string; gender?: string }) => {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => getAdminUsersApi(params),
  });
};

export const useAdminReports = (params?: { search?: string; status?: string }) => {
  return useQuery({
    queryKey: adminKeys.reports(params),
    queryFn: () => getAdminReportsApi(params),
  });
};

export const useWarnReportUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reportId: string; message: string }) => warnReportUserApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useDismissAdminReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reportId: string; note?: string }) => dismissAdminReportApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useResolveAdminReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reportId: string; note?: string }) => resolveAdminReportApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useToggleBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleBanUserApi(id),
    onMutate: async (id: string) => {
      // 1. Cancel any active refetches so they don't overwrite the optimistic state
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      // 2. Snapshot previous query data for all users lists
      const previousUsersQueries = queryClient.getQueriesData({ queryKey: ["admin", "users"] });

      // 3. Optimistically flip isBanned state in all cached user query pages
      queryClient.setQueriesData({ queryKey: ["admin", "users"] }, (oldData: any) => {
        if (!oldData || !oldData.users) return oldData;
        const targetUser = oldData.users.find((u: any) => u._id === id);
        if (!targetUser) return oldData;

        const willBeBanned = !targetUser.isBanned;

        return {
          ...oldData,
          users: oldData.users.map((u: any) =>
            u._id === id ? { ...u, isBanned: willBeBanned } : u
          ),
          metrics: oldData.metrics
            ? {
                ...oldData.metrics,
                banned: willBeBanned
                  ? oldData.metrics.banned + 1
                  : Math.max(0, oldData.metrics.banned - 1),
              }
            : oldData.metrics,
        };
      });

      return { previousUsersQueries };
    },
    onError: (_err, _id, context: any) => {
      // Rollback to previous snapshot if network request failed
      if (context?.previousUsersQueries) {
        context.previousUsersQueries.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Background sync across admin portal
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// --- Subscriptions Hooks ---
export const useAdminSubscriptions = (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.subscriptions(params),
    queryFn: () => getAdminSubscriptionsApi(params),
  });
};

export const useEligibleUsersForGrant = (search?: string) => {
  return useQuery({
    queryKey: adminKeys.eligibleUsers(search),
    queryFn: () => getEligibleUsersForGrantApi(search),
  });
};

export const useGrantVipAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; duration: "1_month" | "3_months" | "6_months" | "lifetime"; note?: string }) =>
      grantVipAccessApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useExtendVipSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { subscriberId: string; days: number; note?: string }) =>
      extendVipSubscriptionApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useRevokeVipSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { subscriberId: string; note?: string }) => revokeVipSubscriptionApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// --- Admin Notifications Hooks ---
export const useAdminNotifications = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  filter?: "all" | "unread" | "read";
}) => {
  return useQuery({
    queryKey: adminKeys.notifications(params),
    queryFn: () => getAdminNotificationsApi(params),
  });
};

export const useMarkAllAdminNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAdminNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useMarkAdminNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAdminNotificationReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useDeleteAdminNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminNotificationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useClearAllAdminNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAllAdminNotificationsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

