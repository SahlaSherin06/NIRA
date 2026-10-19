import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/axios";

// TYPES
export interface Recommendation {
  _id: string;
  name: string;
  gender: string;
    subscription?: {
      plan: 'free' | 'premium';
    };
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
    photoPrivacy: string;
  };
  matchScore?: number;
  matchedCount?: number;
  totalCriteria?: number;
}

export interface FeedFilterParams {
  minAge?: number;
  maxAge?: number;
  religion?: string;
  caste?: string;
  sect?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  alcohol?: string;
  education?: string;
  profession?: string;
  maritalStatus?: string[];
  location?: string;
  nationality?: string;
  children?: string;
  language?: string;
  height?: string;
}

/**
 * Function: feedKeys
 * Executes the core operations and logic for feed keys.
 */
export const feedKeys = {
  all: ["feed"] as const,
  recommendations: (filters?: FeedFilterParams) => [...feedKeys.all, "recommendations", filters || {}] as const,
};

/**
 * Function: getRecommendationsApi
 * Executes the core operations and logic for get recommendations api.
 */
export const getRecommendationsApi = async (page = 1, filters?: FeedFilterParams): Promise<{ recommendations: Recommendation[], nextPage: number | null }> => {
  const params: any = { page, limit: 10, ...filters };
  const response = await api.get(`/feed/recommendations`, { params });
  return response.data;
};

/**
 * Function: interactApi
 * Executes the core operations and logic for interact api.
 */
export const interactApi = async (data: { targetId: string; action: "like" | "superlike" | "pass" | "block" | "favorite" | "report", reason?: string }) => {
  const response = await api.post("/feed/interact", data);
  return response.data;
};


export const undoPassApi = async () => {
  const response = await api.post("/feed/undo-pass");
  return response.data;
};

// HOOKS
/**
 * Function: useRecommendations
 * Executes the core operations and logic for use recommendations.
 */
export function useRecommendations(filters?: FeedFilterParams) {
  return useInfiniteQuery({
    queryKey: feedKeys.recommendations(filters),
    queryFn: ({ pageParam = 1 }) => getRecommendationsApi(pageParam, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
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


export interface ActivityLog {
  _id: string;
  action: "like" | "superlike" | "pass" | "block" | "favorite" | "report";
  createdAt: string;
  reason?: string;
  targetUser: {
    _id: string;
    name: string;
  };
  targetProfile?: {
    mainPhoto?: string;
    city?: string;
    profession?: string;
  };
}

export const getActivityLogsApi = async (page = 1): Promise<{ logs: ActivityLog[], nextPage: number | null }> => {
  const response = await api.get(`/feed/activity?page=${page}&limit=20`);
  return response.data;
};

export function useActivityLogs() {
  return useInfiniteQuery({
    queryKey: [...feedKeys.all, "activity"],
    queryFn: ({ pageParam = 1 }) => getActivityLogsApi(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

export interface BlockedUser {
  _id: string;
  name: string;
  mainPhoto: string | null;
  blockedAt: string;
}

export const getBlockedUsersApi = async (): Promise<{ blockedUsers: BlockedUser[] }> => {
  const response = await api.get('/feed/blocked');
  return response.data;
};

export const removeActionApi = async (targetId: string) => {
  const response = await api.delete(`/feed/interact/${targetId}`);
  return response.data;
};

import { useQuery } from "@tanstack/react-query";

export function useBlockedUsers() {
  return useQuery({
    queryKey: [...feedKeys.all, "blocked"],
    queryFn: getBlockedUsersApi,
  });
}

export function useRemoveAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeActionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...feedKeys.all, "blocked"] });
      queryClient.invalidateQueries({ queryKey: [...feedKeys.all, "activity"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }); // invalidate chat list too
    },
  });
}

export function useUndoPass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: undoPassApi,
    onSuccess: () => {
      // Allow the component to handle local state update
    }
  });
}
