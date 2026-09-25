import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./axios";

// Interceptor to automatically add the Access Token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nira_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 errors and refresh the token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token using the HTTP-Only cookie
        const res = await api.post("/auth/refresh");
        const newAccessToken = res.data.accessToken;
        
        // Save the new access token
        localStorage.setItem("nira_access_token", newAccessToken);
        
        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (cookie expired/invalid), log the user out
        localStorage.removeItem("nira_access_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Custom hook 
export const useSession = () => {
  const queryClient = useQueryClient();

  // 1. Get Current User Query
  const { data: session, isLoading, error } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      // If there's no access token in localStorage, don't even try to fetch
      if (!localStorage.getItem("nira_access_token")) return null;
      
      const res = await api.get("/auth/me");
      return res.data; // { user: { id, name, email } }
    },
    retry: false, // Don't retry on 401
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // --- 3-STEP 2FA LOGIN MUTATIONS ---
  const loginStep1 = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await api.post("/auth/login/step1-email", data);
      return res.data;
    },
  });

  const loginStep2 = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await api.post("/auth/login/step2-otp", data);
      return res.data;
    },
  });

  const loginStep3 = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post("/auth/login/step3-password", data);
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("nira_access_token", data.accessToken);
      queryClient.setQueryData(['session'], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
  // ----------------------------------

  // --- 3-STEP REGISTRATION MUTATIONS ---
  const registerStep1 = useMutation({
    mutationFn: async (data: { name: string; email: string; gender: string; createdFor: string }) => {
      const res = await api.post("/auth/register/step1", data);
      return res.data;
    },
  });

  const registerStep2 = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await api.post("/auth/register/step2", data);
      return res.data;
    },
  });

  const registerStep3 = useMutation({
    mutationFn: async (data: { email: string; password: string; confirmPassword: string }) => {
      const res = await api.post("/auth/register/step3", data);
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("nira_access_token", data.accessToken);
      queryClient.setQueryData(['session'], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
  // -------------------------------------

  // Sign Out
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      localStorage.removeItem("nira_access_token");
      queryClient.setQueryData(["session"], null);
      window.location.href = "/login";
    },
  });

  // Google Sign In
  const googleSignInMutation = useMutation({
    mutationFn: async (accessToken: string) => {
      const res = await api.post("/auth/google", { accessToken });
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("nira_access_token", data.accessToken);
      queryClient.setQueryData(['session'], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ['session'] });
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
