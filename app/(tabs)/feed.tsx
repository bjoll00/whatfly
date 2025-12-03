import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../lib/AuthContext';
import { deletePost, getFeedPosts, hasUserLikedPost, likePost, Post, unlikePost } from '../../lib/postService';

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const loadPosts = useCallback(async () => {
    try {
      const feedPosts = await getFeedPosts(20, 0);
      setPosts(feedPosts);

      // Check which posts the user has liked
      if (user) {
        const likedSet = new Set<string>();
        await Promise.all(
          feedPosts.map(async (post) => {
            const hasLiked = await hasUserLikedPost(user.id, post.id);
            if (hasLiked) likedSet.add(post.id);
          })
        );
        setLikedPosts(likedSet);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const isLiked = likedPosts.has(postId);
    
    // Optimistic update
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1),
        };
      }
      return post;
    }));

    // Make API call
    if (isLiked) {
      await unlikePost(user.id, postId);
    } else {
      await likePost(user.id, postId);
    }
  };

  const handlePostOptions = (postId: string) => {
    Alert.alert(
      'Post Options',
      'What would you like to do?',
      [
        {
          text: 'Edit Post',
          onPress: () => router.push(`/edit-post/${postId}`),
        },
        {
          text: 'Delete Post',
          style: 'destructive',
          onPress: () => confirmDeletePost(postId),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const confirmDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeletePost(postId),
        },
      ]
    );
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const success = await deletePost(postId);
      if (success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        Alert.alert('Deleted', 'Your post has been deleted.');
      } else {
        Alert.alert('Error', 'Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post. Please try again.');
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

  const renderPost = ({ item: post }: { item: Post }) => {
    const isLiked = likedPosts.has(post.id);
    const profile = post.profiles;
    const images = post.post_images?.sort((a, b) => a.display_order - b.display_order) || [];
    const isOwnPost = user?.id === post.user_id;

    return (
      <View style={styles.postCard}>
        {/* Header */}
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
          <View style={styles.headerRight}>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
            {isOwnPost && (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => handlePostOptions(post.id)}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
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
            style={styles.imageList}
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
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
          >
            <Ionicons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isLiked ? '#ff4444' : '#ccc'} 
            />
            <Text style={styles.actionCount}>{post.likes_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/post/${post.id}`)}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#ccc" />
            <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="fish-outline" size={80} color="#444" />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share your catch!
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => router.push('/create-post')}
      >
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎣 Feed</Text>
        <TouchableOpacity 
          style={styles.newPostButton}
          onPress={() => router.push('/create-post')}
        >
          <Ionicons name="add" size={28} color="#25292e" />
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(post) => post.id}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#ffd33d"
            colors={['#ffd33d']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  newPostButton: {
    backgroundColor: '#ffd33d',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
  },
  loadingText: {
    color: '#ccc',
    marginTop: 12,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#3a3a3a',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffd33d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25292e',
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  location: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeAgo: {
    color: '#666',
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
  },
  imageList: {
    width: '100%',
  },
  postImage: {
    width: 380,
    height: 300,
    resizeMode: 'cover',
  },
  caption: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    padding: 12,
    paddingTop: 8,
  },
  conditionsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  conditionsText: {
    color: '#999',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#444',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    color: '#ccc',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
