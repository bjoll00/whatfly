import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

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

export interface CreatePostInput {
  caption?: string;
  fly_id?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  conditions?: any;
  is_public?: boolean;
  images?: string[]; // Array of local image URIs
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

    // 2. Upload images and create post_images records
    if (input.images && input.images.length > 0) {
      for (let i = 0; i < input.images.length; i++) {
        const imageUrl = await uploadPostImage(input.images[i], post.id, i);
        
        if (imageUrl) {
          await supabase
            .from('post_images')
            .insert({
              post_id: post.id,
              image_url: imageUrl,
              display_order: i,
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
    // First, get the posts with images
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_images (id, image_url, display_order)
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
        post_images (id, image_url, display_order)
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
