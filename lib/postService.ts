import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

// Lazy import VideoThumbnails to prevent crash if native module isn't available
let VideoThumbnails: typeof import('expo-video-thumbnails') | null = null;
try {
  VideoThumbnails = require('expo-video-thumbnails');
} catch (e) {
  console.warn('expo-video-thumbnails not available - video thumbnails will be disabled');
}

// Types
export interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  fly_id: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  conditions: any | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  post_images?: PostImage[];
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
  is_video?: boolean;
  thumbnail_url?: string | null;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface MediaItem {
  uri: string;
  isVideo: boolean;
}

export interface CreatePostInput {
  caption?: string;
  fly_id?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  conditions?: any;
  is_public?: boolean;
  images?: string[]; // Array of local image URIs (legacy support)
  media?: MediaItem[]; // Array of media items (images and videos)
}

// Upload image to Supabase storage
async function uploadPostImage(uri: string, postId: string, index: number): Promise<string | null> {
  try {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const fileName = `${postId}/${Date.now()}-${index}.${ext}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, decode(base64), {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading post image:', error);
    return null;
  }
}

// Generate thumbnail from video
async function generateVideoThumbnail(videoUri: string): Promise<string | null> {
  // Check if VideoThumbnails module is available
  if (!VideoThumbnails) {
    console.log('📸 VideoThumbnails not available - skipping thumbnail generation');
    return null;
  }
  
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // Get frame at 1 second
      quality: 0.7,
    });
    return uri;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    return null;
  }
}

// Upload thumbnail image to Supabase storage
async function uploadThumbnail(uri: string, postId: string, index: number): Promise<string | null> {
  try {
    const fileName = `${postId}/${Date.now()}-${index}-thumb.jpg`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Thumbnail upload error:', uploadError);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return null;
  }
}

// Upload video to Supabase storage
async function uploadPostVideo(uri: string, postId: string, index: number): Promise<{ videoUrl: string | null; thumbnailUrl: string | null }> {
  try {
    const ext = uri.split('.').pop()?.toLowerCase() || 'mp4';
    const contentType = `video/${ext === 'mov' ? 'quicktime' : ext}`;
    const fileName = `${postId}/${Date.now()}-${index}.${ext}`;

    // Generate thumbnail first (before any uploads)
    console.log('📸 Generating video thumbnail...');
    const thumbnailUri = await generateVideoThumbnail(uri);
    let thumbnailUrl: string | null = null;
    
    if (thumbnailUri) {
      console.log('📤 Uploading thumbnail...');
      thumbnailUrl = await uploadThumbnail(thumbnailUri, postId, index);
    }

    // Read the video file as base64
    console.log('📤 Uploading video...');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Upload to Supabase storage (using post-images bucket for both)
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, decode(base64), {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Video upload error:', uploadError);
      return { videoUrl: null, thumbnailUrl };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    console.log('✅ Video uploaded successfully');
    return { 
      videoUrl: urlData?.publicUrl || null, 
      thumbnailUrl 
    };
  } catch (error) {
    console.error('Error uploading post video:', error);
    return { videoUrl: null, thumbnailUrl: null };
  }
}

// Create a new post
export async function createPost(userId: string, input: CreatePostInput): Promise<{ post: Post | null; error: string | null }> {
  try {
    // 1. Create the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        caption: input.caption || null,
        fly_id: input.fly_id || null,
        location_name: input.location_name || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        conditions: input.conditions || null,
        is_public: input.is_public ?? true,
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return { post: null, error: postError.message };
    }

    // 2. Upload media (images and videos) and create post_images records
    if (input.media && input.media.length > 0) {
      for (let i = 0; i < input.media.length; i++) {
        const mediaItem = input.media[i];
        
        if (mediaItem.isVideo) {
          // Upload video with thumbnail
          const { videoUrl, thumbnailUrl } = await uploadPostVideo(mediaItem.uri, post.id, i);
          
          if (videoUrl) {
            await supabase
              .from('post_images')
              .insert({
                post_id: post.id,
                image_url: videoUrl,
                display_order: i,
                is_video: true,
                thumbnail_url: thumbnailUrl,
              });
          }
        } else {
          // Upload image
          const imageUrl = await uploadPostImage(mediaItem.uri, post.id, i);
          
          if (imageUrl) {
            await supabase
              .from('post_images')
              .insert({
                post_id: post.id,
                image_url: imageUrl,
                display_order: i,
                is_video: false,
              });
          }
        }
      }
    } else if (input.images && input.images.length > 0) {
      // Legacy support for images-only input
      for (let i = 0; i < input.images.length; i++) {
        const imageUrl = await uploadPostImage(input.images[i], post.id, i);
        
        if (imageUrl) {
          await supabase
            .from('post_images')
            .insert({
              post_id: post.id,
              image_url: imageUrl,
              display_order: i,
              is_video: false,
            });
        }
      }
    }

    return { post, error: null };
  } catch (error) {
    console.error('Error in createPost:', error);
    return { post: null, error: 'Failed to create post' };
  }
}

// Get feed posts (public posts from all users)
export async function getFeedPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
  try {
    // First, get the posts with images and videos
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_images (id, image_url, display_order, is_video, thumbnail_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching feed:', error);
      return [];
    }

    if (!posts || posts.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(posts.map(p => p.user_id))];

    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);

    // Create a map of user_id to profile
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Get likes and comments counts and attach profiles
    const postsWithData = await Promise.all(
      posts.map(async (post) => {
        const [likesResult, commentsResult] = await Promise.all([
          supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
          supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
        ]);

        return {
          ...post,
          profiles: profileMap.get(post.user_id) || null,
          likes_count: likesResult.count || 0,
          comments_count: commentsResult.count || 0,
        };
      })
    );

    return postsWithData;
  } catch (error) {
    console.error('Error in getFeedPosts:', error);
    return [];
  }
}

// Get posts by user
export async function getUserPosts(userId: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_images (id, image_url, display_order, is_video, thumbnail_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }

    if (!posts || posts.length === 0) {
      return [];
    }

    // Fetch the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', userId)
      .single();

    // Attach profile to all posts
    return posts.map(post => ({
      ...post,
      profiles: profile || null,
    }));
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    return [];
  }
}

// Like a post
export async function likePost(userId: string, postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('likes')
      .insert({ user_id: userId, post_id: postId });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Error liking post:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in likePost:', error);
    return false;
  }
}

// Unlike a post
export async function unlikePost(userId: string, postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Error unliking post:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in unlikePost:', error);
    return false;
  }
}

// Check if user has liked a post
export async function hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

// Add a comment
export async function addComment(userId: string, postId: string, content: string): Promise<Comment | null> {
  try {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({ user_id: userId, post_id: postId, content })
      .select('*')
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    // Fetch the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', userId)
      .single();

    return {
      ...comment,
      profiles: profile || null,
    };
  } catch (error) {
    console.error('Error in addComment:', error);
    return null;
  }
}

// Get comments for a post
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(comments.map(c => c.user_id))];

    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);

    // Create a map of user_id to profile
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Attach profiles to comments
    return comments.map(comment => ({
      ...comment,
      profiles: profileMap.get(comment.user_id) || null,
    }));
  } catch (error) {
    console.error('Error in getComments:', error);
    return [];
  }
}

// Delete a post
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in deletePost:', error);
    return false;
  }
}

// Follow a user
export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error && error.code !== '23505') {
      console.error('Error following user:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in followUser:', error);
    return false;
  }
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    return false;
  }
}

// Check if user is following another user
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

// Get follower/following counts
export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  try {
    const [followersResult, followingResult] = await Promise.all([
      supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
      supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
    ]);

    return {
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
    };
  } catch (error) {
    console.error('Error getting follow counts:', error);
    return { followers: 0, following: 0 };
  }
}

// Follower/Following user profile type
export interface FollowUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  isFollowing?: boolean; // Whether the current user is following this user
}

// Get list of users who follow a user (followers)
export async function getFollowers(userId: string, currentUserId?: string): Promise<FollowUser[]> {
  try {
    // Get all follower relationships where this user is being followed
    const { data: follows, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (error) {
      console.error('Error fetching followers:', error);
      return [];
    }

    if (!follows || follows.length === 0) {
      return [];
    }

    // Get the follower user IDs
    const followerIds = follows.map(f => f.follower_id);

    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', followerIds);

    if (profilesError) {
      console.error('Error fetching follower profiles:', profilesError);
      return [];
    }

    // If current user is provided, check which followers they're following back
    let followingSet = new Set<string>();
    if (currentUserId) {
      const { data: currentUserFollowing } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', followerIds);
      
      if (currentUserFollowing) {
        followingSet = new Set(currentUserFollowing.map(f => f.following_id));
      }
    }

    return (profiles || []).map(profile => ({
      ...profile,
      isFollowing: followingSet.has(profile.id),
    }));
  } catch (error) {
    console.error('Error in getFollowers:', error);
    return [];
  }
}

// Get list of users that a user follows (following)
export async function getFollowing(userId: string, currentUserId?: string): Promise<FollowUser[]> {
  try {
    // Get all following relationships where this user is following others
    const { data: follows, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error) {
      console.error('Error fetching following:', error);
      return [];
    }

    if (!follows || follows.length === 0) {
      return [];
    }

    // Get the following user IDs
    const followingIds = follows.map(f => f.following_id);

    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', followingIds);

    if (profilesError) {
      console.error('Error fetching following profiles:', profilesError);
      return [];
    }

    // If current user is provided and different from userId, check which they're following
    let followingSet = new Set<string>();
    if (currentUserId && currentUserId !== userId) {
      const { data: currentUserFollowing } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', followingIds);
      
      if (currentUserFollowing) {
        followingSet = new Set(currentUserFollowing.map(f => f.following_id));
      }
    } else if (currentUserId === userId) {
      // If viewing own following list, all are being followed
      followingSet = new Set(followingIds);
    }

    return (profiles || []).map(profile => ({
      ...profile,
      isFollowing: followingSet.has(profile.id),
    }));
  } catch (error) {
    console.error('Error in getFollowing:', error);
    return [];
  }
}
