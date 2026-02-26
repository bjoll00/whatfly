import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { 
  getFeedPosts, 
  getUserPosts,
  hasUserLikedPost, 
  likePost, 
  unlikePost,
  deletePost,
  Post 
} from '../lib/postService';

/**
 * Hook to fetch feed posts with caching
 */
export function useFeedPosts(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['feed', limit],
    queryFn: async () => {
      const posts = await getFeedPosts(limit, 0);
      return posts;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for feed freshness
  });
}

/**
 * Hook to fetch user's posts
 */
export function useUserPosts(userId: string | null) {
  return useQuery({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getUserPosts(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to check if user has liked posts
 * Returns an array of liked post IDs (arrays serialize properly with AsyncStorage)
 */
export function useLikedPosts(userId: string | null, postIds: string[]) {
  return useQuery({
    queryKey: ['likedPosts', userId, postIds],
    queryFn: async () => {
      if (!userId || postIds.length === 0) return [] as string[];
      
      const likedIds: string[] = [];
      await Promise.all(
        postIds.map(async (postId) => {
          const hasLiked = await hasUserLikedPost(userId, postId);
          if (hasLiked) likedIds.push(postId);
        })
      );
      return likedIds;
    },
    enabled: !!userId && postIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to like/unlike a post with optimistic updates
 */
export function useLikePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Must be logged in');
      
      if (isLiked) {
        await unlikePost(user.id, postId);
      } else {
        await likePost(user.id, postId);
      }
      return !isLiked;
    },
    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      // Snapshot previous value
      const previousFeed = queryClient.getQueryData<Post[]>(['feed', 10]);
      
      // Optimistically update feed
      queryClient.setQueryData<Post[]>(['feed', 10], (old) => {
        if (!old) return old;
        return old.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1),
            };
          }
          return post;
        });
      });

      return { previousFeed };
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', 10], context.previousFeed);
      }
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const success = await deletePost(postId);
      if (!success) throw new Error('Failed to delete post');
      return postId;
    },
    onSuccess: (deletedPostId) => {
      // Remove from feed cache
      queryClient.setQueryData<Post[]>(['feed', 10], (old) => {
        if (!old) return old;
        return old.filter(post => post.id !== deletedPostId);
      });
      
      // Invalidate user posts
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

/**
 * Hook to invalidate feed cache
 */
export function useInvalidateFeed() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  };
}
