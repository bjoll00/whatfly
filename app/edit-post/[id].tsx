import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [images, setImages] = useState<{ id: string; image_url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalCaption, setOriginalCaption] = useState('');
  const [originalLocation, setOriginalLocation] = useState('');
  const [originalIsPublic, setOriginalIsPublic] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    if (!id) return;

    try {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_images (id, image_url, display_order)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading post:', error);
        Alert.alert('Error', 'Failed to load post');
        router.back();
        return;
      }

      // Check if user owns this post
      if (post.user_id !== user?.id) {
        Alert.alert('Error', 'You can only edit your own posts');
        router.back();
        return;
      }

      setCaption(post.caption || '');
      setLocationName(post.location_name || '');
      setIsPublic(post.is_public);
      setImages(post.post_images?.sort((a: any, b: any) => a.display_order - b.display_order) || []);
      
      // Store originals to check for changes
      setOriginalCaption(post.caption || '');
      setOriginalLocation(post.location_name || '');
      setOriginalIsPublic(post.is_public);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      caption !== originalCaption ||
      locationName !== originalLocation ||
      isPublic !== originalIsPublic
    );
  };

  const handleSave = async () => {
    if (!id || !hasChanges()) {
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          caption: caption.trim() || null,
          location_name: locationName.trim() || null,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating post:', error);
        Alert.alert('Error', 'Failed to update post');
        return;
      }

      Alert.alert('Success', 'Your post has been updated!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
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
        <Text style={styles.headerTitle}>Edit Post</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, styles.saveButton]}
          disabled={isSaving || !hasChanges()}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#25292e" />
          ) : (
            <Text style={[
              styles.saveButtonText,
              !hasChanges() && styles.saveButtonTextDisabled
            ]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Images Preview (read-only) */}
        {images.length > 0 && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionNote}>Photos cannot be edited after posting</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((img) => (
                <Image key={img.id} source={{ uri: img.image_url }} style={styles.image} />
              ))}
            </ScrollView>
          </View>
        )}

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
        </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButton: {
    backgroundColor: '#ffd33d',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    opacity: 0.5,
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
    marginBottom: 8,
  },
  sectionNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
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
});
