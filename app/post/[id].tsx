import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../lib/AuthContext';
import {
  addComment,
  Comment,
  deletePost,
  getComments,
  hasUserLikedPost,
  likePost,
  Post,
  unlikePost,
} from '../../lib/postService';
import { supabase } from '../../lib/supabase';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnPost = user?.id === post?.user_id;

  const loadPost = useCallback(async () => {
    if (!id) return;
    
    try {
      // Fetch post with images
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          post_images (id, image_url, display_order)
        `)
        .eq('id', id)
        .single();

      if (postError) {
        console.error('Error loading post:', postError);
        return;
      }

      // Fetch the user's profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', postData.user_id)
        .single();

      setPost({
        ...postData,
        profiles: profile || null,
      });

      // Get likes count
      const { count: likes } = await supabase
        .from('likes')
        .select('id', { count: 'exact' })
        .eq('post_id', id);
      
      setLikesCount(likes || 0);

      // Check if user has liked
      if (user) {
        const hasLiked = await hasUserLikedPost(user.id, id);
        setIsLiked(hasLiked);
      }

      // Load comments
      const postComments = await getComments(id);
      setComments(postComments);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleLike = async () => {
    if (!user || !id) {
      router.push('/auth');
      return;
    }

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => prev + (isLiked ? -1 : 1));

    if (isLiked) {
      await unlikePost(user.id, id);
    } else {
      await likePost(user.id, id);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !id || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(user.id, id, newComment.trim());
      if (comment) {
        setComments(prev => [...prev, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostOptions = () => {
    if (!isOwnPost) return;

    Alert.alert(
      'Post Options',
      'What would you like to do?',
      [
        {
          text: 'Edit Post',
          onPress: () => router.push(`/edit-post/${id}`),
        },
        {
          text: 'Delete Post',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeletePost,
        },
      ]
    );
  };

  const handleDeletePost = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const success = await deletePost(id);
      if (success) {
        Alert.alert('Deleted', 'Your post has been deleted.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const commentProfile = item.profiles;
    
    return (
      <View style={styles.commentItem}>
        {commentProfile?.avatar_url ? (
          <Image source={{ uri: commentProfile.avatar_url }} style={styles.commentAvatar} />
        ) : (
          <View style={styles.commentAvatarPlaceholder}>
            <Text style={styles.commentAvatarInitial}>
              {commentProfile?.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>
              @{commentProfile?.username || 'anonymous'}
            </Text>
            <Text style={styles.commentTime}>{formatTimeAgo(item.created_at)}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  // Derived values (computed before useMemo so they're always calculated)
  const profile = post?.profiles;
  const images = post?.post_images?.sort((a, b) => a.display_order - b.display_order) || [];

  // Memoize the header component to prevent re-renders when typing
  // This must be called unconditionally (before any early returns)
  const ListHeader = useMemo(() => {
    if (!post) return null;
    
    return (
      <View>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => router.push(`/user/${post.user_id}`)}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {profile?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.username}>
                @{profile?.username || 'anonymous'}
              </Text>
              {post.location_name && (
                <Text style={styles.location}>📍 {post.location_name}</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
        </View>

        {/* Images */}
        {images.length > 0 && (
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(img) => img.id}
            renderItem={({ item: img }) => (
              <Image source={{ uri: img.image_url }} style={styles.postImage} />
            )}
            scrollEnabled={images.length > 1}
          />
        )}

        {/* Caption */}
        {post.caption && (
          <Text style={styles.caption}>{post.caption}</Text>
        )}

        {/* Conditions */}
        {post.conditions && (
          <View style={styles.conditionsContainer}>
            <Text style={styles.conditionsText}>
              🌤️ {post.conditions.weather || 'Unknown'} • {post.conditions.temperature || ''}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={26} 
              color={isLiked ? '#ff4444' : '#ccc'} 
            />
            <Text style={styles.actionCount}>{likesCount}</Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#ccc" />
            <Text style={styles.actionCount}>{comments.length}</Text>
          </View>
        </View>

        {/* Comments Header */}
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
        </View>

        {comments.length === 0 && (
          <Text style={styles.noComments}>No comments yet. Be the first!</Text>
        )}
      </View>
    );
  }, [post, profile, images, isLiked, likesCount, comments.length, handleLike]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {isOwnPost ? (
          <TouchableOpacity onPress={handlePostOptions} style={styles.menuButton} disabled={isDeleting}>
            {isDeleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      {/* Comment Input */}
      {user ? (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#666"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#25292e" />
            ) : (
              <Ionicons name="send" size={20} color="#25292e" />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.signInPrompt}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.signInText}>Sign in to comment</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
  },
  backLink: {
    color: '#ffd33d',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffd33d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#25292e',
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  location: {
    color: '#999',
    fontSize: 13,
    marginTop: 2,
  },
  timeAgo: {
    color: '#666',
    fontSize: 13,
  },
  postImage: {
    width: 400,
    height: 320,
    resizeMode: 'cover',
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    paddingTop: 12,
  },
  conditionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  conditionsText: {
    color: '#999',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCount: {
    color: '#ccc',
    fontSize: 16,
  },
  commentsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  commentsTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: '600',
  },
  noComments: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffd33d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#25292e',
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  commentTime: {
    color: '#666',
    fontSize: 11,
  },
  commentText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#25292e',
    gap: 12,
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#ffd33d',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  signInPrompt: {
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#444',
    alignItems: 'center',
  },
  signInText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: '600',
  },
});
