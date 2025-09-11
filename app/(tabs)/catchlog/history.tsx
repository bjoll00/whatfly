import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { fishingLogsService, getCurrentUserId } from '../../../lib/supabase';
import { FishingLog } from '../../../lib/types';

export default function HistoryScreen() {
  const [logs, setLogs] = useState<FishingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setLogs([]);
        return;
      }
      const userLogs = await fishingLogsService.getLogs(userId);
      setLogs(userLogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load fishing logs.');
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const deleteLog = async (logId: string) => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this fishing log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fishingLogsService.deleteLog(logId);
              setLogs(prev => prev.filter(log => log.id !== logId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete fishing log.');
              console.error('Error deleting log:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderLog = ({ item }: { item: FishingLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteLog(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.conditionsRow}>
        <View style={styles.conditionItem}>
          <Text style={styles.conditionLabel}>Weather</Text>
          <Text style={styles.conditionValue}>
            {item.weather_conditions.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <View style={styles.conditionItem}>
          <Text style={styles.conditionLabel}>Clarity</Text>
          <Text style={styles.conditionValue}>
            {item.water_clarity.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <View style={styles.conditionItem}>
          <Text style={styles.conditionLabel}>Level</Text>
          <Text style={styles.conditionValue}>
            {item.water_level.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Time of Day</Text>
          <Text style={styles.timeValue}>
            {item.time_of_day.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        {item.time_of_year && (
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Season</Text>
            <Text style={styles.timeValue}>
              {item.time_of_year.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {item.water_temperature && (
        <View style={styles.tempRow}>
          <Text style={styles.tempText}>
            Water: {item.water_temperature}°F
          </Text>
          {item.air_temperature && (
            <Text style={styles.tempText}>
              Air: {item.air_temperature}°F
            </Text>
          )}
        </View>
      )}

      {item.flies_used && item.flies_used.length > 0 && (
        <View style={styles.fliesSection}>
          <Text style={styles.fliesTitle}>Flies Used:</Text>
          <View style={styles.fliesList}>
            {item.flies_used.map((fly, index) => (
              <View
                key={index}
                style={[
                  styles.flyChip,
                  item.successful_flies?.includes(fly) && styles.successfulFlyChip,
                ]}
              >
                <Text
                  style={[
                    styles.flyText,
                    item.successful_flies?.includes(fly) && styles.successfulFlyText,
                  ]}
                >
                  {fly}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.fish_caught > 0 && (
        <View style={styles.catchSection}>
          <Text style={styles.catchText}>
            🐟 {item.fish_caught} fish caught
          </Text>
        </View>
      )}

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your fishing logs...</Text>
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No fishing logs yet</Text>
        <Text style={styles.emptySubtext}>
          Start logging your fishing trips to build your personal database!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fishing History</Text>
      <FlatList
        data={logs}
        renderItem={renderLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 20,
  },
  logCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  conditionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  conditionItem: {
    flex: 1,
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
  conditionValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '600',
    textAlign: 'center',
  },
  tempRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tempText: {
    fontSize: 14,
    color: '#ffd33d',
    fontWeight: '500',
  },
  fliesSection: {
    marginBottom: 12,
  },
  fliesTitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  fliesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  flyChip: {
    backgroundColor: '#555',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successfulFlyChip: {
    backgroundColor: '#4CAF50',
  },
  flyText: {
    fontSize: 12,
    color: '#fff',
  },
  successfulFlyText: {
    color: '#fff',
    fontWeight: '600',
  },
  catchSection: {
    marginBottom: 12,
  },
  catchText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#555',
    paddingTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
});