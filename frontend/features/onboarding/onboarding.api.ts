import { api } from "../../lib/axios";
import { OnboardingData } from "./types";

/**
 * API Function: submitOnboardingApi
 * Sends the completed onboarding payload to the backend.
 * @param data - The full onboarding form data collected from all steps
 * @returns The created Profile and Preference documents
 */
export const submitOnboardingApi = async (data: Partial<OnboardingData>) => {
  const res = await api.post("/profile/onboarding", data);
  return res.data;
};



/**
 * API Function: saveDraftApi
 * Saves the current onboarding draft to the backend.
 */
export const saveDraftApi = async (data: { step: number; data: Partial<OnboardingData> }) => {
  const res = await api.post("/profile/draft", data);
  return res.data;
};

/**
 * API Function: getDraftApi
 * Fetches the onboarding draft from the backend.
 */
export const getDraftApi = async () => {
  try {
    const res = await api.get("/profile/draft");
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};
