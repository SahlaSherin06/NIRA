import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchExploreData, ExploreParams } from "./explore.api";

export const exploreKeys = {
  all: ["explore"] as const,
  list: (filters: any) => [...exploreKeys.all, filters] as const,
};

export const useExploreData = (filters?: ExploreParams) => {
  return useInfiniteQuery({
    queryKey: exploreKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => fetchExploreData({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
