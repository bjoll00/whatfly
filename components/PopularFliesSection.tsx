import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { flySuggestionService } from '../lib/flySuggestionService';
import { Fly } from '../lib/types';

interface PopularFliesSectionProps {
  onFlySelect?: (fly: Fly) => void;
}

export default function PopularFliesSection({ onFlySelect }: PopularFliesSectionProps) {
  const [popularFlies, setPopularFlies] = useState<Fly[]>([]);
  const [trendingFlies, setTrendingFlies] = useState<Fly[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPopularFlies();
  }, []);


  // Refresh data when component becomes visible (for when user navigates back)
  useEffect(() => {
    const interval = setInterval(() => {
      loadPopularFlies();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadPopularFlies = async () => {
    try {
      const [popular, trending] = await Promise.all([
        flySuggestionService.getMostPopularFlies(5),
        flySuggestionService.getTrendingFlies(3)
      ]);
      setPopularFlies(popular);
      setTrendingFlies(trending);
    } catch (error) {
      console.error('Error loading popular flies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFlyItem = ({ item }: { item: Fly }) => (
    <TouchableOpacity
      style={styles.flyItem}
      onPress={() => onFlySelect?.(item)}
      disabled={!onFlySelect}
    >
      <View style={styles.flyInfo}>
        <Text style={styles.flyName}>{item.name}</Text>
        <Text style={styles.flyDetails}>
          {item.type} • {item.primary_size} • {item.color}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            {item.total_uses} uses
          </Text>
          <Text style={styles.statText}>
            {(item.success_rate * 100).toFixed(0)}% success
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading popular flies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Trending Flies */}
      {trendingFlies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending</Text>
          <FlatList
            data={trendingFlies}
            keyExtractor={(item) => item.id}
            renderItem={renderFlyItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>
      )}

      {/* Popular Flies */}
      {popularFlies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Most Popular</Text>
          <FlatList
            data={popularFlies}
            keyExtractor={(item) => item.id}
            renderItem={renderFlyItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>
      )}

      {popularFlies.length === 0 && trendingFlies.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No usage data yet. Start logging your fishing trips to see popular flies!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginLeft: 5,
  },
  horizontalList: {
    paddingLeft: 5,
  },
  flyItem: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#555',
  },
  flyInfo: {
    flex: 1,
  },
  flyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  flyDetails: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 11,
    color: '#ffd33d',
    fontWeight: '500',
  },
  loadingText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
