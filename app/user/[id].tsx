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

          {/* Follow Button (only show if not own profile) */}
          {!isOwnProfile && user && (
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

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          
          {posts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <Ionicons name="camera-outline" size={48} color="#666" />
              <Text style={styles.emptyPostsText}>No posts yet</Text>
            </View>
          ) : (
            <View style={styles.postsGrid}>
              {posts.map((post) => {
                const firstImage = post.post_images?.sort((a, b) => a.display_order - b.display_order)[0];
                return (
                  <TouchableOpacity 
                    key={post.id}
                    style={styles.postThumbnail}
                    onPress={() => router.push(`/post/${post.id}`)}
                  >
                    {firstImage ? (
                      <Image source={{ uri: firstImage.image_url }} style={styles.thumbnailImage} />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Ionicons name="document-text-outline" size={24} color="#666" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
});
