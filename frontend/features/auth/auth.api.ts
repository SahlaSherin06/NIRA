import { api } from "../../lib/axios";



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


export const changePasswordApi = async (data: any) => {
  const res = await api.put("/auth/change-password", data);
  return res.data;
};

export const changeEmailApi = async (data: any) => {
  const res = await api.put("/auth/change-email", data);
  return res.data;
};

export const forgotPasswordApi = async (data: { email: string }) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data;
};

export const resetPasswordApi = async (data: { email: string; otp: string; newPassword: string }) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};
