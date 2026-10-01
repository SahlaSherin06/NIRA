import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/axios";

// TYPES
export interface Recommendation {
  _id: string;
  name: string;
  gender: string;
  profile: {
    dob: string;
    height: number;
    weight: number;
    bloodGroup: string;
    maritalStatus: string;
    haveChildren: string;
    numberOfChildren: number;
    nationality: string;
    grewUpIn: string;
    city: string;
    state: string;
    country: string;
    religion: string;
    caste: string;
    ethnicity: string;
    motherTongue: string;
    educationLevel: string;
    profession: string;
    annualIncome: string;
    diet: string;
    dressingSense: string;
    smoke: string;
    drink: string;
    personality: string[];
    interests: string[];
    bio: string;
    whatBringsYouHere: string;
    knowSomeoneFor: string;
    marryWithin: string;
    moveAbroad: string;
    mainPhoto: string;
    galleryPhotos: string[];
    photoPrivacy: "Public" | "Blurred";
  };
}

/**
 * Function: feedKeys
 * Executes the core operations and logic for feed keys.
 */
export const feedKeys = {
  all: ["feed"] as const,
  recommendations: () => [...feedKeys.all, "recommendations"] as const,
};

/**
 * Function: getRecommendationsApi
 * Executes the core operations and logic for get recommendations api.
 */
export const getRecommendationsApi = async (): Promise<Recommendation[]> => {
  const response = await api.get("/feed/recommendations");
  return response.data.recommendations;
};

/**
 * Function: interactApi
 * Executes the core operations and logic for interact api.
 */
export const interactApi = async (data: { targetId: string; action: "like" | "pass" | "block" | "favorite" | "report", reason?: string }) => {
  const response = await api.post("/feed/interact", data);
  return response.data;
};

// HOOKS
/**
 * Function: useRecommendations
 * Executes the core operations and logic for use recommendations.
 */
export function useRecommendations() {
  return useQuery({
    queryKey: feedKeys.recommendations(),
    queryFn: getRecommendationsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Function: useInteract
 * Executes the core operations and logic for use interact.
 */
export function useInteract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: interactApi,
    onSuccess: () => {
      // We don't invalidate the whole feed immediately to prevent layout jumps,
      // The local state will shift the queue, but we could refetch if the queue is low.
    },
  });
}
