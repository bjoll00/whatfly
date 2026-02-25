import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserConversations, Conversation } from '../lib/messagingService';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch user conversations with caching
 */
export function useConversations(userId: string | null) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getUserConversations(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes - conversations update frequently
  });
}

/**
 * Hook to search users for messaging
 */
export function useSearchUsers(query: string, currentUserId: string | null) {
  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      if (query.trim().length < 2 || !currentUserId) return [];
      
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId)
        .limit(10);

      return users || [];
    },
    enabled: query.trim().length >= 2 && !!currentUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes for search results
  });
}

/**
 * Hook to invalidate conversations cache
 */
export function useInvalidateConversations() {
  const queryClient = useQueryClient();
  
  return (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
  };
}
