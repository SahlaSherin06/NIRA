import { useMutation, useQueryClient } from "@tanstack/react-query";
import { devUpgradeApi } from "./subscription.api";
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
