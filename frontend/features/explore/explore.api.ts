import { api } from "@/lib/axios";
import { Recommendation, FeedFilterParams } from "../feed/feed.api";

export interface ExploreResponse {
  completeBios: Recommendation[];
  justJoined: Recommendation[];
  nextPage: number | null;
}

export type ExploreParams = FeedFilterParams & {
  q?: string;
  page?: number;
};

export const fetchExploreData = async (params?: ExploreParams): Promise<ExploreResponse> => {
  const res = await api.get("/feed/explore", { params });
  return res.data;
};
