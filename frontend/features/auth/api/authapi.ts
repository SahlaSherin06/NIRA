import { api } from "../../../lib/axios";

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
        const res = await api.post("/auth/refresh");
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("nira_access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("nira_access_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// API Functions
/**
 * Function: getMeApi
 * Executes the core operations and logic for get me api.
 */
export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

/**
 * Function: loginStep1Api
 * Executes the core operations and logic for login step1 api.
 */
export const loginStep1Api = async (data: { email: string }) => {
  const res = await api.post("/auth/login/step1-email", data);
  return res.data;
};

/**
 * Function: loginStep2Api
 * Executes the core operations and logic for login step2 api.
 */
export const loginStep2Api = async (data: { email: string; otp: string }) => {
  const res = await api.post("/auth/login/step2-otp", data);
  return res.data;
};

/**
 * Function: loginStep3Api
 * Executes the core operations and logic for login step3 api.
 */
export const loginStep3Api = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login/step3-password", data);
  return res.data;
};

/**
 * Function: registerStep1Api
 * Executes the core operations and logic for register step1 api.
 */
export const registerStep1Api = async (data: { name: string; email: string; gender: string; createdFor: string }) => {
  const res = await api.post("/auth/register/step1", data);
  return res.data;
};

/**
 * Function: registerStep2Api
 * Executes the core operations and logic for register step2 api.
 */
export const registerStep2Api = async (data: { email: string; otp: string }) => {
  const res = await api.post("/auth/register/step2", data);
  return res.data;
};

/**
 * Function: registerStep3Api
 * Executes the core operations and logic for register step3 api.
 */
export const registerStep3Api = async (data: { email: string; password: string; confirmPassword: string }) => {
  const res = await api.post("/auth/register/step3", data);
  return res.data;
};

/**
 * Function: logoutApi
 * Executes the core operations and logic for logout api.
 */
export const logoutApi = async () => {
  await api.post("/auth/logout");
};

/**
 * Function: googleSignInApi
 * Executes the core operations and logic for google sign in api.
 */
export const googleSignInApi = async (accessToken: string) => {
  const res = await api.post("/auth/google", { accessToken });
  return res.data;
};
