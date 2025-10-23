import { Image } from 'expo-image';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getFlyImage, hasFlyImage } from '../lib/flyImages';
import { FlySuggestion } from '../lib/types';

interface FlySuggestionCardProps {
  suggestion: FlySuggestion;
  onPress: (suggestion: FlySuggestion) => void;
}

export default function FlySuggestionCard({ suggestion, onPress }: FlySuggestionCardProps) {
  const handlePress = () => {
    console.log('🎣 FlySuggestionCard pressed for:', suggestion?.fly?.name || 'undefined');
    console.log('🎣 Full suggestion object:', suggestion);
    
    if (!suggestion) {
      console.error('❌ FlySuggestionCard: suggestion is null/undefined');
      return;
    }
    
    if (!suggestion.fly) {
      console.error('❌ FlySuggestionCard: suggestion.fly is null/undefined');
      return;
    }
    
    console.log('🎣 Fly object validation:', {
      hasFly: !!suggestion.fly,
      hasName: !!suggestion.fly.name,
      hasType: !!suggestion.fly.type,
      hasSize: !!suggestion.fly.primary_size,
      hasColor: !!suggestion.fly.color,
      confidence: suggestion.confidence,
      hasReason: !!suggestion.reason
    });
    
    console.log('✅ Calling onPress with valid suggestion...');
    try {
      onPress(suggestion);
      console.log('✅ onPress call completed successfully');
    } catch (error) {
      console.error('❌ Error in onPress call:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Fly Image */}
        <View style={styles.imageContainer}>
          {hasFlyImage(suggestion.fly.name) ? (
            <Image 
              source={getFlyImage(suggestion.fly.name)} 
              style={styles.flyImage}
              contentFit="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎣</Text>
            </View>
          )}
        </View>

        {/* Fly Information */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.flyName} numberOfLines={2}>
              {suggestion.fly.name}
            </Text>
            <View style={[styles.confidenceBadge, { 
              backgroundColor: suggestion.confidence >= 80 ? '#4CAF50' : 
                              suggestion.confidence >= 60 ? '#FF9800' : '#F44336' 
            }]}>
              <Text style={styles.confidenceText}>
                {Math.round(suggestion.confidence)}%
              </Text>
            </View>
          </View>

          <Text style={styles.flyType}>
            {suggestion.fly.type?.toUpperCase() || 'UNKNOWN'} • Size {suggestion.fly.primary_size || 'Unknown'}
          </Text>
          
          <Text style={styles.flyColor}>
            {suggestion.fly.color || 'Unknown'}
          </Text>

          <Text style={styles.reasonText} numberOfLines={2}>
            💡 {suggestion.reason || 'No reason provided'}
          </Text>

                 <View style={styles.statsRow}>
                   <Text style={styles.statText}>
                     Success: {suggestion.fly.success_rate ? Math.round(suggestion.fly.success_rate * 100) : 0}%
                   </Text>
                   <Text style={styles.statText}>
                     Uses: {suggestion.fly.total_uses || 0}
                   </Text>
                 </View>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#404040',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#404040',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  flyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  flyType: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '500',
    marginBottom: 2,
  },
  flyColor: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: '#aaaaaa',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 10,
    color: '#888888',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: 'bold',
  },
});
