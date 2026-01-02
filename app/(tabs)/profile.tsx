import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FollowersModal from '../../components/FollowersModal';
import { useAuth } from '../../lib/AuthContext';
import { Catch, getCatchStats, getUserCatches } from '../../lib/catchService';
import { getFollowCounts, getUserPosts, Post } from '../../lib/postService';

export default function ProfileScreen() {
  const { user, profile, needsUsername } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [catchStats, setCatchStats] = useState<{
    totalCatches: number;
    speciesCount: number;
    topSpecies: string | null;
    largestCatch: { species: string; length: number; weight: number } | null;
  }>({ totalCatches: 0, speciesCount: 0, topSpecies: null, largestCatch: null });
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [activePostTab, setActivePostTab] = useState<'photos' | 'thoughts' | 'catches'>('photos');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');

  // Filter posts into photos (with images) and thoughts (without images)
  const photoPosts = posts.filter(post => post.post_images && post.post_images.length > 0);
  const thoughtPosts = posts.filter(post => !post.post_images || post.post_images.length === 0);

  // Load posts when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user && profile) {
        loadUserData();
      }
    }, [user, profile])
  );

  const loadUserData = async () => {
    if (!user) return;
    setIsLoadingPosts(true);
    try {
      const [userPosts, counts, userCatches, stats] = await Promise.all([
        getUserPosts(user.id),
        getFollowCounts(user.id),
        getUserCatches(user.id),
        getCatchStats(user.id),
      ]);
      setPosts(userPosts);
      setFollowCounts(counts);
      setCatches(userCatches);
      setCatchStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const openFollowersModal = (tab: 'followers' | 'following') => {
    setFollowersModalTab(tab);
    setShowFollowersModal(true);
  };

  const openSupportEmail = (issue?: string) => {
    const email = 'whatflyfishing@gmail.com';
    const subject = encodeURIComponent('WhatFly Support');
    const body = encodeURIComponent(
      `Hi WhatFly Team,\n\nI need help with my account.${issue ? `\n\nIssue: ${issue}` : ''}\n\nMy email: ${user?.email || 'N/A'}`
    );
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const handleSignIn = () => {
    if (needsUsername) {
      router.push('/username-setup');
    } else {
      router.push('/auth');
    }
  };

  const handleCreateAccount = () => {
    if (needsUsername) {
      router.push('/username-setup');
    } else {
      router.push('/auth');
    }
  };

  // Non-authenticated user view OR user needs to complete profile
  if (!user || needsUsername) {
    // User is logged in but needs to set up username
    const isLoggedInNoProfile = user && needsUsername;
    
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.guestHeader}>
              <View style={styles.guestAvatarContainer}>
                <Ionicons name="person-outline" size={48} color="#666" />
              </View>
              <Text style={styles.guestTitle}>
                {isLoggedInNoProfile ? 'Complete Your Profile' : 'Welcome to WhatFly'}
              </Text>
              <Text style={styles.guestSubtitle}>
                {isLoggedInNoProfile 
                  ? 'Create a username to finish setting up your account'
                  : 'Sign in to unlock all features'
                }
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>With an account you can:</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="heart" size={20} color="#ffd33d" />
                <Text style={styles.benefitText}>Save your favorite flies</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="fish" size={20} color="#ffd33d" />
                <Text style={styles.benefitText}>Track your catches</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="people" size={20} color="#ffd33d" />
                <Text style={styles.benefitText}>Connect with other anglers</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="stats-chart" size={20} color="#ffd33d" />
                <Text style={styles.benefitText}>View your fishing stats</Text>
              </View>
            </View>

            {/* Auth Buttons */}
            <View style={styles.authButtons}>
              {isLoggedInNoProfile ? (
                <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
                  <Text style={styles.createAccountButtonText}>Set Up Username</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
                    <Text style={styles.createAccountButtonText}>Create Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Guest Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              
              <TouchableOpacity style={styles.settingsItem} onPress={() => openSupportEmail()}>
                <Ionicons name="help-circle-outline" size={24} color="#ffd33d" />
                <Text style={styles.settingsItemText}>Contact Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => Linking.openURL('https://whatfly.app/privacy')}
              >
                <Ionicons name="shield-outline" size={24} color="#ffd33d" />
                <Text style={styles.settingsItemText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => Linking.openURL('https://whatfly.app/terms')}
              >
                <Ionicons name="document-text-outline" size={24} color="#ffd33d" />
                <Text style={styles.settingsItemText}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Authenticated user view
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Settings Button */}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/edit-profile')}
            >
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.username}>
              @{profile?.username || 'username'}
            </Text>
            
            {profile?.bio && (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="pencil" size={16} color="#ffd33d" />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => openFollowersModal('followers')}>
              <Text style={styles.statValue}>{followCounts.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => openFollowersModal('following')}>
              <Text style={styles.statValue}>{followCounts.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* My Posts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Posts</Text>
              <TouchableOpacity onPress={() => router.push('/create-post')}>
                <Ionicons name="add-circle-outline" size={24} color="#ffd33d" />
              </TouchableOpacity>
            </View>

            {/* Post Type Tabs */}
            <View style={styles.postTabs}>
              <TouchableOpacity
                style={[styles.postTab, activePostTab === 'photos' && styles.postTabActive]}
                onPress={() => setActivePostTab('photos')}
              >
                <Ionicons 
                  name="images-outline" 
                  size={18} 
                  color={activePostTab === 'photos' ? '#ffd33d' : '#666'} 
                />
                <Text style={[styles.postTabText, activePostTab === 'photos' && styles.postTabTextActive]}>
                  {photoPosts.length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.postTab, activePostTab === 'thoughts' && styles.postTabActive]}
                onPress={() => setActivePostTab('thoughts')}
              >
                <Ionicons 
                  name="chatbubble-ellipses-outline" 
                  size={18} 
                  color={activePostTab === 'thoughts' ? '#ffd33d' : '#666'} 
                />
                <Text style={[styles.postTabText, activePostTab === 'thoughts' && styles.postTabTextActive]}>
                  {thoughtPosts.length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.postTab, activePostTab === 'catches' && styles.postTabActive]}
                onPress={() => setActivePostTab('catches')}
              >
                <Ionicons 
                  name="fish-outline" 
                  size={18} 
                  color={activePostTab === 'catches' ? '#ffd33d' : '#666'} 
                />
                <Text style={[styles.postTabText, activePostTab === 'catches' && styles.postTabTextActive]}>
                  {catches.length}
                </Text>
              </TouchableOpacity>
            </View>
            
            {isLoadingPosts ? (
              <ActivityIndicator size="small" color="#ffd33d" style={{ marginVertical: 20 }} />
            ) : activePostTab === 'photos' ? (
              // Photos Grid
              photoPosts.length === 0 ? (
                <View style={styles.emptyPosts}>
                  <Ionicons name="camera-outline" size={48} color="#666" />
                  <Text style={styles.emptyPostsText}>No photos yet</Text>
                  <TouchableOpacity 
                    style={styles.createPostButton}
                    onPress={() => router.push('/create-post')}
                  >
                    <Text style={styles.createPostButtonText}>Share a Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.postsGrid}>
                  {photoPosts.map((post) => {
                    const firstMedia = post.post_images?.sort((a, b) => a.display_order - b.display_order)[0];
                    const hasVideo = post.post_images?.some(img => img.is_video);
                    // Use thumbnail_url for videos, otherwise use image_url
                    const imageUrl = firstMedia?.is_video && firstMedia?.thumbnail_url 
                      ? firstMedia.thumbnail_url 
                      : firstMedia?.image_url;
                    return (
                      <TouchableOpacity 
                        key={post.id}
                        style={styles.postThumbnail}
                        onPress={() => router.push(`/post/${post.id}`)}
                      >
                        {imageUrl ? (
                          <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
                        ) : (
                          <View style={styles.thumbnailPlaceholder}>
                            <Ionicons name="play" size={24} color="#fff" />
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
            ) : activePostTab === 'thoughts' ? (
              // Thoughts List
              thoughtPosts.length === 0 ? (
                <View style={styles.emptyPosts}>
                  <Ionicons name="chatbubble-ellipses-outline" size={48} color="#666" />
                  <Text style={styles.emptyPostsText}>No thoughts yet</Text>
                  <TouchableOpacity 
                    style={styles.createPostButton}
                    onPress={() => router.push('/create-post')}
                  >
                    <Text style={styles.createPostButtonText}>Share a Thought</Text>
                  </TouchableOpacity>
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
                          <Text style={styles.thoughtLocation}>{post.location_name}</Text>
                        )}
                        <Text style={styles.thoughtDate}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )
            ) : (
              // Catches List
              catches.length === 0 ? (
                <View style={styles.emptyPosts}>
                  <Ionicons name="fish-outline" size={48} color="#666" />
                  <Text style={styles.emptyPostsText}>No catches logged yet</Text>
                  <Text style={styles.emptyPostsSubtext}>Start logging your catches to track your fishing progress</Text>
                  <TouchableOpacity 
                    style={styles.createPostButton}
                    onPress={() => router.push('/log-catch')}
                  >
                    <Text style={styles.createPostButtonText}>Log a Catch</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Catch Stats Summary */}
                  {catchStats.totalCatches > 0 && (
                    <View style={styles.catchStatsContainer}>
                      <View style={styles.catchStatItem}>
                        <Text style={styles.catchStatValue}>{catchStats.totalCatches}</Text>
                        <Text style={styles.catchStatLabel}>Total</Text>
                      </View>
                      <View style={styles.catchStatItem}>
                        <Text style={styles.catchStatValue}>{catchStats.speciesCount}</Text>
                        <Text style={styles.catchStatLabel}>Species</Text>
                      </View>
                      {catchStats.topSpecies && (
                        <View style={styles.catchStatItem}>
                          <Text style={styles.catchStatValue} numberOfLines={1}>{catchStats.topSpecies.split(' ')[0]}</Text>
                          <Text style={styles.catchStatLabel}>Top Species</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Log Catch Button */}
                  <TouchableOpacity 
                    style={styles.logCatchButton}
                    onPress={() => router.push('/log-catch')}
                  >
                    <Ionicons name="add-circle" size={20} color="#25292e" />
                    <Text style={styles.logCatchButtonText}>Log New Catch</Text>
                  </TouchableOpacity>

                  {/* Catches List */}
                  <View style={styles.catchesList}>
                    {catches.map((catchItem) => (
                      <View key={catchItem.id} style={styles.catchCard}>
                        <View style={styles.catchCardContent}>
                          {catchItem.photo_url ? (
                            <Image source={{ uri: catchItem.photo_url }} style={styles.catchPhoto} />
                          ) : (
                            <View style={styles.catchPhotoPlaceholder}>
                              <Ionicons name="fish" size={24} color="#666" />
                            </View>
                          )}
                          <View style={styles.catchInfo}>
                            <Text style={styles.catchSpecies}>
                              {catchItem.fish_species || 'Unknown Species'}
                            </Text>
                            <View style={styles.catchDetails}>
                              {catchItem.size_length && (
                                <Text style={styles.catchDetailText}>{catchItem.size_length}" </Text>
                              )}
                              {catchItem.size_weight && (
                                <Text style={styles.catchDetailText}>{catchItem.size_weight} lbs</Text>
                              )}
                            </View>
                            {catchItem.fly_used && (
                              <Text style={styles.catchFly}>{catchItem.fly_used}</Text>
                            )}
                            <View style={styles.catchMeta}>
                              {catchItem.location_name && (
                                <Text style={styles.catchLocation} numberOfLines={1}>
                                  {catchItem.location_name}
                                </Text>
                              )}
                              <Text style={styles.catchDate}>
                                {new Date(catchItem.caught_at).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )
            )}
          </View>

        </View>
      </ScrollView>

      {/* Followers Modal */}
      {user && (
        <FollowersModal
          visible={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={user.id}
          initialTab={followersModalTab}
          followerCount={followCounts.followers}
          followingCount={followCounts.following}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Guest styles
  guestHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  guestAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  benefitsContainer: {
    backgroundColor: '#1a1d21',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#ccc',
    marginLeft: 12,
  },
  authButtons: {
    gap: 12,
    marginBottom: 32,
  },
  createAccountButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createAccountButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25292e',
  },
  signInButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffd33d',
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  // Profile header styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffd33d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#25292e',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#25292e',
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
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editProfileButtonText: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
  },
  // Stats styles
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
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Posts grid styles
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
    marginBottom: 16,
  },
  createPostButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createPostButtonText: {
    color: '#25292e',
    fontWeight: '600',
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
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
  },
  // Settings item styles
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  // Empty posts subtext
  emptyPostsSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 250,
  },
  // Catch stats styles
  catchStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1d21',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  catchStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  catchStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  catchStatLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  // Log catch button
  logCatchButton: {
    flexDirection: 'row',
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  logCatchButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Catches list styles
  catchesList: {
    gap: 12,
  },
  catchCard: {
    backgroundColor: '#1a1d21',
    borderRadius: 12,
    overflow: 'hidden',
  },
  catchCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  catchPhoto: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  catchPhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catchInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  catchSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  catchDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  catchDetailText: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
  },
  catchFly: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 4,
  },
  catchMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catchLocation: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    marginRight: 8,
  },
  catchDate: {
    fontSize: 12,
    color: '#666',
  },
});
