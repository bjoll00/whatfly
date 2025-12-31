import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import {
  FollowUser,
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from '../lib/postService';

interface FollowersModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  initialTab: 'followers' | 'following';
  followerCount: number;
  followingCount: number;
}

export default function FollowersModal({
  visible,
  onClose,
  userId,
  initialTab,
  followerCount,
  followingCount,
}: FollowersModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [followersData, followingData] = await Promise.all([
        getFollowers(userId, user?.id),
        getFollowing(userId, user?.id),
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error('Error loading follow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (!user) {
      onClose();
      router.push('/auth');
      return;
    }

    setLoadingUserId(targetUserId);
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(user.id, targetUserId);
      } else {
        await followUser(user.id, targetUserId);
      }

      // Update local state
      const updateList = (list: FollowUser[]) =>
        list.map(u =>
          u.id === targetUserId ? { ...u, isFollowing: !isCurrentlyFollowing } : u
        );

      setFollowers(updateList);
      setFollowing(updateList);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleUserPress = (targetUserId: string) => {
    onClose();
    router.push(`/user/${targetUserId}`);
  };

  const renderUser = ({ item }: { item: FollowUser }) => {
    const isCurrentUser = user?.id === item.id;
    const isLoading = loadingUserId === item.id;

    return (
      <View style={styles.userRow}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => handleUserPress(item.id)}
        >
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.userText}>
            <Text style={styles.username}>@{item.username}</Text>
            {item.display_name && (
              <Text style={styles.displayName}>{item.display_name}</Text>
            )}
          </View>
        </TouchableOpacity>

        {!isCurrentUser && user && (
          <TouchableOpacity
            style={[
              styles.followButton,
              item.isFollowing && styles.followingButton,
            ]}
            onPress={() => handleFollowToggle(item.id, item.isFollowing || false)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={item.isFollowing ? '#ffd33d' : '#25292e'} />
            ) : (
              <Text
                style={[
                  styles.followButtonText,
                  item.isFollowing && styles.followingButtonText,
                ]}
              >
                {item.isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connections</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
            onPress={() => setActiveTab('followers')}
          >
            <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
              Followers
            </Text>
            <Text style={[styles.tabCount, activeTab === 'followers' && styles.activeTabCount]}>
              {followerCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'following' && styles.activeTab]}
            onPress={() => setActiveTab('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
              Following
            </Text>
            <Text style={[styles.tabCount, activeTab === 'following' && styles.activeTabCount]}>
              {followingCount}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffd33d" />
          </View>
        ) : currentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'followers' ? 'people-outline' : 'person-add-outline'}
              size={64}
              color="#666"
            />
            <Text style={styles.emptyText}>
              {activeTab === 'followers'
                ? 'No followers yet'
                : 'Not following anyone yet'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentList}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
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
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#ffd33d',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  tabCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  activeTabCount: {
    color: '#ffd33d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  listContent: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffd33d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#25292e',
  },
  userText: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  displayName: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffd33d',
  },
  followButtonText: {
    color: '#25292e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#ffd33d',
  },
});

