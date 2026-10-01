import { useQuery } from "@tanstack/react-query";
import { fetchExploreData } from "./exploreapi";

/**
 * Function: exploreKeys
 * Executes the core operations and logic for explore keys.
 */
export const exploreKeys = {
  all: ["explore"] as const,
  list: (filters: any) => [...exploreKeys.all, filters] as const,
};

/**
 * Function: useExploreData
 * Executes the core operations and logic for use explore data.
 */
export const useExploreData = (filters?: { q?: string; minAge?: string; maxAge?: string; religion?: string }) => {
  return useQuery({
    queryKey: exploreKeys.list(filters),
    queryFn: () => fetchExploreData(filters),
  });
};
