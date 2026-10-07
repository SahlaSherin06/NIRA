import { api } from "@/lib/axios";
import { Recommendation } from "../feed/feed.api";

export interface ExploreResponse {
  completeBios: Recommendation[];
  justJoined: Recommendation[];
  nextPage: number | null;
}

export const fetchExploreData = async (params?: { q?: string; minAge?: string; maxAge?: string; religion?: string; page?: number }): Promise<ExploreResponse> => {
  const res = await api.get("/feed/explore", { params });
  return res.data;
};
