import { useMutation, useQueryClient } from "@tanstack/react-query";
import { devUpgradeApi, createOrderApi, verifyPaymentApi } from "./subscription.api";
import { authKeys } from "@/features/auth/auth.queries";

export const useDevUpgrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: devUpgradeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrderApi,
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyPaymentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
};
