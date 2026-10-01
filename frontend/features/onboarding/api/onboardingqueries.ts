import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitOnboardingApi } from "./onboardingapi";
import { authKeys } from "../../auth/api/authqueries";

export const useOnboarding = () => {
  const queryClient = useQueryClient();

  const submitOnboarding = useMutation({
    mutationFn: submitOnboardingApi,
    onSuccess: () => {
      // Invalidate the auth session so that the updated isOnboardingComplete state is fetched
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });

  return {
    submitOnboarding,
  };
};
