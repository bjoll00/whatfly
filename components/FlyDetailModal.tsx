import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getFlyImage, hasFlyImage } from '../lib/flyImages';
import { FlySuggestion } from '../lib/types';

interface FlyDetailModalProps {
  suggestion: FlySuggestion | null;
  visible: boolean;
  onClose: () => void;
}

export default function FlyDetailModal({ suggestion, visible, onClose }: FlyDetailModalProps) {
  console.log('FlyDetailModal rendered with props:', { 
    suggestion: suggestion ? suggestion.fly?.name : 'null', 
    visible,
    hasOnClose: !!onClose
  });
  
  if (!suggestion) {
    console.warn('⚠️ No fly suggestion provided to FlyDetailModal');
    return null;
  }

  if (!suggestion.fly) {
    console.error('❌ FlyDetailModal: suggestion.fly is missing!', suggestion);
    return null;
  }

  if (!suggestion.fly.name) {
    console.error('❌ FlyDetailModal: suggestion.fly.name is missing!', suggestion.fly);
    return null;
  }

  console.log('FlyDetailModal rendering with suggestion:', suggestion.fly.name);
  console.log('Fly properties check:', {
    id: suggestion.fly.id,
    name: suggestion.fly.name,
    type: suggestion.fly.type,
    size: suggestion.fly.primary_size,
    color: suggestion.fly.color,
    success_rate: suggestion.fly.success_rate,
    total_uses: suggestion.fly.total_uses,
    successful_uses: suggestion.fly.successful_uses,
    hasDescription: !!suggestion.fly.description,
    hasLink: !!suggestion.fly.link
  });

  const handleFlyLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  };

  // Don't render modal if no suggestion or not visible
  if (!suggestion || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={false}
      hardwareAccelerated={true}
      statusBarTranslucent={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fly Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Fly Image Section */}
          <View style={styles.imageSection}>
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
                  <Text style={styles.noImageText}>No Image Available</Text>
                </View>
              )}
            </View>
            
            <View style={styles.confidenceContainer}>
              <View style={[styles.confidenceBadge, { 
                backgroundColor: suggestion.confidence >= 80 ? '#4CAF50' : 
                                suggestion.confidence >= 60 ? '#FF9800' : '#F44336' 
              }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(suggestion.confidence)}% Match
                </Text>
              </View>
            </View>
          </View>

          {/* Fly Information */}
          <View style={styles.infoSection}>
            <Text style={styles.flyName}>{suggestion.fly.name}</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{suggestion.fly.type || 'Unknown'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Size</Text>
                <Text style={styles.detailValue}>{suggestion.fly.primary_size || 'Unknown'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{suggestion.fly.color || 'Unknown'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Success Rate</Text>
                <Text style={styles.detailValue}>
                  {suggestion.fly.success_rate ? Math.round(suggestion.fly.success_rate * 100) : 0}%
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Uses</Text>
                <Text style={styles.detailValue}>{suggestion.fly.total_uses || 0}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Successful Uses</Text>
                <Text style={styles.detailValue}>{suggestion.fly.successful_uses || 0}</Text>
              </View>
            </View>

            {/* Description */}
            {suggestion.fly.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {suggestion.fly.description}
                </Text>
              </View>
            )}

            {/* Why This Fly */}
            <View style={styles.reasonSection}>
              <Text style={styles.sectionTitle}>Why This Fly?</Text>
              <Text style={styles.reasonText}>
                {suggestion.reason}
              </Text>
            </View>

            {/* Usage Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>Usage Tips</Text>
              <Text style={styles.tipsText}>
                • Best used during {suggestion.fly.best_conditions?.time_of_day?.join(', ') || 'various times'}
              </Text>
              <Text style={styles.tipsText}>
                • Ideal water conditions: {suggestion.fly.best_conditions?.water_clarity?.join(', ') || 'clear water'}
              </Text>
              <Text style={styles.tipsText}>
                • Recommended technique: Natural drift presentation
              </Text>
            </View>

            {/* Purchase Link */}
            {suggestion.fly.link && (
              <View style={styles.purchaseSection}>
                <TouchableOpacity 
                  style={styles.purchaseButton}
                  onPress={() => handleFlyLink(suggestion.fly.link!)}
                >
                  <Text style={styles.purchaseButtonText}>
                    🔗 Learn More & Purchase
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
    backgroundColor: '#2a2a2a',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#2a2a2a',
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 16,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  noImageText: {
    color: '#888888',
    fontSize: 14,
  },
  confidenceContainer: {
    marginTop: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 20,
  },
  flyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailItem: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  reasonSection: {
    marginBottom: 24,
  },
  tipsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffd33d',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  reasonText: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  tipsText: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 8,
    lineHeight: 20,
  },
  purchaseSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  purchaseButton: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  purchaseButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: '600',
  },
});
