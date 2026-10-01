import { api } from "@/lib/axios";
import { Recommendation } from "../../feed/api/feedapi";

export interface MatchProfile extends Recommendation {
  matchedAt: string; // ISO date string
}

export interface MatchesResponse {
  mutualMatches: MatchProfile[];
  interestsReceived: MatchProfile[];
  interestsSent: MatchProfile[];
}

/**
 * Function: fetchMatchesData
 * Executes the core operations and logic for fetch matches data.
 */
export const fetchMatchesData = async (): Promise<MatchesResponse> => {
  const res = await api.get("/feed/matches");
  return res.data;
};

// We reuse the existing interact API for accepting interests
/**
 * Function: acceptInterest
 * Executes the core operations and logic for accept interest.
 */
export const acceptInterest = async (targetId: string) => {
  const res = await api.post("/feed/interact", { targetId, action: "like" });
  return res.data;
};

// Remove a sent interest
/**
 * Function: removeInterest
 * Executes the core operations and logic for remove interest.
 */
export const removeInterest = async (targetId: string) => {
  const res = await api.delete(`/feed/interact/${targetId}`);
  return res.data;
};
