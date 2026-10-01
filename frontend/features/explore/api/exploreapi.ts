import { api } from "@/lib/axios";
import { Recommendation } from "../../feed/api/feedapi";

export interface ExploreResponse {
  completeBios: Recommendation[];
  justJoined: Recommendation[];
}

/**
 * Function: fetchExploreData
 * Executes the core operations and logic for fetch explore data.
 */
export const fetchExploreData = async (params?: { q?: string; minAge?: string; maxAge?: string; religion?: string }): Promise<ExploreResponse> => {
  const res = await api.get("/feed/explore", { params });
  return res.data;
};
