// Fly image mapping system
// Maps fly names to their corresponding image assets

// Import fly images
const CaddisFly = require('@/assets/images/Caddis_fly.png');

// Fly image mapping
export const FLY_IMAGES: Record<string, any> = {
  'Elk Hair Caddis': CaddisFly,
  // Add more fly images here as they become available
  // 'Adams': require('@/assets/images/adams.png'),
  // 'Pheasant Tail Nymph': require('@/assets/images/pheasant_tail.png'),
  // 'Woolly Bugger': require('@/assets/images/woolly_bugger.png'),
};

// Function to get fly image by name
export function getFlyImage(flyName: string): any | null {
  return FLY_IMAGES[flyName] || null;
}

// Function to check if a fly has an image
export function hasFlyImage(flyName: string): boolean {
  return flyName in FLY_IMAGES;
}
