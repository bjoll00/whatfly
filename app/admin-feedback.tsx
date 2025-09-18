import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Feedback } from '../lib/types';

export default function AdminFeedbackScreen() {
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Feedback['status']>('pending');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review' | 'in_progress' | 'completed' | 'rejected'>('all');

  const loadAllFeedback = async () => {
    try {
      setLoading(true);
      console.log('Loading all feedback...');
      
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Load feedback result:', { data: data?.length, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      setAllFeedback(data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
      Alert.alert('Error', `Failed to load feedback: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllFeedback();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAllFeedback();
  }, []);

  const handleStatusUpdate = async (feedbackId: string, status: Feedback['status']) => {
    try {
      console.log('Updating feedback status:', { feedbackId, status });
      
      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId)
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Update local state
      setAllFeedback(prev => 
        prev.map(feedback => 
          feedback.id === feedbackId 
            ? { ...feedback, status, updated_at: new Date().toISOString() }
            : feedback
        )
      );
      
      setShowStatusModal(false);
      setSelectedFeedback(null);
      Alert.alert('Success', 'Feedback status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', `Failed to update status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    Alert.alert(
      'Delete Feedback',
      'Are you sure you want to delete this feedback? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting feedback:', feedbackId);
              
              const { error } = await supabase
                .from('feedback')
                .delete()
                .eq('id', feedbackId);

              console.log('Delete result:', { error });

              if (error) {
                console.error('Supabase error:', error);
                throw error;
              }

              setAllFeedback(prev => prev.filter(feedback => feedback.id !== feedbackId));
              Alert.alert('Success', 'Feedback deleted successfully!');
            } catch (error) {
              console.error('Error deleting feedback:', error);
              Alert.alert('Error', `Failed to delete feedback: ${error.message || 'Unknown error'}`);
            }
          }
        }
      ]
    );
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

  const filteredFeedback = allFeedback.filter(feedback => 
    filter === 'all' || feedback.status === filter
  );

  const statusCounts = {
    all: allFeedback.length,
    pending: allFeedback.filter(f => f.status === 'pending').length,
    in_review: allFeedback.filter(f => f.status === 'in_review').length,
    in_progress: allFeedback.filter(f => f.status === 'in_progress').length,
    completed: allFeedback.filter(f => f.status === 'completed').length,
    rejected: allFeedback.filter(f => f.status === 'rejected').length,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.loadingText}>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin - Feedback Management</Text>
          <Text style={styles.subtitle}>
            Manage and resolve user feedback
          </Text>
        </View>

        {/* Status Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filter === status && styles.filterButtonActive
                ]}
                onPress={() => setFilter(status as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === status && styles.filterButtonTextActive
                ]}>
                  {status.replace('_', ' ').toUpperCase()} ({count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Feedback List */}
        <View style={styles.feedbackList}>
          {filteredFeedback.map((feedback) => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackType}>
                  <Ionicons
                    name={getTypeIcon(feedback.type)}
                    size={20}
                    color="#ffd33d"
                  />
                  <Text style={styles.feedbackTypeText}>
                    {feedback.type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.feedbackStatus}>
                  <Ionicons
                    name={getStatusIcon(feedback.status)}
                    size={16}
                    color={getStatusColor(feedback.status)}
                  />
                  <Text
                    style={[
                      styles.feedbackStatusText,
                      { color: getStatusColor(feedback.status) },
                    ]}
                  >
                    {feedback.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.feedbackTitle}>{feedback.title}</Text>
              <Text style={styles.feedbackDescription}>
                {feedback.description}
              </Text>

              <View style={styles.feedbackFooter}>
                <Text style={styles.feedbackDate}>
                  {formatDate(feedback.created_at)}
                </Text>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>
                    {feedback.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.statusButton]}
                  onPress={() => {
                    setSelectedFeedback(feedback);
                    setNewStatus(feedback.status);
                    setShowStatusModal(true);
                  }}
                >
                  <Ionicons name="create-outline" size={16} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Update Status</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteFeedback(feedback.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {filteredFeedback.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No feedback found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'No feedback has been submitted yet.'
                : `No feedback with status "${filter.replace('_', ' ')}" found.`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowStatusModal(false)}
              style={styles.cancelButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Update Status</Text>
            <TouchableOpacity
              onPress={() => handleStatusUpdate(selectedFeedback!.id, newStatus)}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.feedbackTitle}>{selectedFeedback?.title}</Text>
            <Text style={styles.feedbackDescription}>
              {selectedFeedback?.description}
            </Text>

            <Text style={styles.sectionTitle}>Select New Status:</Text>
            {(['pending', 'in_review', 'in_progress', 'completed', 'rejected'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  newStatus === status && styles.statusOptionSelected
                ]}
                onPress={() => setNewStatus(status)}
              >
                <Ionicons
                  name={getStatusIcon(status)}
                  size={20}
                  color={getStatusColor(status)}
                />
                <Text style={[
                  styles.statusOptionText,
                  newStatus === status && styles.statusOptionTextSelected
                ]}>
                  {status.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#ffd33d',
  },
  filterButtonText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#000',
  },
  feedbackList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  feedbackCard: {
    backgroundColor: '#2c2c2e',
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
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusButton: {
    borderColor: '#007AFF',
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  cancelButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusOptionSelected: {
    backgroundColor: '#3a3a3c',
  },
  statusOptionText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  statusOptionTextSelected: {
    color: '#fff',
  },
});
