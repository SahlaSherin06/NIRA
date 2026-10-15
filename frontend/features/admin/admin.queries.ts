import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStatsApi,
  getAdminUsersApi,
  toggleBanUserApi,
  togglePremiumUserApi,
  getAdminReportsApi,
  warnReportUserApi,
  dismissAdminReportApi,
  resolveAdminReportApi,
  getAdminSubscriptionsApi,
  getEligibleUsersForGrantApi,
  grantVipAccessApi,
  extendVipSubscriptionApi,
  revokeVipSubscriptionApi,
} from "./admin.api";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (params: any) => [...adminKeys.all, "users", params] as const,
  reports: (params?: any) => [...adminKeys.all, "reports", params] as const,
  subscriptions: (params?: any) => [...adminKeys.all, "subscriptions", params] as const,
  eligibleUsers: (search?: string) => [...adminKeys.all, "eligible-users", search] as const,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useTogglePremiumUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => togglePremiumUserApi(id),
    onSuccess: () => {
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

