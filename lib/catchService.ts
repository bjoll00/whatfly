import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

// Types
export interface Catch {
  id: string;
  user_id: string;
  fish_species: string | null;
  size_length: number | null;
  size_weight: number | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  fly_used: string | null;
  fly_id: string | null;
  water_temperature: number | null;
  water_conditions: string | null;
  weather_conditions: string | null;
  air_temperature: number | null;
  photo_url: string | null;
  notes: string | null;
  caught_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCatchInput {
  fish_species?: string;
  size_length?: number;
  size_weight?: number;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  fly_used?: string;
  fly_id?: string;
  water_temperature?: number;
  water_conditions?: string;
  weather_conditions?: string;
  air_temperature?: number;
  photo_uri?: string; // Local URI for photo
  notes?: string;
  caught_at?: Date;
}

export interface UpdateCatchInput extends Partial<CreateCatchInput> {
  id: string;
}

// Common fish species for fly fishing
export const COMMON_FISH_SPECIES = [
  'Rainbow Trout',
  'Brown Trout',
  'Brook Trout',
  'Cutthroat Trout',
  'Golden Trout',
  'Lake Trout',
  'Bull Trout',
  'Steelhead',
  'Salmon (Chinook)',
  'Salmon (Coho)',
  'Salmon (Sockeye)',
  'Salmon (Pink)',
  'Largemouth Bass',
  'Smallmouth Bass',
  'Striped Bass',
  'Bluegill',
  'Crappie',
  'Carp',
  'Pike',
  'Musky',
  'Walleye',
  'Perch',
  'Catfish',
  'Grayling',
  'Whitefish',
  'Other',
];

// Water condition options
export const WATER_CONDITIONS = [
  'Clear',
  'Slightly Murky',
  'Murky',
  'Stained',
  'High',
  'Normal',
  'Low',
  'Fast',
  'Slow',
];

// Weather condition options
export const WEATHER_CONDITIONS = [
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Overcast',
  'Rainy',
  'Stormy',
  'Snowy',
  'Foggy',
  'Windy',
];

// Upload catch photo to Supabase storage
async function uploadCatchPhoto(uri: string, catchId: string): Promise<string | null> {
  try {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const fileName = `catches/${catchId}/${Date.now()}.${ext}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('post-images') // Reusing existing bucket
      .upload(fileName, decode(base64), {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Catch photo upload error:', uploadError);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading catch photo:', error);
    return null;
  }
}

// Create a new catch log
export async function createCatch(
  userId: string,
  input: CreateCatchInput
): Promise<{ catch: Catch | null; error: string | null }> {
  try {
    // First create the catch record to get an ID
    const { data: newCatch, error: insertError } = await supabase
      .from('catches')
      .insert({
        user_id: userId,
        fish_species: input.fish_species || null,
        size_length: input.size_length || null,
        size_weight: input.size_weight || null,
        location_name: input.location_name || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        fly_used: input.fly_used || null,
        fly_id: input.fly_id || null,
        water_temperature: input.water_temperature || null,
        water_conditions: input.water_conditions || null,
        weather_conditions: input.weather_conditions || null,
        air_temperature: input.air_temperature || null,
        notes: input.notes || null,
        caught_at: input.caught_at?.toISOString() || new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating catch:', insertError);
      return { catch: null, error: insertError.message };
    }

    // Upload photo if provided
    if (input.photo_uri && newCatch) {
      const photoUrl = await uploadCatchPhoto(input.photo_uri, newCatch.id);
      
      if (photoUrl) {
        // Update the catch with the photo URL
        const { data: updatedCatch, error: updateError } = await supabase
          .from('catches')
          .update({ photo_url: photoUrl })
          .eq('id', newCatch.id)
          .select()
          .single();

        if (!updateError && updatedCatch) {
          return { catch: updatedCatch, error: null };
        }
      }
    }

    return { catch: newCatch, error: null };
  } catch (error) {
    console.error('Error in createCatch:', error);
    return { catch: null, error: 'Failed to log catch' };
  }
}

// Get all catches for a user
export async function getUserCatches(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Catch[]> {
  try {
    const { data: catches, error } = await supabase
      .from('catches')
      .select('*')
      .eq('user_id', userId)
      .order('caught_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching catches:', error);
      return [];
    }

    return catches || [];
  } catch (error) {
    console.error('Error in getUserCatches:', error);
    return [];
  }
}

// Get a single catch by ID
export async function getCatch(catchId: string): Promise<Catch | null> {
  try {
    const { data: catchData, error } = await supabase
      .from('catches')
      .select('*')
      .eq('id', catchId)
      .single();

    if (error) {
      console.error('Error fetching catch:', error);
      return null;
    }

    return catchData;
  } catch (error) {
    console.error('Error in getCatch:', error);
    return null;
  }
}

// Update a catch
export async function updateCatch(
  input: UpdateCatchInput
): Promise<{ catch: Catch | null; error: string | null }> {
  try {
    const { id, photo_uri, ...updates } = input;

    // Upload new photo if provided
    let photoUrl: string | null = null;
    if (photo_uri) {
      photoUrl = await uploadCatchPhoto(photo_uri, id);
    }

    const updateData: any = {};
    
    if (updates.fish_species !== undefined) updateData.fish_species = updates.fish_species;
    if (updates.size_length !== undefined) updateData.size_length = updates.size_length;
    if (updates.size_weight !== undefined) updateData.size_weight = updates.size_weight;
    if (updates.location_name !== undefined) updateData.location_name = updates.location_name;
    if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
    if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
    if (updates.fly_used !== undefined) updateData.fly_used = updates.fly_used;
    if (updates.fly_id !== undefined) updateData.fly_id = updates.fly_id;
    if (updates.water_temperature !== undefined) updateData.water_temperature = updates.water_temperature;
    if (updates.water_conditions !== undefined) updateData.water_conditions = updates.water_conditions;
    if (updates.weather_conditions !== undefined) updateData.weather_conditions = updates.weather_conditions;
    if (updates.air_temperature !== undefined) updateData.air_temperature = updates.air_temperature;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.caught_at !== undefined) updateData.caught_at = updates.caught_at.toISOString();
    if (photoUrl) updateData.photo_url = photoUrl;
    
    updateData.updated_at = new Date().toISOString();

    const { data: updatedCatch, error } = await supabase
      .from('catches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating catch:', error);
      return { catch: null, error: error.message };
    }

    return { catch: updatedCatch, error: null };
  } catch (error) {
    console.error('Error in updateCatch:', error);
    return { catch: null, error: 'Failed to update catch' };
  }
}

// Delete a catch
export async function deleteCatch(catchId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('catches')
      .delete()
      .eq('id', catchId);

    if (error) {
      console.error('Error deleting catch:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCatch:', error);
    return false;
  }
}

// Get catch statistics for a user
export async function getCatchStats(userId: string): Promise<{
  totalCatches: number;
  speciesCount: number;
  topSpecies: string | null;
  largestCatch: { species: string; length: number; weight: number } | null;
}> {
  try {
    const { data: catches, error } = await supabase
      .from('catches')
      .select('fish_species, size_length, size_weight')
      .eq('user_id', userId);

    if (error || !catches) {
      return {
        totalCatches: 0,
        speciesCount: 0,
        topSpecies: null,
        largestCatch: null,
      };
    }

    // Count unique species
    const speciesSet = new Set(
      catches
        .filter(c => c.fish_species)
        .map(c => c.fish_species)
    );

    // Find most common species
    const speciesCounts: Record<string, number> = {};
    catches.forEach(c => {
      if (c.fish_species) {
        speciesCounts[c.fish_species] = (speciesCounts[c.fish_species] || 0) + 1;
      }
    });
    
    const topSpecies = Object.entries(speciesCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // Find largest catch (by weight, then by length)
    const sortedBySize = catches
      .filter(c => c.fish_species && (c.size_weight || c.size_length))
      .sort((a, b) => {
        if (a.size_weight && b.size_weight) return b.size_weight - a.size_weight;
        if (a.size_length && b.size_length) return b.size_length - a.size_length;
        return 0;
      });

    const largest = sortedBySize[0];

    return {
      totalCatches: catches.length,
      speciesCount: speciesSet.size,
      topSpecies,
      largestCatch: largest ? {
        species: largest.fish_species!,
        length: largest.size_length || 0,
        weight: largest.size_weight || 0,
      } : null,
    };
  } catch (error) {
    console.error('Error in getCatchStats:', error);
    return {
      totalCatches: 0,
      speciesCount: 0,
      topSpecies: null,
      largestCatch: null,
    };
  }
}

