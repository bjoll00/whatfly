import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { useFishing } from '../lib/FishingContext';
import { createPost, MediaItem, VideoProgressCallback } from '../lib/postService';

const MAX_MEDIA = 4;

export default function CreatePostScreen() {
  const { user } = useAuth();
  const { fishingConditions } = useFishing();
  
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [includeConditions, setIncludeConditions] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoProgressStage, setVideoProgressStage] = useState<'compressing' | 'uploading'>('compressing');
  const [showVideoProgress, setShowVideoProgress] = useState(false);

  // Check if post contains videos
  const hasVideos = media.some(m => m.isVideo);

  // Video progress callback
  const handleVideoProgress: VideoProgressCallback = (progress, stage) => {
    setVideoProgress(progress);
    setVideoProgressStage(stage);
  };

  // Redirect if not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Ionicons name="person-outline" size={64} color="#666" />
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authSubtitle}>You need an account to create posts</Text>
          <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth')}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pickMedia = async () => {
    if (media.length >= MAX_MEDIA) {
      Alert.alert('Limit Reached', `You can only add up to ${MAX_MEDIA} photos/videos`);
      return;
    }

    Alert.alert(
      'Add Media',
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
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                setMedia([...media, { uri: result.assets[0].uri, isVideo: false }]);
              }
            } else {
              Alert.alert('Permission Denied', 'Camera permission is required');
            }
          },
        },
        {
          text: 'Record Video',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['videos'],
                allowsEditing: true,
                videoMaxDuration: 60, // 60 seconds max
                videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
              });
              if (!result.canceled && result.assets[0]) {
                setMedia([...media, { uri: result.assets[0].uri, isVideo: true }]);
              }
            } else {
              Alert.alert('Permission Denied', 'Camera permission is required');
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsMultipleSelection: true,
                selectionLimit: MAX_MEDIA - media.length,
                quality: 0.8,
                videoMaxDuration: 60,
              });
              if (!result.canceled && result.assets) {
                const newMedia = result.assets.map(asset => {
                  // Check both type and file extension for reliable video detection
                  const ext = asset.uri.split('.').pop()?.toLowerCase() || '';
                  const videoExtensions = ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm'];
                  const isVideo = asset.type === 'video' || videoExtensions.includes(ext);
                  console.log('📹 Asset:', { uri: asset.uri, type: asset.type, ext, isVideo });
                  return {
                    uri: asset.uri,
                    isVideo,
                  };
                });
                setMedia([...media, ...newMedia].slice(0, MAX_MEDIA));
              }
            } else {
              Alert.alert('Permission Denied', 'Photo library permission is required');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (media.length === 0 && !caption.trim()) {
      Alert.alert('Empty Post', 'Please add a photo, video, or caption');
      return;
    }

    setIsSubmitting(true);
    
    // Show progress modal if post contains videos
    if (hasVideos) {
      setVideoProgress(0);
      setVideoProgressStage('compressing');
      setShowVideoProgress(true);
    }

    try {
      const { post, error } = await createPost(
        user.id, 
        {
          caption: caption.trim() || undefined,
          location_name: locationName.trim() || undefined,
          latitude: includeLocation && fishingConditions?.latitude ? fishingConditions.latitude : undefined,
          longitude: includeLocation && fishingConditions?.longitude ? fishingConditions.longitude : undefined,
          conditions: includeConditions && fishingConditions ? {
            weather: fishingConditions.weather_conditions,
            water: fishingConditions.water_conditions,
            temperature: fishingConditions.air_temperature_range,
          } : undefined,
          is_public: isPublic,
          media: media,
        },
        hasVideos ? handleVideoProgress : undefined
      );

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      Alert.alert('Success', 'Your post has been shared!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowVideoProgress(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.headerButton, styles.postButton]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#25292e" />
          ) : (
            <Text style={styles.postButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Media Picker (Photos & Videos) */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Photos & Videos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {media.map((item, index) => (
              <View key={index} style={styles.imageContainer}>
                {item.isVideo ? (
                  <View style={styles.videoContainer}>
                    <Video
                      source={{ uri: item.uri }}
                      style={styles.image}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isMuted={true}
                    />
                    <View style={styles.videoOverlay}>
                      <Ionicons name="videocam" size={24} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.image} />
                )}
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeMedia(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
            {media.length < MAX_MEDIA && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickMedia}>
                <Ionicons name="add-circle-outline" size={32} color="#ffd33d" />
                <Text style={styles.addImageText}>Add Media</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Share your fishing story..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
            value={caption}
            onChangeText={setCaption}
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Provo River, Utah"
            placeholderTextColor="#666"
            value={locationName}
            onChangeText={setLocationName}
          />
          
          {fishingConditions?.latitude && (
            <TouchableOpacity 
              style={styles.toggleRow}
              onPress={() => setIncludeLocation(!includeLocation)}
            >
              <View style={styles.toggleInfo}>
                <Ionicons name="location-outline" size={20} color="#ccc" />
                <Text style={styles.toggleText}>Include exact coordinates</Text>
              </View>
              <Ionicons 
                name={includeLocation ? 'checkbox' : 'square-outline'} 
                size={24} 
                color={includeLocation ? '#ffd33d' : '#666'} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Conditions */}
        {fishingConditions && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.toggleRow}
              onPress={() => setIncludeConditions(!includeConditions)}
            >
              <View style={styles.toggleInfo}>
                <Ionicons name="cloudy-outline" size={20} color="#ccc" />
                <Text style={styles.toggleText}>Include weather & water conditions</Text>
              </View>
              <Ionicons 
                name={includeConditions ? 'checkbox' : 'square-outline'} 
                size={24} 
                color={includeConditions ? '#ffd33d' : '#666'} 
              />
            </TouchableOpacity>
            {includeConditions && (
              <View style={styles.conditionsPreview}>
                <Text style={styles.conditionsText}>
                  {fishingConditions.weather_conditions || 'Weather'} • {fishingConditions.air_temperature_range || 'Temp'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility</Text>
          <TouchableOpacity 
            style={styles.toggleRow}
            onPress={() => setIsPublic(!isPublic)}
          >
            <View style={styles.toggleInfo}>
              <Ionicons 
                name={isPublic ? 'globe-outline' : 'lock-closed-outline'} 
                size={20} 
                color="#ccc" 
              />
              <View>
                <Text style={styles.toggleText}>
                  {isPublic ? 'Public' : 'Private'}
                </Text>
                <Text style={styles.toggleSubtext}>
                  {isPublic ? 'Anyone can see this post' : 'Only you can see this post'}
                </Text>
              </View>
            </View>
            <Ionicons 
              name={isPublic ? 'toggle' : 'toggle-outline'} 
              size={32} 
              color={isPublic ? '#ffd33d' : '#666'} 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Video Processing Progress Modal */}
      <Modal
        visible={showVideoProgress}
        transparent
        animationType="fade"
      >
        <View style={styles.progressModalOverlay}>
          <View style={styles.progressModalContent}>
            <ActivityIndicator size="large" color="#ffd33d" />
            <Text style={styles.progressTitle}>
              {videoProgressStage === 'compressing' 
                ? 'Optimizing video colors...' 
                : 'Uploading to WhatFly...'}
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.round(videoProgress * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressPercent}>
              {Math.round(videoProgress * 100)}%
            </Text>
            <Text style={styles.progressSubtext}>
              {videoProgressStage === 'compressing'
                ? 'Converting HDR to SDR for best quality'
                : 'Almost there...'}
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelText: {
    color: '#ccc',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  postButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd33d',
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#25292e',
    borderRadius: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  captionInput: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
  },
  toggleSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  conditionsPreview: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  conditionsText: {
    color: '#ccc',
    fontSize: 13,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  authButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Video progress modal styles
  progressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressModalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    minWidth: 280,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffd33d',
    borderRadius: 4,
  },
  progressPercent: {
    color: '#ffd33d',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  progressSubtext: {
    color: '#999',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
