import { api } from "../../../lib/axios";
import { OnboardingData } from "../types";

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

