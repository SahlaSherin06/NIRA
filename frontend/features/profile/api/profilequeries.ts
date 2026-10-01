import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyProfile, updateMyProfileApi } from "./profileapi";

/**
 * Function: profileKeys
 * Executes the core operations and logic for profile keys.
 */
export const profileKeys = {
  me: ["myProfile"] as const,
};

/**
 * Function: useMyProfile
 * Executes the core operations and logic for use my profile.
 */
export const useMyProfile = () => {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: fetchMyProfile,
  });
};

/**
 * Function: useUpdateMyProfile
 * Executes the core operations and logic for use update my profile.
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};
