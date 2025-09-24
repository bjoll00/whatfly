import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/AuthContext';

export default function SettingsScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  console.log('SettingsScreen: Rendering with user:', user?.email);

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
              // Stay in the app, just sign out
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    console.log('SettingsScreen: Delete account button pressed');
    setShowDeleteModal(true);
  };

  const handleFirstConfirm = () => {
    console.log('SettingsScreen: First confirmation - showing second modal');
    setShowDeleteModal(false);
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    console.log('SettingsScreen: Final confirmation - proceeding with deletion');
    if (deleteConfirmation.toUpperCase() === 'DELETE') {
      setShowConfirmModal(false);
      performAccountDeletion();
    } else {
      Alert.alert('Invalid Confirmation', 'Please type "DELETE" exactly as shown to confirm account deletion.');
    }
  };

  const performAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      const { error } = await deleteAccount();
      
      if (error) {
        console.error('Account deletion error:', error);
        Alert.alert(
          'Deletion Failed',
          `Failed to delete account: ${error.message}`,
          [
            {
              text: 'Contact Support',
              onPress: () => {
                // Open email to support
                const email = 'whatflyfishing@gmail.com';
                const subject = 'Account Deletion Help';
                const body = `Hi WhatFly Team,\n\nI need help deleting my account. Error: ${error.message}\n\nMy email: ${user?.email}`;
                console.log(`Email support: ${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert(
          'Account Deleted',
          'Your account has been permanently deleted. Thank you for using WhatFly.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Unexpected deletion error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please contact support.',
        [
          {
            text: 'Contact Support',
            onPress: () => {
              const email = 'whatflyfishing@gmail.com';
              const subject = 'Account Deletion Help';
              const body = `Hi WhatFly Team,\n\nI need help deleting my account. Unexpected error occurred.\n\nMy email: ${user?.email}`;
              console.log(`Email support: ${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
            }
          },
          { text: 'OK' }
        ]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.message}>Sign in to access your account settings and manage your data.</Text>
            
            <View style={styles.guestInfo}>
              <Text style={styles.guestInfoTitle}>🔒 Guest Mode</Text>
              <Text style={styles.guestInfoText}>
                You're currently using the app as a guest. Sign in to:
              </Text>
              <Text style={styles.guestInfoList}>
                • Save your fishing logs{'\n'}
                • View your catch history{'\n'}
                • Manage your account settings{'\n'}
                • Delete your account data
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Account Settings</Text>
          
          <View style={styles.userInfo}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSignOut}
              disabled={isDeleting}
            >
              <Ionicons name="log-out-outline" size={24} color="#ffd33d" />
              <Text style={styles.actionButtonText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => {
                console.log('SettingsScreen: TouchableOpacity pressed');
                handleDeleteAccount();
              }}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isDeleting ? "hourglass-outline" : "trash-outline"} 
                size={24} 
                color="#ff4444" 
              />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.warning}>
            <Text style={styles.warningTitle}>⚠️ Important Notice</Text>
            <Text style={styles.warningText}>
              Account deletion is permanent and cannot be undone. This will delete:
            </Text>
            <Text style={styles.warningList}>
              • Your user account and profile{'\n'}
              • All fishing logs and catch history{'\n'}
              • Saved preferences and settings{'\n'}
              • Any other personal data
            </Text>
          </View>

          <View style={styles.support}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportText}>
              If you're having trouble or need assistance, please contact our support team.
            </Text>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => {
                const email = 'whatflyfishing@gmail.com';
                const subject = 'WhatFly Support';
                const body = 'Hi WhatFly Team,\n\nI need help with my account.';
                console.log(`Email support: ${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
              }}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
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
              Are you sure you want to permanently delete your account? This action cannot be undone and will delete all your data including fishing logs and preferences.
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
              This is your final warning. Your account and all associated data will be permanently deleted. This cannot be undone.
            </Text>
            
            <Text style={styles.confirmationLabel}>
              Type "DELETE" to confirm:
            </Text>
            
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
                  deleteConfirmation.toUpperCase() !== 'DELETE' && styles.disabledButton
                ]}
                onPress={handleFinalConfirm}
                disabled={deleteConfirmation.toUpperCase() !== 'DELETE'}
              >
                <Text style={[
                  styles.dangerModalButtonText,
                  deleteConfirmation.toUpperCase() !== 'DELETE' && styles.disabledButtonText
                ]}>
                  I Understand, Delete My Account
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 30,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffd33d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: '#2d1b1b',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  dangerText: {
    color: '#ff4444',
  },
  warning: {
    backgroundColor: '#2d1b1b',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  warningTitle: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  warningText: {
    color: '#ffcccc',
    fontSize: 14,
    marginBottom: 10,
  },
  warningList: {
    color: '#ffcccc',
    fontSize: 14,
    lineHeight: 20,
  },
  support: {
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  supportTitle: {
    color: '#ffd33d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  supportText: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  supportButtonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestInfo: {
    backgroundColor: '#1a1d21',
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  guestInfoTitle: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  guestInfoText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  guestInfoList: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
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
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationInput: {
    backgroundColor: '#1a1d21',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerModalButton: {
    backgroundColor: '#ff4444',
  },
  dangerModalButtonText: {
    color: '#ffffff',
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
