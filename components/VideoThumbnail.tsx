import { Ionicons } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface VideoThumbnailProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  style?: ViewStyle;
  showPlayIcon?: boolean;
}

// Cache for generated thumbnails to avoid regenerating
const thumbnailCache: { [key: string]: string } = {};

export default function VideoThumbnail({ 
  videoUrl, 
  thumbnailUrl, 
  style,
  showPlayIcon = true,
}: VideoThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(thumbnailUrl || thumbnailCache[videoUrl] || null);
  const [loading, setLoading] = useState(!thumbnail);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have a thumbnail, don't generate
    if (thumbnailUrl) {
      setThumbnail(thumbnailUrl);
      setLoading(false);
      return;
    }

    // Check cache first
    if (thumbnailCache[videoUrl]) {
      setThumbnail(thumbnailCache[videoUrl]);
      setLoading(false);
      return;
    }

    // Generate thumbnail from video
    generateThumbnail();
  }, [videoUrl, thumbnailUrl]);

  const generateThumbnail = async () => {
    if (!videoUrl) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
        time: 500, // Get frame at 0.5 seconds
        quality: 0.7,
      });
      
      // Cache the result
      thumbnailCache[videoUrl] = uri;
      setThumbnail(uri);
    } catch (e) {
      console.error('Failed to generate video thumbnail:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholder}>
          <ActivityIndicator size="small" color="#ffd33d" />
        </View>
      </View>
    );
  }

  // Error or no thumbnail state
  if (error || !thumbnail) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholder}>
          <Ionicons name="videocam" size={24} color="#666" />
        </View>
        {showPlayIcon && (
          <View style={styles.playBadge}>
            <Ionicons name="play" size={12} color="#fff" />
          </View>
        )}
      </View>
    );
  }

  // Success - show thumbnail
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={{ uri: thumbnail }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      {showPlayIcon && (
        <View style={styles.playBadge}>
          <Ionicons name="play" size={12} color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1d21',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
