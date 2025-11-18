import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlySuggestion } from '../lib/types';

interface FlySuggestionsModalProps {
  visible: boolean;
  suggestions: FlySuggestion[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onFlySelect?: (fly: FlySuggestion) => void;
}

export default function FlySuggestionsModal({
  visible,
  suggestions,
  isLoading,
  error,
  onClose,
  onFlySelect,
}: FlySuggestionsModalProps) {
  // Debug logging for mobile
  React.useEffect(() => {
    if (visible) {
      console.log('🎣 FlySuggestionsModal: Modal opened', {
        visible,
        suggestionsCount: suggestions?.length || 0,
        isLoading,
        error,
        hasSuggestions: (suggestions?.length || 0) > 0,
      });
    }
  }, [visible, suggestions, isLoading, error]);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#4CAF50'; // Green - High confidence
    if (confidence >= 0.6) return '#FFC107'; // Yellow - Medium-high
    if (confidence >= 0.4) return '#FF9800'; // Orange - Medium
    return '#9E9E9E'; // Gray - Low
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Excellent Match';
    if (confidence >= 0.6) return 'Good Match';
    if (confidence >= 0.4) return 'Fair Match';
    return 'Basic Match';
  };

  const renderSuggestion = (suggestion: FlySuggestion, index: number) => {
    if (!suggestion || !suggestion.fly) {
      console.warn('⚠️ Invalid suggestion at index', index, suggestion);
      return null;
    }

    const { fly, confidence, reason } = suggestion;
    const confidencePercent = Math.round(confidence * 100);
    const confidenceColor = getConfidenceColor(confidence);
    const confidenceLabel = getConfidenceLabel(confidence);

    return (
      <TouchableOpacity
        key={fly.id || `suggestion-${index}`}
        style={styles.suggestionCard}
        onPress={() => onFlySelect?.(suggestion)}
        activeOpacity={0.7}
      >
        {/* Rank Badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankNumber}>#{index + 1}</Text>
        </View>

        {/* Fly Info */}
        <View style={styles.flyInfo}>
          <View style={styles.flyHeader}>
            <Text style={styles.flyName}>{fly.name}</Text>
            <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '20' }]}>
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {confidencePercent}%
              </Text>
            </View>
          </View>

          <View style={styles.flyDetails}>
            <Text style={styles.flyType}>
              {fly.type.charAt(0).toUpperCase() + fly.type.slice(1)} Fly
            </Text>
            <Text style={styles.flySizeColor}>
              Size {fly.primary_size} • {fly.color}
            </Text>
          </View>

          {fly.description && (
            <Text style={styles.flyDescription} numberOfLines={2}>
              {fly.description}
            </Text>
          )}

          {/* Confidence Label */}
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{confidenceLabel}</Text>
          </View>

          {/* Main Reason */}
          {reason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Why this fly:</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          )}

          {/* Matching Factors */}
          {suggestion.matching_factors && suggestion.matching_factors.length > 0 && (
            <View style={styles.factorsContainer}>
              <Text style={styles.factorsLabel}>Matching conditions:</Text>
              <View style={styles.factorsList}>
                {suggestion.matching_factors.slice(0, 3).map((factor, idx) => (
                  <View key={idx} style={styles.factorTag}>
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Success Rate */}
          {fly.total_uses > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                {fly.total_uses} uses • {(fly.success_rate * 100).toFixed(0)}% success
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎣 Fly Suggestions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffd33d" />
                <Text style={styles.loadingText}>
                  Analyzing conditions and finding the best flies...
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorSubtext}>
                  Make sure you've selected a location on the map first.
                </Text>
              </View>
            )}

            {!isLoading && !error && suggestions.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎣</Text>
                <Text style={styles.emptyText}>No suggestions available</Text>
                <Text style={styles.emptySubtext}>
                  This could mean:{'\n'}
                  • The fly database is empty{'\n'}
                  • No flies match the current conditions{'\n'}
                  • There was an issue connecting to the database{'\n\n'}
                  Check the console logs for more details.
                </Text>
              </View>
            )}

            {!isLoading && !error && suggestions && suggestions.length > 0 && (
              <>
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryText}>
                    Found {suggestions.length} fly suggestion{suggestions.length !== 1 ? 's' : ''} based on current conditions
                  </Text>
                </View>

                {suggestions.map((suggestion, index) => {
                  if (!suggestion || !suggestion.fly) {
                    console.warn(`⚠️ Skipping invalid suggestion at index ${index}`);
                    return null;
                  }
                  console.log(`🎣 Rendering suggestion ${index + 1}:`, suggestion.fly.name, 'confidence:', suggestion.confidence);
                  const rendered = renderSuggestion(suggestion, index);
                  if (!rendered) {
                    console.warn(`⚠️ renderSuggestion returned null for index ${index}`);
                  }
                  return rendered;
                })}
              </>
            )}

            {/* Debug info - remove in production */}
            {__DEV__ && (
              <View style={{ padding: 10, backgroundColor: '#1a1a1a', marginTop: 10 }}>
                <Text style={{ color: '#fff', fontSize: 10 }}>
                  DEBUG: visible={String(visible)}, loading={String(isLoading)}, error={error || 'none'}, suggestions={suggestions?.length || 0}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#25292e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%', // Ensure minimum height on mobile
    borderWidth: 1,
    borderColor: '#ffd33d',
    width: '100%', // Ensure full width on mobile
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%', // Ensure full width
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1, // Allow content to grow
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#555',
    position: 'relative',
    width: '100%', // Ensure full width on mobile
    minHeight: 100, // Ensure minimum height for visibility
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    color: '#25292e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  flyInfo: {
    flex: 1,
  },
  flyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 30, // Space for rank badge
  },
  flyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  flyDetails: {
    marginBottom: 8,
  },
  flyType: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
    marginBottom: 4,
  },
  flySizeColor: {
    fontSize: 13,
    color: '#ccc',
  },
  flyDescription: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 18,
  },
  confidenceRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '600',
  },
  reasonContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: '600',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },
  factorsContainer: {
    marginTop: 8,
  },
  factorsLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  factorTag: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  factorText: {
    fontSize: 11,
    color: '#ccc',
  },
  statsRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  statText: {
    fontSize: 11,
    color: '#999',
  },
});

