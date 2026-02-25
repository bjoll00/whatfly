import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import VideoThumbnail from '../../components/VideoThumbnail';
import { useUserPosts } from '../../hooks/useFeed';
import { useUserProfile, useFollowCounts, useIsFollowing, useFollowUser } from '../../hooks/useProfile';
import { useAuth } from '../../lib/AuthContext';
import { getAvatarUrl, getThumbnailUrl } from '../../lib/imageOptimization';
import { Post } from '../../lib/postService';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [activePostTab, setActivePostTab] = useState<'photos' | 'thoughts'>('photos');

  const isOwnProfile = user?.id === id;

  // TanStack Query hooks for data fetching with caching
  const { data: userProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useUserProfile(id ?? null);
  const { data: posts = [], isLoading: isLoadingPosts, refetch: refetchPosts, isFetching: isFetchingPosts } = useUserPosts(id ?? null);
  const { data: followCounts = { followers: 0, following: 0 }, refetch: refetchFollowCounts, isFetching: isFetchingFollowCounts } = useFollowCounts(id ?? null);
  const { data: isUserFollowing = false, refetch: refetchIsFollowing } = useIsFollowing(user?.id ?? null, id ?? null);
  const followUserMutation = useFollowUser();

  const isLoading = isLoadingProfile || isLoadingPosts;
  const isFetching = isFetchingPosts || isFetchingFollowCounts;

  // Filter posts into photos (with images) and thoughts (without images)
  const photoPosts = useMemo(() => posts.filter(post => post.post_images && post.post_images.length > 0), [posts]);
  const thoughtPosts = useMemo(() => posts.filter(post => !post.post_images || post.post_images.length === 0), [posts]);

  // Refresh all data
  const handleRefresh = () => {
    refetchProfile();
    refetchPosts();
    refetchFollowCounts();
    refetchIsFollowing();
  };

  const handleFollowToggle = () => {
    if (!user || !id || isOwnProfile) return;

    followUserMutation.mutate({
      currentUserId: user.id,
      targetUserId: id,
      isCurrentlyFollowing: isUserFollowing,
    });
  };

  // Only show loading on first load when we have no cached data
  if (isLoading && !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{userProfile?.username}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor="#ffd33d"
            colors={['#ffd33d']}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {userProfile?.avatar_url ? (
            <ExpoImage 
              source={{ uri: getAvatarUrl(userProfile.avatar_url, 'large') }} 
              style={styles.avatar}
              cachePolicy="disk"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {userProfile?.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}

          <Text style={styles.username}>@{userProfile?.username}</Text>
          
          {userProfile?.bio && (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )}

          {userProfile?.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#999" />
              <Text style={styles.locationText}>{userProfile.location}</Text>
            </View>
          )}

          {/* Follow & Message Buttons (only show if not own profile) */}
          {!isOwnProfile && user && (
            <View style={styles.profileActions}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isUserFollowing && styles.followingButton,
                ]}
                onPress={handleFollowToggle}
                disabled={followUserMutation.isPending}
              >
                {followUserMutation.isPending ? (
                  <ActivityIndicator size="small" color={isUserFollowing ? '#ffd33d' : '#25292e'} />
                ) : (
                  <Text style={[
                    styles.followButtonText,
                    isUserFollowing && styles.followingButtonText,
                  ]}>
                    {isUserFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => router.push(`/conversation/${id}`)}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#ffd33d" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {isOwnProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="pencil" size={16} color="#ffd33d" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{followCounts.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{followCounts.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>

          {/* Post Type Tabs */}
          <View style={styles.postTabs}>
            <TouchableOpacity
              style={[styles.postTab, activePostTab === 'photos' && styles.postTabActive]}
              onPress={() => setActivePostTab('photos')}
            >
              <Ionicons 
                name="images-outline" 
                size={20} 
                color={activePostTab === 'photos' ? '#ffd33d' : '#666'} 
              />
              <Text style={[styles.postTabText, activePostTab === 'photos' && styles.postTabTextActive]}>
                Photos ({photoPosts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postTab, activePostTab === 'thoughts' && styles.postTabActive]}
              onPress={() => setActivePostTab('thoughts')}
            >
              <Ionicons 
                name="chatbubble-ellipses-outline" 
                size={20} 
                color={activePostTab === 'thoughts' ? '#ffd33d' : '#666'} 
              />
              <Text style={[styles.postTabText, activePostTab === 'thoughts' && styles.postTabTextActive]}>
                Thoughts ({thoughtPosts.length})
              </Text>
            </TouchableOpacity>
          </View>
          
          {activePostTab === 'photos' ? (
            // Photos Grid
            photoPosts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <Ionicons name="camera-outline" size={48} color="#666" />
                <Text style={styles.emptyPostsText}>No photos yet</Text>
              </View>
            ) : (
              <View style={styles.postsGrid}>
                {photoPosts.map((post) => {
                  const firstMedia = post.post_images?.sort((a, b) => a.display_order - b.display_order)[0];
                  const isFirstMediaVideo = firstMedia?.is_video;
                  
                  return (
                    <TouchableOpacity 
                      key={post.id}
                      style={styles.postThumbnail}
                      onPress={() => router.push(`/post/${post.id}`)}
                    >
                      {isFirstMediaVideo ? (
                        <VideoThumbnail
                          videoUrl={firstMedia.image_url}
                          thumbnailUrl={firstMedia.thumbnail_url}
                          style={styles.thumbnailImage}
                          showPlayIcon={true}
                        />
                      ) : firstMedia?.image_url ? (
                        <ExpoImage 
                          source={{ uri: getThumbnailUrl(firstMedia.image_url) }} 
                          style={styles.thumbnailImage}
                          cachePolicy="disk"
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.thumbnailPlaceholder}>
                          <Ionicons name="image-outline" size={24} color="#666" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          ) : (
            // Thoughts List
            thoughtPosts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#666" />
                <Text style={styles.emptyPostsText}>No thoughts yet</Text>
              </View>
            ) : (
              <View style={styles.thoughtsList}>
                {thoughtPosts.map((post) => (
                  <TouchableOpacity 
                    key={post.id}
                    style={styles.thoughtCard}
                    onPress={() => router.push(`/post/${post.id}`)}
                  >
                    <Text style={styles.thoughtText} numberOfLines={4}>
                      {post.caption}
                    </Text>
                    <View style={styles.thoughtFooter}>
                      {post.location_name && (
                        <Text style={styles.thoughtLocation}>📍 {post.location_name}</Text>
                      )}
                      <Text style={styles.thoughtDate}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}
        </View>
      </ScrollView>
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
  backButton: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffd33d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#25292e',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    color: '#999',
    fontSize: 14,
  },
  followButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffd33d',
  },
  followButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#ffd33d',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffd33d',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  messageButtonText: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1d21',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#3a3a3a',
  },
  postsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emptyPosts: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1a1d21',
    borderRadius: 12,
  },
  emptyPostsText: {
    color: '#999',
    fontSize: 16,
    marginTop: 12,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  postThumbnail: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 4,
  },
  // Post tabs styles
  postTabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    marginBottom: 16,
    padding: 4,
  },
  postTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  postTabActive: {
    backgroundColor: '#25292e',
  },
  postTabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  postTabTextActive: {
    color: '#ffd33d',
  },
  // Thoughts list styles
  thoughtsList: {
    gap: 12,
  },
  thoughtCard: {
    backgroundColor: '#1a1d21',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ffd33d',
  },
  thoughtText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  thoughtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thoughtLocation: {
    color: '#999',
    fontSize: 12,
  },
  thoughtDate: {
    color: '#666',
    fontSize: 12,
  },
});
