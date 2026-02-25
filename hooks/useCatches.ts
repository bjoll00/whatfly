import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Catch, getCatchStats, getUserCatches, logCatch } from '../lib/catchService';

/**
 * Hook to fetch user catches with caching
 */
export function useUserCatches(userId: string | null) {
  return useQuery({
    queryKey: ['catches', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getUserCatches(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch catch stats with caching
 */
export function useCatchStats(userId: string | null) {
  return useQuery({
    queryKey: ['catchStats', userId],
    queryFn: async () => {
      if (!userId) {
        return {
          totalCatches: 0,
          speciesCount: 0,
          topSpecies: null,
          largestCatch: null,
        };
      }
      return getCatchStats(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to log a new catch with cache invalidation
 */
export function useLogCatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (catchData: Parameters<typeof logCatch>[0]) => {
      return logCatch(catchData);
    },
    onSuccess: (_, variables) => {
      // Invalidate catches and stats to refresh data
      queryClient.invalidateQueries({ queryKey: ['catches', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['catchStats', variables.userId] });
    },
  });
}

/**
 * Hook to invalidate catch cache
 */
export function useInvalidateCatches() {
  const queryClient = useQueryClient();
  
  return (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['catches', userId] });
    queryClient.invalidateQueries({ queryKey: ['catchStats', userId] });
  };
}
