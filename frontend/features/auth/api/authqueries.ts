import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getMeApi, loginStep1Api, loginStep2Api, loginStep3Api, 
  registerStep1Api, registerStep2Api, registerStep3Api, 
  logoutApi, googleSignInApi 
} from "./authapi";

/**
 * Function: authKeys
 * Executes the core operations and logic for auth keys.
 */
export const authKeys = {
  session: ["session"] as const,
};

// Custom hook 
/**
 * Function: useSession
 * Executes the core operations and logic for use session.
 */
export const useSession = () => {
  const queryClient = useQueryClient();

  // 1. Get Current User Query
  const { data: session, isLoading, error } = useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      // If there's no access token in localStorage, don't even try to fetch
      if (!localStorage.getItem("nira_access_token")) return null;
      return await getMeApi();
    },
    retry: false, // Don't retry on 401
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // --- 3-STEP 2FA LOGIN MUTATIONS ---
  const loginStep1 = useMutation({
    mutationFn: loginStep1Api,
  });

  const loginStep2 = useMutation({
    mutationFn: loginStep2Api,
  });

  const loginStep3 = useMutation({
    mutationFn: loginStep3Api,
    onSuccess: (data) => {
      localStorage.setItem("nira_access_token", data.accessToken);
      queryClient.setQueryData(authKeys.session, { user: data.user });
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
  // ----------------------------------

  // --- 3-STEP REGISTRATION MUTATIONS ---
  const registerStep1 = useMutation({
    mutationFn: registerStep1Api,
  });

  const registerStep2 = useMutation({
    mutationFn: registerStep2Api,
  });

  const registerStep3 = useMutation({
    mutationFn: registerStep3Api,
    onSuccess: (data) => {
      localStorage.setItem("nira_access_token", data.accessToken);
      queryClient.setQueryData(authKeys.session, { user: data.user });
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
  // -------------------------------------

  // Sign Out
  const signOutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      localStorage.removeItem("nira_access_token");
      queryClient.setQueryData(authKeys.session, null);
      window.location.href = "/";
    },
  });

  // Google Sign In
  const googleSignInMutation = useMutation({
    mutationFn: googleSignInApi,
    onSuccess: (data) => {
      localStorage.setItem("nira_access_token", data.accessToken);
      queryClient.setQueryData(authKeys.session, { user: data.user });
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });

  return {
    data: session,
    isPending: isLoading,
    error,
    loginStep1,
    loginStep2,
    loginStep3,
    registerStep1,
    registerStep2,
    registerStep3,
    signOut: signOutMutation,
    signInWithGoogle: googleSignInMutation,
  };
};
