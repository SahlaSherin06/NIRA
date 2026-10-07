import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchExploreData } from "./explore.api";

export const exploreKeys = {
  all: ["explore"] as const,
  list: (filters: any) => [...exploreKeys.all, filters] as const,
};

export const useExploreData = (filters?: { q?: string; minAge?: string; maxAge?: string; religion?: string }) => {
  return useInfiniteQuery({
    queryKey: exploreKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => fetchExploreData({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
