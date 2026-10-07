import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMatchesData, acceptInterest, removeInterest } from "./matches.api";

/**
 * Function: matchesKeys
 * Executes the core operations and logic for matches keys.
 */
export const matchesKeys = {
  all: ["matches"] as const,
};

/**
 * Function: useMatchesData
 * Executes the core operations and logic for use matches data.
 */
export const useMatchesData = () => {
  return useQuery({
    queryKey: matchesKeys.all,
    queryFn: fetchMatchesData,
  });
};

/**
 * Function: useAcceptInterest
 * Executes the core operations and logic for use accept interest.
 */
export const useAcceptInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: acceptInterest,
    onSuccess: () => {
      // Invalidate both matches and feed queries to refresh UI
      queryClient.invalidateQueries({ queryKey: matchesKeys.all });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
};

/**
 * Function: useRemoveInterest
 * Executes the core operations and logic for use remove interest.
 */
export const useRemoveInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeInterest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchesKeys.all });
      queryClient.invalidateQueries({ queryKey: ["explore"] });
    },
  });
};

import { interactApi } from "../feed/feed.api";

/**
 * Function: useReportInterest
 * Executes the core operations and logic for use report interest.
 */
export const useReportInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { targetId: string; reason: string }) => interactApi({ targetId: data.targetId, action: "report", reason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchesKeys.all });
    },
  });
};

