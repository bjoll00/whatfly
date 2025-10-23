import React, { useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {
    RiverSegment,
    UTAH_RIVER_SYSTEMS,
    searchRiverSegments
} from '../lib/riverData';

interface RiverListProps {
  onRiverSelect: (riverSegment: RiverSegment) => void;
  onNavigateToLocation?: (coordinates: { latitude: number; longitude: number }) => void;
  showFeaturedOnly?: boolean;
  filterByDifficulty?: 'easy' | 'moderate' | 'difficult' | 'expert';
  filterBySpecies?: string;
}

export default function RiverList({ 
  onRiverSelect, 
  onNavigateToLocation,
  showFeaturedOnly = false,
  filterByDifficulty,
  filterBySpecies
}: RiverListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'popularity'>('popularity');

  // Get all river segments from all systems
  const allRiverSegments = useMemo(() => {
    const segments: RiverSegment[] = [];
    for (const system of UTAH_RIVER_SYSTEMS) {
      segments.push(...system.segments);
    }
    return segments;
  }, []);

  // Filter and sort river segments
  const filteredSegments = useMemo(() => {
    let segments = allRiverSegments;

    // Apply filters
    if (showFeaturedOnly) {
      segments = segments.filter(segment => segment.featured);
    }

    if (filterByDifficulty) {
      segments = segments.filter(segment => segment.difficulty === filterByDifficulty);
    }

    if (filterBySpecies) {
      segments = segments.filter(segment => 
        segment.fishSpecies.some(species => 
          species.toLowerCase().includes(filterBySpecies.toLowerCase())
        )
      );
    }

    if (selectedSystem) {
      segments = segments.filter(segment => segment.riverSystem === selectedSystem);
    }

    if (searchQuery.trim()) {
      segments = searchRiverSegments(searchQuery);
    }

    // Sort segments
    segments.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'moderate': 2, 'difficult': 3, 'expert': 4 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'popularity':
        default:
          // Featured first, then popular, then by name
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return a.name.localeCompare(b.name);
      }
    });

    return segments;
  }, [allRiverSegments, showFeaturedOnly, filterByDifficulty, filterBySpecies, selectedSystem, searchQuery, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'difficult': return '#F44336';
      case 'expert': return '#9C27B0';
      default: return '#666';
    }
  };

  const getAccessTypeColor = (access: string) => {
    switch (access) {
      case 'public': return '#4CAF50';
      case 'walk-in': return '#FF9800';
      case 'boat': return '#2196F3';
      case 'private': return '#F44336';
      case 'permit-required': return '#FF9800';
      default: return '#666';
    }
  };

  const getWaterTypeIcon = (waterType: string) => {
    switch (waterType) {
      case 'freestone': return '🏔️';
      case 'spring-fed': return '💧';
      case 'tailwater': return '🌊';
      case 'reservoir-fed': return '🏞️';
      default: return '🌊';
    }
  };

  const formatFlowRate = (flow?: number) => {
    if (!flow) return 'N/A';
    return `${flow} cfs`;
  };

  const renderRiverSegment = ({ item }: { item: RiverSegment }) => (
    <TouchableOpacity 
      style={styles.riverCard}
      onPress={() => onRiverSelect(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.riverName}>{item.name}</Text>
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐</Text>
            </View>
          )}
          {item.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>🔥</Text>
            </View>
          )}
        </View>
        <Text style={styles.riverSystem}>{item.riverSystem}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>{getWaterTypeIcon(item.waterType)}</Text>
            <Text style={styles.statLabel}>{item.waterType}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📏</Text>
            <Text style={styles.statLabel}>{item.length || 'N/A'} mi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⛰️</Text>
            <Text style={styles.statLabel}>{item.elevation || 'N/A'} ft</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={styles.statLabel}>{formatFlowRate(item.averageFlow)}</Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.badgeText}>{item.difficulty.toUpperCase()}</Text>
          </View>
          <View style={[styles.accessBadge, { backgroundColor: getAccessTypeColor(item.access) }]}>
            <Text style={styles.badgeText}>{item.access.replace('-', ' ').toUpperCase()}</Text>
          </View>
          <View style={styles.segmentTypeBadge}>
            <Text style={styles.badgeText}>{item.segmentType.replace('-', ' ').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.fishSpecies}>
          <Text style={styles.speciesLabel}>Fish Species:</Text>
          <View style={styles.speciesRow}>
            {item.fishSpecies.slice(0, 3).map((species, index) => (
              <Text key={index} style={styles.speciesChip}>🐟 {species}</Text>
            ))}
            {item.fishSpecies.length > 3 && (
              <Text style={styles.moreSpecies}>+{item.fishSpecies.length - 3} more</Text>
            )}
          </View>
        </View>

        <View style={styles.seasons}>
          <Text style={styles.seasonsLabel}>Best Seasons:</Text>
          <View style={styles.seasonsRow}>
            {item.bestSeasons.slice(0, 2).map((season, index) => (
              <Text key={index} style={styles.seasonChip}>
                {season.replace('_', ' ')}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.hatches}>
          <Text style={styles.hatchesLabel}>Common Hatches:</Text>
          <Text style={styles.hatchesText} numberOfLines={1}>
            {item.hatches.slice(0, 3).join(', ')}
            {item.hatches.length > 3 && '...'}
          </Text>
        </View>

        {item.amenities && (
          <View style={styles.amenities}>
            <Text style={styles.amenitiesLabel}>Amenities:</Text>
            <View style={styles.amenitiesRow}>
              {item.amenities.parking && <Text style={styles.amenity}>🅿️</Text>}
              {item.amenities.restrooms && <Text style={styles.amenity}>🚻</Text>}
              {item.amenities.picnicTables && <Text style={styles.amenity}>🪑</Text>}
              {item.amenities.camping && <Text style={styles.amenity}>🏕️</Text>}
              {item.amenities.boatRamp && <Text style={styles.amenity}>🚤</Text>}
              {item.amenities.wheelchairAccessible && <Text style={styles.amenity}>♿</Text>}
            </View>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => onRiverSelect(item)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        {onNavigateToLocation && (
          <TouchableOpacity 
            style={styles.navigateButton}
            onPress={() => onNavigateToLocation({
              latitude: item.coordinates.latitude,
              longitude: item.coordinates.longitude
            })}
          >
            <Text style={styles.navigateText}>🗺️ Navigate</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSystemFilter = () => {
    const systems = UTAH_RIVER_SYSTEMS.map(system => system.name);
    
    return (
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by River System:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.systemFilters}>
          <TouchableOpacity
            style={[styles.systemFilter, !selectedSystem && styles.activeSystemFilter]}
            onPress={() => setSelectedSystem(null)}
          >
            <Text style={[styles.systemFilterText, !selectedSystem && styles.activeSystemFilterText]}>
              All Systems
            </Text>
          </TouchableOpacity>
          {systems.map((system) => (
            <TouchableOpacity
              key={system}
              style={[styles.systemFilter, selectedSystem === system && styles.activeSystemFilter]}
              onPress={() => setSelectedSystem(system)}
            >
              <Text style={[styles.systemFilterText, selectedSystem === system && styles.activeSystemFilterText]}>
                {system}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSortOptions = () => (
    <View style={styles.sortSection}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <View style={styles.sortButtons}>
        {[
          { key: 'popularity', label: 'Popularity' },
          { key: 'name', label: 'Name' },
          { key: 'difficulty', label: 'Difficulty' }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.sortButton, sortBy === option.key && styles.activeSortButton]}
            onPress={() => setSortBy(option.key as any)}
          >
            <Text style={[styles.sortButtonText, sortBy === option.key && styles.activeSortButtonText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Utah River Systems</Text>
        <Text style={styles.headerSubtitle}>
          {filteredSegments.length} river segment{filteredSegments.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rivers, species, or locations..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderSystemFilter()}
      {renderSortOptions()}

      <FlatList
        data={filteredSegments}
        renderItem={renderRiverSegment}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rivers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  searchSection: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#555',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 8,
  },
  systemFilters: {
    flexDirection: 'row',
  },
  systemFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  activeSystemFilter: {
    backgroundColor: '#ffd33d',
    borderColor: '#ffd33d',
  },
  systemFilterText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  activeSystemFilterText: {
    color: '#25292e',
    fontWeight: 'bold',
  },
  sortSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#555',
  },
  activeSortButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortButtonText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  riverCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  riverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#ffd33d',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  featuredText: {
    fontSize: 12,
  },
  popularBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  popularText: {
    fontSize: 12,
  },
  riverSystem: {
    fontSize: 14,
    color: '#ffd33d',
  },
  cardContent: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  segmentTypeBadge: {
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fishSpecies: {
    marginBottom: 12,
  },
  speciesLabel: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  speciesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  speciesChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    color: '#fff',
  },
  moreSpecies: {
    color: '#999',
    fontSize: 11,
    fontStyle: 'italic',
  },
  seasons: {
    marginBottom: 12,
  },
  seasonsLabel: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  seasonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  seasonChip: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    color: '#fff',
    textTransform: 'capitalize',
  },
  hatches: {
    marginBottom: 12,
  },
  hatchesLabel: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  hatchesText: {
    fontSize: 12,
    color: '#ccc',
  },
  amenities: {
    marginBottom: 16,
  },
  amenitiesLabel: {
    fontSize: 12,
    color: '#ffd33d',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  amenity: {
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#555',
    gap: 12,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
});
