/**
 * Permissions Hook
 * 
 * Centralized permission checking for guest vs authenticated users.
 * Use this to determine what features a user can access.
 */

import { useAuth } from './AuthContext';

export interface Permissions {
  // Features available to everyone
  canUseMap: boolean;
  canGetSuggestions: boolean;
  canViewPublicContent: boolean;
  
  // Features requiring authentication
  canSaveFavorites: boolean;
  canViewProfiles: boolean;
  canPost: boolean;
  canComment: boolean;
  canFollowUsers: boolean;
  canEditProfile: boolean;
  canSubmitFeedback: boolean;
  
  // Helper flags
  isAuthenticated: boolean;
  isGuest: boolean;
}

/**
 * Hook to get current user's permissions
 */
export function usePermissions(): Permissions {
  const { user, isGuest } = useAuth();
  
  const isAuthenticated = !!user && !isGuest;
  
  return {
    // Everyone can use these
    canUseMap: true,
    canGetSuggestions: true,
    canViewPublicContent: true,
    
    // Requires authentication
    canSaveFavorites: isAuthenticated,
    canViewProfiles: isAuthenticated,
    canPost: isAuthenticated,
    canComment: isAuthenticated,
    canFollowUsers: isAuthenticated,
    canEditProfile: isAuthenticated,
    canSubmitFeedback: isAuthenticated,
    
    // Helper flags
    isAuthenticated,
    isGuest,
  };
}

/**
 * Messages to show when a guest tries to use a restricted feature
 */
export const GUEST_RESTRICTION_MESSAGES = {
  saveFavorites: 'Create an account to save your favorite flies',
  viewProfiles: 'Sign in to view other anglers\' profiles',
  post: 'Create an account to share your catches',
  comment: 'Sign in to comment on posts',
  followUsers: 'Create an account to follow other anglers',
  submitFeedback: 'Sign in to submit feedback',
  default: 'Create an account to access this feature',
};

/**
 * Get the appropriate message for a restricted action
 */
export function getRestrictionMessage(action: keyof typeof GUEST_RESTRICTION_MESSAGES): string {
  return GUEST_RESTRICTION_MESSAGES[action] || GUEST_RESTRICTION_MESSAGES.default;
}
