import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { feedbackService } from '../lib/supabase';
import { Feedback } from '../lib/types';

interface FeedbackFormProps {
  onSubmit: (feedback: Feedback) => void;
  onCancel: () => void;
}

export default function FeedbackForm({ onSubmit, onCancel }: FeedbackFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general_feedback' as Feedback['type'],
    title: '',
    description: '',
    priority: 'medium' as Feedback['priority'],
  });

  const feedbackTypes = [
    { value: 'bug_report', label: 'Bug Report', icon: 'bug-outline' },
    { value: 'feature_request', label: 'Feature Request', icon: 'add-circle-outline' },
    { value: 'general_feedback', label: 'General Feedback', icon: 'chatbubble-outline' },
    { value: 'improvement_suggestion', label: 'Improvement Suggestion', icon: 'bulb-outline' },
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: '#34C759' },
    { value: 'medium', label: 'Medium', color: '#FF9500' },
    { value: 'high', label: 'High', color: '#FF3B30' },
  ];

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit feedback.');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your feedback.');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description for your feedback.');
      return;
    }

    try {
      setLoading(true);
      const newFeedback = await feedbackService.createFeedback({
        user_id: user.id,
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        app_version: '1.0.0', // You can get this from app config
        device_info: 'Mobile App', // You can get actual device info
      });

      onSubmit(newFeedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Feedback</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback Type</Text>
            <View style={styles.typeGrid}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    formData.type === type.value && styles.typeButtonSelected,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: type.value as Feedback['type'] }))}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={formData.type === type.value ? '#000' : '#8E8E93'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type.value && styles.typeButtonTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorityLevels.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority.value && styles.priorityButtonSelected,
                    { borderColor: priority.color },
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, priority: priority.value as Feedback['priority'] }))}
                >
                  <View
                    style={[
                      styles.priorityIndicator,
                      { backgroundColor: priority.color },
                      formData.priority === priority.value && styles.priorityIndicatorSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.priorityButtonText,
                      formData.priority === priority.value && styles.priorityButtonTextSelected,
                    ]}
                  >
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of your feedback"
              placeholderTextColor="#8E8E93"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              maxLength={100}
            />
            <Text style={styles.characterCount}>
              {formData.title.length}/100
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please provide detailed information about your feedback..."
              placeholderTextColor="#8E8E93"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {formData.description.length}/1000
            </Text>
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Tips for better feedback:</Text>
            <Text style={styles.tipText}>
              • Be specific about what you'd like to see improved
            </Text>
            <Text style={styles.tipText}>
              • Include steps to reproduce bugs if applicable
            </Text>
            <Text style={styles.tipText}>
              • Mention which features you use most often
            </Text>
            <Text style={styles.tipText}>
              • Share your fishing experience level if relevant
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2c2c2e',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: '#ffd33d',
    borderColor: '#ffd33d',
  },
  typeButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: '#000',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityButtonSelected: {
    backgroundColor: '#3a3a3c',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityIndicatorSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  priorityButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  priorityButtonTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  tipsSection: {
    backgroundColor: '#2c2c2e',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 4,
  },
});
