import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../lib/AuthContext';
import { getFollowCounts, getUserPosts, Post } from '../../lib/postService';

export default function ProfileScreen() {
  const { user, profile, needsUsername, signOut, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });

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
      const [userPosts, counts] = await Promise.all([
        getUserPosts(user.id),
        getFollowCounts(user.id),
      ]);
      setPosts(userPosts);
      setFollowCounts(counts);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleFirstConfirm = () => {
    setShowDeleteModal(false);
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    if (deleteConfirmation.toUpperCase() === 'DELETE') {
      setShowConfirmModal(false);
      performAccountDeletion();
    } else {
      Alert.alert(
        'Invalid Confirmation',
        'Please type "DELETE" exactly as shown to confirm account deletion.'
      );
    }
  };

  const performAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      const { error } = await deleteAccount();

      if (error) {
        Alert.alert('Deletion Failed', `Failed to delete account: ${error.message}`, [
          {
            text: 'Contact Support',
            onPress: () => openSupportEmail(`Account deletion error: ${error.message}`),
          },
          { text: 'OK' },
        ]);
      } else {
        Alert.alert(
          'Account Deleted',
          'Your account has been permanently deleted. Thank you for using WhatFly.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please contact support.', [
        {
          text: 'Contact Support',
          onPress: () => openSupportEmail('Unexpected account deletion error'),
        },
        { text: 'OK' },
      ]);
    } finally {
      setIsDeleting(false);
    }
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

          {/* My Posts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Posts</Text>
              <TouchableOpacity onPress={() => router.push('/create-post')}>
                <Ionicons name="add-circle-outline" size={24} color="#ffd33d" />
              </TouchableOpacity>
            </View>
            
            {isLoadingPosts ? (
              <ActivityIndicator size="small" color="#ffd33d" style={{ marginVertical: 20 }} />
            ) : posts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <Ionicons name="camera-outline" size={48} color="#666" />
                <Text style={styles.emptyPostsText}>No posts yet</Text>
                <TouchableOpacity 
                  style={styles.createPostButton}
                  onPress={() => router.push('/create-post')}
                >
                  <Text style={styles.createPostButtonText}>Create Your First Post</Text>
                </TouchableOpacity>
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

          {/* Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            {profile?.location && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{profile.location}</Text>
              </View>
            )}
            {profile?.fishing_experience && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>
                  {profile.fishing_experience.charAt(0).toUpperCase() + 
                   profile.fishing_experience.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Settings Section */}
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

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={handleSignOut}
              disabled={isDeleting}
            >
              <Ionicons name="log-out-outline" size={24} color="#ffd33d" />
              <Text style={styles.settingsItemText}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingsItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              <Ionicons
                name={isDeleting ? 'hourglass-outline' : 'trash-outline'}
                size={24}
                color="#ef4444"
              />
              <Text style={[styles.settingsItemText, styles.dangerText]}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🗑️ Delete Account</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to permanently delete your account? This action cannot be
              undone and will delete all your data.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.dangerModalButton]}
                onPress={handleFirstConfirm}
              >
                <Text style={styles.dangerModalButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Final Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Final Confirmation</Text>
            <Text style={styles.modalMessage}>
              This is your final warning. Your account and all associated data will be
              permanently deleted.
            </Text>

            <Text style={styles.confirmationLabel}>Type "DELETE" to confirm:</Text>

            <TextInput
              style={styles.confirmationInput}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="Type DELETE here"
              placeholderTextColor="#666"
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                  setDeleteConfirmation('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.dangerModalButton,
                  deleteConfirmation.toUpperCase() !== 'DELETE' && styles.disabledButton,
                ]}
                onPress={handleFinalConfirm}
                disabled={deleteConfirmation.toUpperCase() !== 'DELETE'}
              >
                <Text
                  style={[
                    styles.dangerModalButtonText,
                    deleteConfirmation.toUpperCase() !== 'DELETE' && styles.disabledButtonText,
                  ]}
                >
                  Delete My Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  dangerItem: {
    backgroundColor: '#2d1b1b',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  dangerText: {
    color: '#ef4444',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#25292e',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationInput: {
    backgroundColor: '#1a1d21',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerModalButton: {
    backgroundColor: '#ef4444',
  },
  dangerModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#999',
  },
});
