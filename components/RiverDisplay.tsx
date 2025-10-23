import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    RiverSegment,
    RiverSystem,
    getAccessPointsBySegment,
    getCurrentConditions
} from '../lib/riverData';

interface RiverDisplayProps {
  riverSegment: RiverSegment;
  riverSystem?: RiverSystem;
  onClose?: () => void;
  onNavigateToLocation?: (coordinates: { latitude: number; longitude: number }) => void;
  onGetFlySuggestions?: (coordinates: { latitude: number; longitude: number }, riverSegment: RiverSegment) => void;
  showModal?: boolean;
}

export default function RiverDisplay({ 
  riverSegment, 
  riverSystem, 
  onClose, 
  onNavigateToLocation,
  onGetFlySuggestions,
  showModal = true 
}: RiverDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'conditions' | 'access' | 'details'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const accessPoints = getAccessPointsBySegment(riverSegment.id);
  const currentConditions = getCurrentConditions(riverSegment.id);

  const handleNavigateToLocation = () => {
    if (onNavigateToLocation) {
      onNavigateToLocation({
        latitude: riverSegment.coordinates.latitude,
        longitude: riverSegment.coordinates.longitude
      });
    }
  };

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

  const getFishingRatingColor = (rating?: string) => {
    switch (rating) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#666';
    }
  };

  const formatFlowRate = (flow?: number) => {
    if (!flow) return 'N/A';
    if (flow < 50) return `${flow} cfs (Low)`;
    if (flow < 100) return `${flow} cfs (Moderate)`;
    if (flow < 200) return `${flow} cfs (High)`;
    return `${flow} cfs (Very High)`;
  };

  const formatTemperature = (temp?: number) => {
    if (!temp) return 'N/A';
    return `${temp}°F`;
  };

  const OverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Text style={styles.riverName}>{riverSegment.name}</Text>
          {riverSegment.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐ Featured</Text>
            </View>
          )}
        </View>
        <Text style={styles.riverSystem}>{riverSegment.riverSystem}</Text>
        <Text style={styles.description}>{riverSegment.description}</Text>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>{getWaterTypeIcon(riverSegment.waterType)}</Text>
          <Text style={styles.statLabel}>Water Type</Text>
          <Text style={styles.statValue}>{riverSegment.waterType}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📏</Text>
          <Text style={styles.statLabel}>Length</Text>
          <Text style={styles.statValue}>{riverSegment.length || 'N/A'} mi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⛰️</Text>
          <Text style={styles.statLabel}>Elevation</Text>
          <Text style={styles.statValue}>{riverSegment.elevation || 'N/A'} ft</Text>
        </View>
      </View>

      <View style={styles.difficultySection}>
        <Text style={styles.sectionTitle}>Difficulty & Access</Text>
        <View style={styles.difficultyRow}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(riverSegment.difficulty) }]}>
            <Text style={styles.difficultyText}>{riverSegment.difficulty.toUpperCase()}</Text>
          </View>
          <View style={[styles.accessBadge, { backgroundColor: getAccessTypeColor(riverSegment.access) }]}>
            <Text style={styles.accessText}>{riverSegment.access.replace('-', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.fishSpeciesSection}>
        <Text style={styles.sectionTitle}>Fish Species</Text>
        <View style={styles.speciesGrid}>
          {(riverSegment.fishSpecies || []).map((species, index) => (
            <View key={index} style={styles.speciesChip}>
              <Text style={styles.speciesText}>🐟 {species}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.seasonsSection}>
        <Text style={styles.sectionTitle}>Best Seasons</Text>
        <View style={styles.seasonsGrid}>
          {(riverSegment.bestSeasons || []).map((season, index) => (
            <View key={index} style={styles.seasonChip}>
              <Text style={styles.seasonText}>{season.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.hatchesSection}>
        <Text style={styles.sectionTitle}>Common Hatches</Text>
        <View style={styles.hatchesList}>
          {(riverSegment.hatches || []).map((hatch, index) => (
            <Text key={index} style={styles.hatchItem}>• {hatch}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const ConditionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.conditionsHeader}>
        <Text style={styles.sectionTitle}>Current Conditions</Text>
        <Text style={styles.lastUpdated}>
          Last Updated: {currentConditions ? new Date(currentConditions.lastUpdated).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      {currentConditions ? (
        <>
          <View style={styles.conditionsGrid}>
            <View style={styles.conditionCard}>
              <Text style={styles.conditionIcon}>💧</Text>
              <Text style={styles.conditionLabel}>Flow Rate</Text>
              <Text style={styles.conditionValue}>{formatFlowRate(currentConditions.flowRate)}</Text>
            </View>
            <View style={styles.conditionCard}>
              <Text style={styles.conditionIcon}>🌡️</Text>
              <Text style={styles.conditionLabel}>Water Temp</Text>
              <Text style={styles.conditionValue}>{formatTemperature(currentConditions.waterTemperature)}</Text>
            </View>
            <View style={styles.conditionCard}>
              <Text style={styles.conditionIcon}>📊</Text>
              <Text style={styles.conditionLabel}>Water Level</Text>
              <Text style={styles.conditionValue}>{currentConditions.waterLevel || 'N/A'}</Text>
            </View>
            <View style={styles.conditionCard}>
              <Text style={styles.conditionIcon}>👁️</Text>
              <Text style={styles.conditionLabel}>Clarity</Text>
              <Text style={styles.conditionValue}>{currentConditions.waterClarity || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.fishingRating}>
            <Text style={styles.sectionTitle}>Fishing Rating</Text>
            <View style={[styles.ratingBadge, { backgroundColor: getFishingRatingColor(currentConditions.fishingRating) }]}>
              <Text style={styles.ratingText}>
                {currentConditions.fishingRating?.toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </View>

          {currentConditions.recentHatches && currentConditions.recentHatches.length > 0 && (
            <View style={styles.recentHatches}>
              <Text style={styles.sectionTitle}>Recent Hatches</Text>
              <View style={styles.hatchesList}>
                {(currentConditions.recentHatches || []).map((hatch, index) => (
                  <Text key={index} style={styles.hatchItem}>• {hatch}</Text>
                ))}
              </View>
            </View>
          )}

          {currentConditions.notes && (
            <View style={styles.conditionsNotes}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{currentConditions.notes}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No current conditions data available</Text>
          <Text style={styles.noDataSubtext}>Check back later for updates</Text>
        </View>
      )}
    </ScrollView>
  );

  const AccessTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Access Points</Text>
      
      {accessPoints.length > 0 ? (
        (accessPoints || []).map((point) => (
          <View key={point.id} style={styles.accessPointCard}>
            <View style={styles.accessPointHeader}>
              <Text style={styles.accessPointName}>{point.name}</Text>
              <View style={styles.accessPointType}>
                <Text style={styles.accessPointTypeText}>{point.type.replace('-', ' ')}</Text>
              </View>
            </View>
            <Text style={styles.accessPointDescription}>{point.description}</Text>
            
            <View style={styles.accessPointDetails}>
              <View style={styles.accessDetail}>
                <Text style={styles.accessDetailLabel}>Road Condition:</Text>
                <Text style={styles.accessDetailValue}>{point.accessConditions.roadCondition}</Text>
              </View>
              {point.accessConditions.walkDistance && (
                <View style={styles.accessDetail}>
                  <Text style={styles.accessDetailLabel}>Walk Distance:</Text>
                  <Text style={styles.accessDetailValue}>{point.accessConditions.walkDistance} yards</Text>
                </View>
              )}
              {point.parkingCapacity && (
                <View style={styles.accessDetail}>
                  <Text style={styles.accessDetailLabel}>Parking:</Text>
                  <Text style={styles.accessDetailValue}>{point.parkingCapacity} vehicles</Text>
                </View>
              )}
              {point.fees?.required && (
                <View style={styles.accessDetail}>
                  <Text style={styles.accessDetailLabel}>Fee:</Text>
                  <Text style={styles.accessDetailValue}>${point.fees.amount}</Text>
                </View>
              )}
            </View>

            <View style={styles.amenitiesSection}>
              <Text style={styles.amenitiesTitle}>Amenities:</Text>
              <View style={styles.amenitiesGrid}>
                {point.amenities.restrooms && <Text style={styles.amenity}>🚻 Restrooms</Text>}
                {point.amenities.picnicTables && <Text style={styles.amenity}>🪑 Picnic Tables</Text>}
                {point.amenities.informationKiosk && <Text style={styles.amenity}>ℹ️ Info Kiosk</Text>}
                {point.amenities.wheelchairAccessible && <Text style={styles.amenity}>♿ Accessible</Text>}
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No specific access points listed</Text>
          <Text style={styles.noDataSubtext}>General public access available</Text>
        </View>
      )}
    </ScrollView>
  );

  const DetailsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>River Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Segment Type:</Text>
          <Text style={styles.detailValue}>{riverSegment.segmentType.replace('-', ' ')}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Average Width:</Text>
          <Text style={styles.detailValue}>{riverSegment.width || 'N/A'} feet</Text>
        </View>
        
        {riverSegment.depth && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Depth Range:</Text>
            <Text style={styles.detailValue}>
              {riverSegment.depth.min} - {riverSegment.depth.max} feet
            </Text>
          </View>
        )}
        
        {riverSegment.gradient && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gradient:</Text>
            <Text style={styles.detailValue}>{riverSegment.gradient} ft/mile</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bottom Composition:</Text>
          <Text style={styles.detailValue}>{riverSegment.bottomComposition}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vegetation:</Text>
          <Text style={styles.detailValue}>{riverSegment.vegetation}</Text>
        </View>
      </View>

      {riverSegment.amenities && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesList}>
            {riverSegment.amenities.parking && <Text style={styles.amenity}>🅿️ Parking Available</Text>}
            {riverSegment.amenities.restrooms && <Text style={styles.amenity}>🚻 Restrooms</Text>}
            {riverSegment.amenities.picnicTables && <Text style={styles.amenity}>🪑 Picnic Tables</Text>}
            {riverSegment.amenities.camping && <Text style={styles.amenity}>🏕️ Camping</Text>}
            {riverSegment.amenities.boatRamp && <Text style={styles.amenity}>🚤 Boat Ramp</Text>}
            {riverSegment.amenities.wadingAccess && <Text style={styles.amenity}>🚶 Wading Access</Text>}
            {riverSegment.amenities.wheelchairAccessible && <Text style={styles.amenity}>♿ Wheelchair Accessible</Text>}
          </View>
        </View>
      )}

      {riverSegment.nearbyServices && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Nearby Services</Text>
          
          {riverSegment.nearbyServices.flyShops && riverSegment.nearbyServices.flyShops.length > 0 && (
            <View style={styles.serviceSection}>
              <Text style={styles.serviceTitle}>🎣 Fly Shops:</Text>
              {(riverSegment.nearbyServices?.flyShops || []).map((shop, index) => (
                <Text key={index} style={styles.serviceItem}>• {shop}</Text>
              ))}
            </View>
          )}
          
          {riverSegment.nearbyServices.restaurants && riverSegment.nearbyServices.restaurants.length > 0 && (
            <View style={styles.serviceSection}>
              <Text style={styles.serviceTitle}>🍽️ Restaurants:</Text>
              {(riverSegment.nearbyServices?.restaurants || []).map((restaurant, index) => (
                <Text key={index} style={styles.serviceItem}>• {restaurant}</Text>
              ))}
            </View>
          )}
          
          {riverSegment.nearbyServices.lodging && riverSegment.nearbyServices.lodging.length > 0 && (
            <View style={styles.serviceSection}>
              <Text style={styles.serviceTitle}>🏨 Lodging:</Text>
              {(riverSegment.nearbyServices?.lodging || []).map((lodging, index) => (
                <Text key={index} style={styles.serviceItem}>• {lodging}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {riverSegment.regulations && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Regulations</Text>
          <View style={styles.regulationsList}>
            {riverSegment.regulations.catchAndRelease && (
              <Text style={styles.regulation}>🎣 Catch and Release Only</Text>
            )}
            {riverSegment.regulations.artificialOnly && (
              <Text style={styles.regulation}>🪝 Artificial Flies Only</Text>
            )}
            {riverSegment.regulations.specialRestrictions && riverSegment.regulations.specialRestrictions.length > 0 && (
              <>
                <Text style={styles.regulationTitle}>Special Restrictions:</Text>
                {(riverSegment.regulations?.specialRestrictions || []).map((restriction, index) => (
                  <Text key={index} style={styles.regulation}>• {restriction}</Text>
                ))}
              </>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'conditions':
        return <ConditionsTab />;
      case 'access':
        return <AccessTab />;
      case 'details':
        return <DetailsTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (!showModal) {
    return (
      <View style={styles.inlineContainer}>
        {renderTabContent()}
      </View>
    );
  }

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>River Information</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'conditions', label: 'Conditions', icon: '🌊' },
            { key: 'access', label: 'Access', icon: '🚗' },
            { key: 'details', label: 'Details', icon: 'ℹ️' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigateToLocation}>
            <Text style={styles.navigateButtonText}>🗺️ Navigate to Location</Text>
          </TouchableOpacity>
          
          {onGetFlySuggestions && (
            <TouchableOpacity 
              style={styles.flySuggestionsButton} 
              onPress={() => {
                onGetFlySuggestions({
                  latitude: riverSegment.coordinates.latitude,
                  longitude: riverSegment.coordinates.longitude
                }, riverSegment);
              }}
            >
              <Text style={styles.flySuggestionsButtonText}>🎣 Get Fly Suggestions</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inlineContainer: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: '#ffd33d',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#25292e',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#25292e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  riverSystem: {
    fontSize: 16,
    color: '#ffd33d',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 12,
  },
  difficultySection: {
    marginBottom: 20,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accessBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  accessText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fishSpeciesSection: {
    marginBottom: 20,
  },
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speciesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  seasonsSection: {
    marginBottom: 20,
  },
  seasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seasonChip: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seasonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  hatchesSection: {
    marginBottom: 20,
  },
  hatchesList: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
  },
  hatchItem: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  conditionsHeader: {
    marginBottom: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  conditionCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
  },
  conditionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  conditionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  conditionValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fishingRating: {
    marginBottom: 20,
  },
  ratingBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentHatches: {
    marginBottom: 20,
  },
  conditionsNotes: {
    marginBottom: 20,
  },
  notesText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 8,
  },
  noDataSubtext: {
    color: '#666',
    fontSize: 14,
  },
  accessPointCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  accessPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accessPointName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  accessPointType: {
    backgroundColor: '#ffd33d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accessPointTypeText: {
    color: '#25292e',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  accessPointDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
  },
  accessPointDetails: {
    marginBottom: 12,
  },
  accessDetail: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  accessDetailLabel: {
    color: '#999',
    fontSize: 12,
    width: 100,
  },
  accessDetailValue: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  amenitiesSection: {
    borderTopWidth: 1,
    borderTopColor: '#555',
    paddingTop: 12,
  },
  amenitiesTitle: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenity: {
    color: '#4CAF50',
    fontSize: 12,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#999',
    fontSize: 14,
    width: 120,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  amenitiesList: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
  },
  serviceSection: {
    marginBottom: 16,
  },
  serviceTitle: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceItem: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 8,
  },
  regulationsList: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
  },
  regulationTitle: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  regulation: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  navigateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flySuggestionsButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  flySuggestionsButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
