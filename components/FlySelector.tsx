import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { fliesService } from '../lib/supabase';
import { Fly } from '../lib/types';

interface FlySelectorProps {
  onFlySelect: (fly: Fly) => void;
  selectedFlies: string[];
  placeholder?: string;
}

export default function FlySelector({ onFlySelect, selectedFlies, placeholder = "Search flies..." }: FlySelectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [flies, setFlies] = useState<Fly[]>([]);
  const [filteredFlies, setFilteredFlies] = useState<Fly[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadFlies();
    }
  }, [isVisible]);

  useEffect(() => {
    filterFlies();
  }, [searchQuery, flies]);

  const loadFlies = async () => {
    setIsLoading(true);
    try {
      const allFlies = await fliesService.getFlies();
      setFlies(allFlies);
    } catch (error) {
      console.error('Error loading flies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFlies = () => {
    if (!searchQuery.trim()) {
      setFilteredFlies(flies);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = flies.filter(fly => 
      fly.name.toLowerCase().includes(query) ||
      fly.type.toLowerCase().includes(query) ||
      fly.color.toLowerCase().includes(query) ||
      fly.description?.toLowerCase().includes(query)
    );
    setFilteredFlies(filtered);
  };

  const handleFlySelect = (fly: Fly) => {
    onFlySelect(fly);
    setIsVisible(false);
    setSearchQuery('');
  };

  const isFlySelected = (fly: Fly) => {
    return selectedFlies.includes(fly.name);
  };

  const renderFlyItem = ({ item }: { item: Fly }) => (
    <TouchableOpacity
      style={[
        styles.flyItem,
        isFlySelected(item) && styles.selectedFlyItem
      ]}
      onPress={() => handleFlySelect(item)}
    >
      <View style={styles.flyInfo}>
        <Text style={styles.flyName}>{item.name}</Text>
        <Text style={styles.flyDetails}>
          {item.type} • {item.primary_size} • {item.color}
        </Text>
        {item.description && (
          <Text style={styles.flyDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.success_rate > 0 && (
          <Text style={styles.successRate}>
            Success Rate: {(item.success_rate * 100).toFixed(0)}%
          </Text>
        )}
      </View>
      {isFlySelected(item) && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.selectorButtonText}>
          {selectedFlies.length > 0 
            ? `${selectedFlies.length} flies selected` 
            : 'Select flies...'
          }
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Flies</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading flies...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredFlies}
              keyExtractor={(item) => item.id}
              renderItem={renderFlyItem}
              style={styles.flyList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  flyList: {
    flex: 1,
  },
  flyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFlyItem: {
    backgroundColor: '#e8f4fd',
  },
  flyInfo: {
    flex: 1,
  },
  flyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  flyDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  flyDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  successRate: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
