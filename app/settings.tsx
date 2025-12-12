import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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
import { useAuth } from '../lib/AuthContext';

export default function SettingsScreen() {
  const { user, profile, signOut, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

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
              router.replace('/');
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
          [{ text: 'OK', onPress: () => router.replace('/') }]
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.content}>
          {/* General Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => router.push('/feedback')}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#ffd33d" />
              <Text style={styles.settingsItemText}>Send Feedback</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem} onPress={() => openSupportEmail()}>
              <Ionicons name="help-circle-outline" size={24} color="#ffd33d" />
              <Text style={styles.settingsItemText}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>

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

          {/* Account Info */}
          {user && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Info</Text>
              
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
          )}

          {/* Account Actions */}
          {user && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>

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
          )}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>WhatFly v1.0.0</Text>
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
  scrollContainer: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
  versionContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
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
