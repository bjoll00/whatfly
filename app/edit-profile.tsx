import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { canChangeUsername, getUsernameValidationError, isValidUsername } from '../lib/profileService';
import { supabase } from '../lib/supabase';
import { ProfileUpdate } from '../lib/types';

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const;

export default function EditProfileScreen() {
  const { user, profile, updateProfile, checkUsernameAvailable } = useAuth();
  
  // Form state
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [fishingExperience, setFishingExperience] = useState<ProfileUpdate['fishing_experience']>(
    profile?.fishing_experience || undefined
  );
  
  // Avatar state
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  
  // Username change cooldown
  const usernameChangeStatus = profile ? canChangeUsername(profile) : { canChange: true };
  const canEditUsername = usernameChangeStatus.canChange;
  
  // Submit state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Redirect if not authenticated or no profile
  useEffect(() => {
    if (!user) {
      router.replace('/auth');
    } else if (!profile) {
      // User is logged in but has no profile - need to create one first
      router.replace('/username-setup');
    }
  }, [user, profile]);

  // Check for changes
  useEffect(() => {
    const changed =
      username !== (profile?.username || '') ||
      displayName !== (profile?.display_name || '') ||
      bio !== (profile?.bio || '') ||
      location !== (profile?.location || '') ||
      fishingExperience !== (profile?.fishing_experience || undefined) ||
      avatarUri !== (profile?.avatar_url || null);
    setHasChanges(changed);
  }, [username, displayName, bio, location, fishingExperience, avatarUri, profile]);

  // Pick avatar image
  const pickAvatar = async () => {
    try {
      // Show action sheet to choose between camera and gallery
      Alert.alert(
        'Change Profile Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const permission = await ImagePicker.requestCameraPermissionsAsync();
              if (permission.granted) {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                if (!result.canceled && result.assets[0]) {
                  await uploadAvatar(result.assets[0].uri);
                }
              } else {
                Alert.alert('Permission Denied', 'Camera permission is required to take photos');
              }
            },
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (permission.granted) {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                if (!result.canceled && result.assets[0]) {
                  await uploadAvatar(result.assets[0].uri);
                }
              } else {
                Alert.alert('Permission Denied', 'Photo library permission is required');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload avatar to Supabase storage
  const uploadAvatar = async (uri: string) => {
    if (!user) return;
    
    setIsUploadingAvatar(true);
    try {
      // Get the file extension
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const fileName = `${user.id}-${Date.now()}.${ext}`;

      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Convert base64 to ArrayBuffer and upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('Upload Failed', uploadError.message);
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        setAvatarUri(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Username validation with debounce
  useEffect(() => {
    setUsernameAvailable(null);
    setUsernameError(null);

    if (!username) {
      setUsernameError('Username is required');
      return;
    }

    // If username hasn't changed from original, it's valid
    if (username === profile?.username) {
      setUsernameAvailable(true);
      return;
    }

    // If user can't change username (cooldown), show error
    if (!canEditUsername) {
      setUsernameError(`You can change your username again in ${usernameChangeStatus.daysRemaining} day${usernameChangeStatus.daysRemaining === 1 ? '' : 's'}`);
      return;
    }

    // Validate format
    const error = getUsernameValidationError(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    // Check availability with debounce
    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const available = await checkUsernameAvailable(username);
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError('Username is already taken');
        }
      } catch (error) {
        setUsernameError('Error checking availability');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, profile?.username, checkUsernameAvailable, canEditUsername, usernameChangeStatus.daysRemaining]);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

    // Validate username
    if (!isValidUsername(username)) {
      Alert.alert('Invalid Username', getUsernameValidationError(username) || 'Please enter a valid username');
      return;
    }

    if (username !== profile?.username && usernameAvailable === false) {
      Alert.alert('Username Taken', 'Please choose a different username');
      return;
    }

    setIsSaving(true);

    try {
      const updates: ProfileUpdate = {};
      
      if (username !== profile?.username) {
        updates.username = username;
      }
      if (displayName !== (profile?.display_name || '')) {
        updates.display_name = displayName || undefined;
      }
      if (bio !== (profile?.bio || '')) {
        updates.bio = bio || undefined;
      }
      if (location !== (profile?.location || '')) {
        updates.location = location || undefined;
      }
      if (fishingExperience !== profile?.fishing_experience) {
        updates.fishing_experience = fishingExperience;
      }
      if (avatarUri !== (profile?.avatar_url || null)) {
        updates.avatar_url = avatarUri || undefined;
      }

      const { error } = await updateProfile(updates);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile');
        setIsSaving(false);
        return;
      }

      Alert.alert('Success', 'Your profile has been updated', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, username, displayName, bio, location, fishingExperience, avatarUri, profile, usernameAvailable, updateProfile]);

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const canSave = hasChanges && 
    isValidUsername(username) && 
    (username === profile?.username || usernameAvailable === true) && 
    !isCheckingUsername &&
    !isSaving &&
    !isUploadingAvatar;

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.headerButton}
          disabled={!canSave}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffd33d" />
          ) : (
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={pickAvatar}
            disabled={isUploadingAvatar}
          >
            {isUploadingAvatar ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#25292e" />
              </View>
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {username[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.changeAvatarBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickAvatar} disabled={isUploadingAvatar}>
            <Text style={styles.changePhotoText}>
              {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Username */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Username *</Text>
              {!canEditUsername && (
                <View style={styles.cooldownBadge}>
                  <Ionicons name="time-outline" size={12} color="#ffd33d" />
                  <Text style={styles.cooldownText}>
                    {usernameChangeStatus.daysRemaining}d
                  </Text>
                </View>
              )}
            </View>
            <View style={[
              styles.usernameInputContainer,
              !canEditUsername && styles.inputDisabled
            ]}>
              <Text style={[styles.atSymbol, !canEditUsername && styles.textDisabled]}>@</Text>
              <TextInput
                style={[styles.usernameInput, !canEditUsername && styles.textDisabled]}
                value={username}
                onChangeText={canEditUsername ? setUsername : undefined}
                placeholder="username"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                editable={canEditUsername}
              />
              <View style={styles.usernameStatus}>
                {!canEditUsername ? (
                  <Ionicons name="lock-closed" size={18} color="#666" />
                ) : isCheckingUsername ? (
                  <ActivityIndicator size="small" color="#ffd33d" />
                ) : username === profile.username ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                ) : usernameAvailable === true ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                ) : usernameError ? (
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                ) : null}
              </View>
            </View>
            <View style={styles.fieldFooter}>
              <Text style={[styles.charCount, username.length > 20 && styles.charCountError]}>
                {username.length}/20
              </Text>
              {!canEditUsername ? (
                <Text style={styles.cooldownNote}>
                  Can change in {usernameChangeStatus.daysRemaining} day{usernameChangeStatus.daysRemaining === 1 ? '' : 's'}
                </Text>
              ) : usernameError && username !== profile.username ? (
                <Text style={styles.fieldError}>{usernameError}</Text>
              ) : null}
            </View>
          </View>

          {/* Display Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor="#666"
              maxLength={50}
            />
            <Text style={styles.charCount}>{displayName.length}/50</Text>
          </View>

          {/* Bio */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              maxLength={150}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Colorado, USA"
              placeholderTextColor="#666"
              maxLength={100}
            />
          </View>

          {/* Fishing Experience */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Fishing Experience</Text>
            <View style={styles.experienceContainer}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.experienceButton,
                    fishingExperience === level.value && styles.experienceButtonActive,
                  ]}
                  onPress={() => setFishingExperience(
                    fishingExperience === level.value ? undefined : level.value
                  )}
                >
                  <Text
                    style={[
                      styles.experienceButtonText,
                      fishingExperience === level.value && styles.experienceButtonTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
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
  changeAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3a3a3a',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#25292e',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
  },
  form: {
    gap: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 211, 61, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cooldownText: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '600',
  },
  cooldownNote: {
    fontSize: 12,
    color: '#ffd33d',
  },
  inputDisabled: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  textDisabled: {
    color: '#666',
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#555',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    paddingHorizontal: 14,
  },
  atSymbol: {
    fontSize: 16,
    color: '#ffd33d',
    fontWeight: '600',
  },
  usernameInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  usernameStatus: {
    width: 24,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  charCountError: {
    color: '#ef4444',
  },
  fieldError: {
    fontSize: 12,
    color: '#ef4444',
  },
  experienceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  experienceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#555',
  },
  experienceButtonActive: {
    backgroundColor: '#ffd33d',
    borderColor: '#ffd33d',
  },
  experienceButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  experienceButtonTextActive: {
    color: '#25292e',
  },
});
