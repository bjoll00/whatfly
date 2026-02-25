import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getFollowCounts, followUser, unfollowUser, isFollowing } from '../lib/postService';
import * as profileService from '../lib/profileService';
import { Profile, ProfileUpdate } from '../lib/types';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch a user's profile with caching
 */
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      return profileService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a user's profile by their user ID (for other users)
 */
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch follow counts
 */
export function useFollowCounts(userId: string | null) {
  return useQuery({
    queryKey: ['followCounts', userId],
    queryFn: async () => {
      if (!userId) return { followers: 0, following: 0 };
      return getFollowCounts(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to check if current user is following another user
 */
export function useIsFollowing(currentUserId: string | null, targetUserId: string | null) {
  return useQuery({
    queryKey: ['isFollowing', currentUserId, targetUserId],
    queryFn: async () => {
      if (!currentUserId || !targetUserId) return false;
      return isFollowing(currentUserId, targetUserId);
    },
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to follow/unfollow a user with optimistic updates
 */
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      currentUserId, 
      targetUserId, 
      isCurrentlyFollowing 
    }: { 
      currentUserId: string; 
      targetUserId: string; 
      isCurrentlyFollowing: boolean;
    }) => {
      if (isCurrentlyFollowing) {
        await unfollowUser(currentUserId, targetUserId);
      } else {
        await followUser(currentUserId, targetUserId);
      }
      return !isCurrentlyFollowing;
    },
    onMutate: async ({ currentUserId, targetUserId, isCurrentlyFollowing }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['isFollowing', currentUserId, targetUserId] });
      await queryClient.cancelQueries({ queryKey: ['followCounts', targetUserId] });

      // Snapshot previous values
      const previousIsFollowing = queryClient.getQueryData(['isFollowing', currentUserId, targetUserId]);
      const previousCounts = queryClient.getQueryData<{ followers: number; following: number }>(['followCounts', targetUserId]);

      // Optimistically update
      queryClient.setQueryData(['isFollowing', currentUserId, targetUserId], !isCurrentlyFollowing);
      queryClient.setQueryData<{ followers: number; following: number }>(['followCounts', targetUserId], (old) => {
        if (!old) return { followers: isCurrentlyFollowing ? 0 : 1, following: 0 };
        return {
          ...old,
          followers: old.followers + (isCurrentlyFollowing ? -1 : 1),
        };
      });

      return { previousIsFollowing, previousCounts };
    },
    onError: (_, { currentUserId, targetUserId }, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(['isFollowing', currentUserId, targetUserId], context.previousIsFollowing);
        queryClient.setQueryData(['followCounts', targetUserId], context.previousCounts);
      }
    },
    onSettled: (_, __, { currentUserId, targetUserId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['followCounts', currentUserId] });
    },
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: ProfileUpdate }) => {
      const result = await profileService.updateProfile(userId, updates);
      if (result.error) throw new Error(result.error);
      return result.profile;
    },
    onSuccess: (updatedProfile, { userId }) => {
      // Update profile cache
      queryClient.setQueryData(['profile', userId], updatedProfile);
      queryClient.setQueryData(['userProfile', userId], updatedProfile);
    },
  });
}

/**
 * Hook to invalidate profile cache
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  
  return (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    queryClient.invalidateQueries({ queryKey: ['followCounts', userId] });
  };
}
