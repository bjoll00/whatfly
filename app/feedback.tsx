import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FeedbackForm from '../components/FeedbackForm';
import { useAuth } from '../lib/AuthContext';
import { feedbackService } from '../lib/supabase';
import { Feedback } from '../lib/types';

export default function FeedbackScreen() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadFeedback = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userFeedback = await feedbackService.getFeedback(user.id);
      setFeedback(userFeedback);
    } catch (error) {
      console.error('Error loading feedback:', error);
      Alert.alert('Error', 'Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedback();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFeedback();
  }, [user]);

  const handleFeedbackSubmitted = async (newFeedback: Feedback) => {
    setFeedback(prev => [newFeedback, ...prev]);
    setShowForm(false);
    Alert.alert('Success', 'Thank you for your feedback! We appreciate your input.');
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'pending': return '#ffd33d';
      case 'in_review': return '#007AFF';
      case 'in_progress': return '#FF9500';
      case 'completed': return '#34C759';
      case 'rejected': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: Feedback['status']) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'in_review': return 'eye-outline';
      case 'in_progress': return 'construct-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getTypeIcon = (type: Feedback['type']) => {
    switch (type) {
      case 'bug_report': return 'bug-outline';
      case 'feature_request': return 'add-circle-outline';
      case 'general_feedback': return 'chatbubble-outline';
      case 'improvement_suggestion': return 'bulb-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ffd33d" />
          <Text style={styles.loadingText}>Loading feedback...</Text>
        </View>
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
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentHeader}>
          <Text style={styles.subtitle}>
            Help us improve WhatFly by sharing your thoughts and ideas
          </Text>
          
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => {
              Linking.openURL('mailto:whatflyfishing@gmail.com?subject=WhatFly Feedback&body=Hi WhatFly Team,');
            }}
          >
            <Ionicons name="mail" size={16} color="#ffd33d" />
            <Text style={styles.emailButtonText}>Email us directly at whatflyfishing@gmail.com</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Submit Feedback</Text>
        </TouchableOpacity>

        {feedback.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No feedback yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share your thoughts and help us improve the app!
            </Text>
          </View>
        ) : (
          <View style={styles.feedbackList}>
            {feedback.map((item) => (
              <View key={item.id} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.feedbackType}>
                    <Ionicons
                      name={getTypeIcon(item.type)}
                      size={20}
                      color="#ffd33d"
                    />
                    <Text style={styles.feedbackTypeText}>
                      {item.type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.feedbackStatus}>
                    <Ionicons
                      name={getStatusIcon(item.status)}
                      size={16}
                      color={getStatusColor(item.status)}
                    />
                    <Text
                      style={[
                        styles.feedbackStatusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.feedbackTitle}>{item.title}</Text>
                <Text style={styles.feedbackDescription} numberOfLines={3}>
                  {item.description}
                </Text>

                <View style={styles.feedbackFooter}>
                  <Text style={styles.feedbackDate}>
                    {formatDate(item.created_at)}
                  </Text>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>
                      {item.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {showForm && (
        <FeedbackForm
          onSubmit={handleFeedbackSubmitted}
          onCancel={() => setShowForm(false)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffd33d',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  feedbackList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  feedbackCard: {
    backgroundColor: '#1a1d21',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackTypeText: {
    color: '#ffd33d',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  feedbackStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  priorityBadge: {
    backgroundColor: '#3a3a3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1d21',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginTop: 16,
  },
  emailButtonText: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
