import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FollowersModal from '../../components/FollowersModal';
import { useAuth } from '../../lib/AuthContext';
import {
    followUser,
    getFollowCounts,
    getUserPosts,
    isFollowing,
    Post,
    unfollowUser,
} from '../../lib/postService';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  fishing_experience: string | null;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activePostTab, setActivePostTab] = useState<'photos' | 'thoughts'>('photos');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');

  // Filter posts into photos (with images) and thoughts (without images)
  const photoPosts = posts.filter(post => post.post_images && post.post_images.length > 0);
  const thoughtPosts = posts.filter(post => !post.post_images || post.post_images.length === 0);

  const isOwnProfile = user?.id === id;

  const loadUserData = useCallback(async () => {
    if (!id) return;

    try {
      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setUserProfile(profile);

      // Fetch posts and follow counts
      const [userPosts, counts] = await Promise.all([
        getUserPosts(id),
        getFollowCounts(id),
      ]);

      setPosts(userPosts);
      setFollowCounts(counts);

      // Check if current user is following this user
      if (user && !isOwnProfile) {
        const following = await isFollowing(user.id, id);
        setIsUserFollowing(following);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, user, isOwnProfile]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleFollowToggle = async () => {
    if (!user || !id || isOwnProfile) return;

    setIsFollowLoading(true);
    try {
      if (isUserFollowing) {
        await unfollowUser(user.id, id);
        setIsUserFollowing(false);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followUser(user.id, id);
        setIsUserFollowing(true);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
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
        <Text style={styles.headerTitle}>@{userProfile.username}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {userProfile.avatar_url ? (
            <Image source={{ uri: userProfile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {userProfile.username[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}

          <Text style={styles.username}>@{userProfile.username}</Text>
          
          {userProfile.bio && (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )}

          {userProfile.location && (
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
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
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
                <Ionicons name="chatbubble-outline" size={18} color="#ffd33d" />
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
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => {
              setFollowersModalTab('followers');
              setShowFollowersModal(true);
            }}
          >
            <Text style={styles.statValue}>{followCounts.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => {
              setFollowersModalTab('following');
              setShowFollowersModal(true);
            }}
          >
            <Text style={styles.statValue}>{followCounts.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
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
                  const sortedMedia = post.post_images?.sort((a, b) => a.display_order - b.display_order) || [];
                  const firstMedia = sortedMedia[0];
                  const hasVideo = sortedMedia.some(img => img.is_video);
                  
                  // Determine the best thumbnail to show:
                  // 1. If first media is a video with a thumbnail, use that
                  // 2. If first media is an image, use that
                  // 3. Find any image in the post
                  // 4. Fall back to placeholder
                  let thumbnailUrl: string | null = null;
                  
                  if (firstMedia?.is_video && firstMedia?.thumbnail_url) {
                    // Video with generated thumbnail
                    thumbnailUrl = firstMedia.thumbnail_url;
                  } else if (!firstMedia?.is_video && firstMedia?.image_url) {
                    // First media is an image
                    thumbnailUrl = firstMedia.image_url;
                  } else {
                    // Find any image in the post
                    const anyImage = sortedMedia.find(img => !img.is_video);
                    thumbnailUrl = anyImage?.image_url || null;
                  }
                  
                  return (
                    <TouchableOpacity 
                      key={post.id}
                      style={styles.postThumbnail}
                      onPress={() => router.push(`/post/${post.id}`)}
                    >
                      {thumbnailUrl ? (
                        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailImage} />
                      ) : (
                        // No thumbnail available, show placeholder
                        <View style={styles.videoThumbnailPlaceholder}>
                          <Ionicons name="play-circle" size={40} color="#ffd33d" />
                        </View>
                      )}
                      {hasVideo && (
                        <View style={styles.videoIndicator}>
                          <Ionicons name="videocam" size={16} color="#fff" />
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

      {/* Followers/Following Modal */}
      {id && (
        <FollowersModal
          visible={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={id}
          initialTab={followersModalTab}
          followerCount={followCounts.followers}
          followingCount={followCounts.following}
        />
      )}
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
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffd33d',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 120,
    gap: 8,
  },
  messageButtonText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1d21',
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
