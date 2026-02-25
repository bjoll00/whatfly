/**
 * Image optimization utilities for reducing Supabase bandwidth usage
 * 
 * Note: Supabase image transformations (/render/image/) require Pro plan.
 * For now, we return original URLs and rely on expo-image disk caching.
 * If you upgrade to Pro, set ENABLE_IMAGE_TRANSFORMS = true below.
 */

// Set to true if you have Supabase Pro plan with image transformations
const ENABLE_IMAGE_TRANSFORMS = false;

// Image size presets for different use cases
export const ImageSize = {
  // Feed images - full width, high quality
  FEED: { width: 600, quality: 80 },
  // Profile avatars - small, medium quality
  AVATAR_SMALL: { width: 100, quality: 75 },
  // Larger avatars (profile headers)
  AVATAR_LARGE: { width: 200, quality: 80 },
  // Thumbnail grid (profile posts grid)
  THUMBNAIL: { width: 200, quality: 70 },
  // Full size image view
  FULL: { width: 1200, quality: 85 },
} as const;

export type ImageSizePreset = keyof typeof ImageSize;

/**
 * Check if a URL is from Supabase storage
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase') && url.includes('/storage/');
}

/**
 * Get optimized image URL with Supabase transformations
 * Only applies to Supabase storage URLs when transforms are enabled
 * 
 * @param url - Original image URL
 * @param preset - Size preset (FEED, AVATAR_SMALL, AVATAR_LARGE, THUMBNAIL, FULL)
 * @returns Optimized URL (or original if transforms disabled)
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  preset: ImageSizePreset = 'FEED'
): string | undefined {
  if (!url) return undefined;
  
  // If transforms are disabled or not a Supabase URL, return original
  if (!ENABLE_IMAGE_TRANSFORMS || !isSupabaseStorageUrl(url)) {
    return url;
  }

  const { width, quality } = ImageSize[preset];
  
  // Supabase image transformation URL format (Pro plan only)
  // Replace /object/public/ with /render/image/public/ and add params
  const transformedUrl = url
    .replace('/object/public/', '/render/image/public/')
    .concat(`?width=${width}&quality=${quality}&format=webp`);
  
  return transformedUrl;
}

/**
 * Get optimized avatar URL
 */
export function getAvatarUrl(
  url: string | null | undefined,
  size: 'small' | 'large' = 'small'
): string | undefined {
  return getOptimizedImageUrl(url, size === 'small' ? 'AVATAR_SMALL' : 'AVATAR_LARGE');
}

/**
 * Get optimized feed image URL
 */
export function getFeedImageUrl(url: string | null | undefined): string | undefined {
  return getOptimizedImageUrl(url, 'FEED');
}

/**
 * Get optimized thumbnail URL for grids
 */
export function getThumbnailUrl(url: string | null | undefined): string | undefined {
  return getOptimizedImageUrl(url, 'THUMBNAIL');
}
