import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStatsApi,
  getAdminUsersApi,
  toggleBanUserApi,
  togglePremiumUserApi,
  getAdminReportsApi,
} from "./admin.api";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (params: any) => [...adminKeys.all, "users", params] as const,
  reports: () => [...adminKeys.all, "reports"] as const,
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

export const useAdminReports = () => {
  return useQuery({
    queryKey: adminKeys.reports(),
    queryFn: getAdminReportsApi,
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
