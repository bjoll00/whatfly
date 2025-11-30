/**
 * Profile Service
 * 
 * Handles all profile-related database operations for the social features.
 * Uses Supabase for data storage with Row Level Security (RLS).
 */

import { supabase } from './supabase';
import { Profile, ProfileUpdate } from './types';

const PROFILES_TABLE = 'profiles';

// Simple profanity word list (common profanity - keep this list private)
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'dick', 'cock', 'pussy', 'cunt', 
  'bastard', 'damn', 'piss', 'slut', 'whore', 'fag', 'nigger', 'nigga',
  'retard', 'porn', 'sex', 'penis', 'vagina', 'anus', 'dildo',
  // Common variations
  'fck', 'fuk', 'fuq', 'sht', 'btch', 'dck', 'pss', 'cnt',
  'f_ck', 'sh_t', 'b_tch', 'd_ck', 'c_ck', 'p_ssy',
];

// Reserved words that cannot be used in usernames (case-insensitive)
const RESERVED_WORDS = [
  // Brand protection
  'whatfly', 'what_fly', 'whatflyfishing', 'whatfly_fishing',
  'official', 'verified', 'real', 'authentic', 'legit',
  // Admin/System
  'admin', 'administrator', 'moderator', 'mod', 'support', 'helpdesk', 
  'team', 'staff', 'employee', 'customer_service', 'customerservice',
  // System words
  'system', 'root', 'null', 'undefined', 'anonymous', 'guest', 
  'user', 'account', 'profile', 'settings', 'config', 'api',
  'bot', 'robot', 'automated', 'auto',
  // Impersonation
  'ceo', 'founder', 'cofounder', 'developer', 'dev', 'owner', 
  'creator', 'programmer', 'engineer',
  // Generic blocked
  'test', 'testing', 'example', 'demo', 'sample',
];

// Days required between username changes
const USERNAME_CHANGE_COOLDOWN_DAYS = 7;

/**
 * Check if username contains reserved words
 */
function containsReservedWord(username: string): boolean {
  const lowerUsername = username.toLowerCase();
  return RESERVED_WORDS.some(word => lowerUsername.includes(word));
}

/**
 * Check if username contains profanity
 * Also checks for leet speak substitutions
 */
function containsProfanity(username: string): boolean {
  const lowerUsername = username.toLowerCase();
  
  // Check direct match against profanity list
  for (const word of PROFANITY_LIST) {
    if (lowerUsername.includes(word)) {
      return true;
    }
  }
  
  // Check with leet speak decoded
  const leetDecoded = decodeLeetSpeak(lowerUsername);
  for (const word of PROFANITY_LIST) {
    if (leetDecoded.includes(word)) {
      return true;
    }
  }
  
  // Check username without underscores (in case profanity is split)
  const withoutUnderscores = lowerUsername.replace(/_/g, '');
  for (const word of PROFANITY_LIST) {
    if (withoutUnderscores.includes(word)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Decode common leet speak substitutions
 */
function decodeLeetSpeak(text: string): string {
  const leetMap: { [key: string]: string } = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
    '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's',
    '!': 'i', '|': 'l', '+': 't',
  };
  
  return text.split('').map(char => leetMap[char] || char).join('');
}

/**
 * Check if user can change their username (7-day cooldown)
 */
export function canChangeUsername(profile: Profile): { canChange: boolean; daysRemaining?: number } {
  if (!profile.username_changed_at) {
    return { canChange: true };
  }
  
  const lastChange = new Date(profile.username_changed_at);
  const now = new Date();
  const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceChange >= USERNAME_CHANGE_COOLDOWN_DAYS) {
    return { canChange: true };
  }
  
  return { 
    canChange: false, 
    daysRemaining: USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange 
  };
}

/**
 * Get a user's profile by their user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 = no rows returned, which is expected for new users
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

/**
 * Get a profile by username
 */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching profile by username:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getProfileByUsername:', error);
    return null;
  }
}

/**
 * Check if a username is available (case-insensitive)
 * Returns true if the username is available, false if taken or invalid
 */
export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  try {
    // Validate username format first
    const validationError = getUsernameValidationError(username);
    if (validationError) {
      return false;
    }

    // Build query for case-insensitive check
    let query = supabase
      .from(PROFILES_TABLE)
      .select('id')
      .ilike('username', username); // Case-insensitive match

    // Exclude current user if updating
    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query.single();

    if (error) {
      // PGRST116 = no rows returned, meaning username is available
      if (error.code === 'PGRST116') {
        return true;
      }
      console.error('Error checking username availability:', error);
      return false;
    }

    // If we got data, username is taken
    return !data;
  } catch (error) {
    console.error('Error in checkUsernameAvailable:', error);
    return false;
  }
}

/**
 * Validate username format
 * - 1-20 characters
 * - Only letters, numbers, and underscores
 * - No reserved words
 * - No profanity
 */
export function isValidUsername(username: string): boolean {
  return getUsernameValidationError(username) === null;
}

/**
 * Get username validation error message
 * Returns null if username is valid, error message otherwise
 */
export function getUsernameValidationError(username: string): string | null {
  // Check if empty
  if (!username || username.length === 0) {
    return 'Username is required';
  }
  
  // Check max length
  if (username.length > 20) {
    return 'Username must be 20 characters or less';
  }
  
  // Check format (alphanumeric + underscores only)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  
  // Check for reserved words
  if (containsReservedWord(username)) {
    return 'This username is not allowed';
  }
  
  // Check for profanity
  if (containsProfanity(username)) {
    return 'This username is not allowed';
  }
  
  return null;
}

/**
 * Comprehensive username validation with detailed results
 * Use this for real-time validation feedback
 */
export interface UsernameValidationResult {
  isValid: boolean;
  isAvailable?: boolean; // Only set if format is valid
  error?: string;
}

export async function validateUsername(
  username: string, 
  excludeUserId?: string
): Promise<UsernameValidationResult> {
  // Check format first
  const formatError = getUsernameValidationError(username);
  if (formatError) {
    return { isValid: false, error: formatError };
  }
  
  // Check availability
  const isAvailable = await checkUsernameAvailable(username, excludeUserId);
  if (!isAvailable) {
    return { isValid: false, isAvailable: false, error: 'Username is already taken' };
  }
  
  return { isValid: true, isAvailable: true };
}

/**
 * Create a new profile for a user
 */
export async function createProfile(
  userId: string, 
  username: string
): Promise<{ profile?: Profile; error?: any }> {
  try {
    // Validate username
    const validationError = getUsernameValidationError(username);
    if (validationError) {
      return { error: { message: validationError } };
    }

    // Check if username is available
    const isAvailable = await checkUsernameAvailable(username);
    if (!isAvailable) {
      return { error: { message: 'Username is already taken' } };
    }

    const newProfile = {
      id: userId,
      username: username.toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .insert([newProfile])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return { error: { message: 'Username is already taken' } };
      }
      
      return { error };
    }

    console.log('✅ Profile created successfully:', data);
    return { profile: data };
  } catch (error) {
    console.error('Error in createProfile:', error);
    return { error: { message: 'Failed to create profile' } };
  }
}

/**
 * Update a user's profile
 */
export async function updateProfile(
  userId: string, 
  updates: ProfileUpdate,
  currentProfile?: Profile
): Promise<{ profile?: Profile; error?: any }> {
  try {
    // Build update data
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    // If username is being updated, validate it
    if (updates.username) {
      // First, get current profile if not provided (needed for cooldown check)
      let profile = currentProfile;
      if (!profile) {
        profile = await getProfile(userId) || undefined;
      }
      
      // Check if username is actually changing
      const isUsernameChanging = profile && 
        profile.username.toLowerCase() !== updates.username.toLowerCase();
      
      if (isUsernameChanging && profile) {
        // Check cooldown period
        const { canChange, daysRemaining } = canChangeUsername(profile);
        if (!canChange) {
          return { 
            error: { 
              message: `You can change your username again in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}` 
            } 
          };
        }
      }
      
      // Validate username format (includes reserved words and profanity check)
      const validationError = getUsernameValidationError(updates.username);
      if (validationError) {
        return { error: { message: validationError } };
      }

      // Check if new username is available (case-insensitive, excluding current user)
      const isAvailable = await checkUsernameAvailable(updates.username, userId);
      if (!isAvailable) {
        return { error: { message: 'Username is already taken' } };
      }

      // Normalize username to lowercase and track change time
      updateData.username = updates.username.toLowerCase();
      
      // Only update username_changed_at if username is actually changing
      if (isUsernameChanging) {
        updateData.username_changed_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return { error: { message: 'Username is already taken' } };
      }
      
      return { error };
    }

    console.log('✅ Profile updated successfully:', data);
    return { profile: data };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return { error: { message: 'Failed to update profile' } };
  }
}

/**
 * Delete a user's profile
 * Note: This should typically happen automatically via CASCADE when user is deleted
 */
export async function deleteProfile(userId: string): Promise<{ error?: any }> {
  try {
    const { error } = await supabase
      .from(PROFILES_TABLE)
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting profile:', error);
      return { error };
    }

    console.log('✅ Profile deleted successfully');
    return {};
  } catch (error) {
    console.error('Error in deleteProfile:', error);
    return { error: { message: 'Failed to delete profile' } };
  }
}

/**
 * Search profiles by username or display name
 * For future social features
 */
export async function searchProfiles(
  query: string, 
  limit: number = 20
): Promise<Profile[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchProfiles:', error);
    return [];
  }
}
