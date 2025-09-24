import { router } from 'expo-router';
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
import { useAuth } from '../../../lib/AuthContext';
import { fishingLogsService, getCurrentUserId } from '../../../lib/supabase';
import { FishingLog } from '../../../lib/types';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FishingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      if (!user) {
        setLogs([]);
        return;
      }

      const userId = await getCurrentUserId();
      
      if (!userId) {
        setLogs([]);
        return;
      }
      
      const userLogs = await fishingLogsService.getLogs(userId);
      setLogs(userLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
      Alert.alert('Error', 'Failed to load fishing logs.');
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
    // Prevent double-clicks
    if (deletingLogId === logId) {
      return;
    }
    
    // Use confirm for web compatibility
    const confirmed = window.confirm('Are you sure you want to delete this fishing log?');
    
    if (!confirmed) {
      return;
    }
    
    setDeletingLogId(logId);
    
    try {
      // Check if user is authenticated
      const userId = await getCurrentUserId();
      
      if (!userId) {
        alert('Error: You must be logged in to delete logs.');
        return;
      }
      
      await fishingLogsService.deleteLog(logId, userId);
      
      setLogs(prev => {
        const newLogs = prev.filter(log => log.id !== logId);
        return newLogs;
      });
      
      alert('Fishing log deleted successfully!');
    } catch (error) {
      console.error('Error deleting log:', error);
      alert(`Failed to delete fishing log: ${error.message || 'Unknown error'}`);
    } finally {
      setDeletingLogId(null);
    }
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
          style={[styles.deleteButton, deletingLogId === item.id && styles.deleteButtonDisabled]}
          onPress={() => deleteLog(item.id)}
          disabled={deletingLogId === item.id}
        >
          <Text style={styles.deleteButtonText}>
            {deletingLogId === item.id ? '...' : '×'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.conditionsRow}>
        <View style={styles.conditionItem}>
          <Text style={styles.conditionLabel}>Weather</Text>
          <Text style={styles.conditionValue}>{item.weather_conditions}</Text>
        </View>
        <View style={styles.conditionItem}>
          <Text style={styles.conditionLabel}>Water Clarity</Text>
          <Text style={styles.conditionValue}>{item.water_clarity}</Text>
        </View>
        <View style={styles.conditionItem}>
          <Text style={styles.conditionLabel}>Water Level</Text>
          <Text style={styles.conditionValue}>{item.water_level}</Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Time of Day</Text>
          <Text style={styles.timeValue}>{item.time_of_day}</Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Water Temp</Text>
          <Text style={styles.timeValue}>
            {item.water_temperature ? `${item.water_temperature}°F` : 'N/A'}
          </Text>
        </View>
      </View>

      {item.flies_used && item.flies_used.length > 0 && (
        <View style={styles.fliesSection}>
          <Text style={styles.fliesTitle}>Flies Used:</Text>
          <View style={styles.fliesList}>
            {item.flies_used.map((fly, index) => (
              <View
                key={index}
                style={[
                  styles.flyChip,
                  fly.successful && styles.successfulFlyChip,
                ]}
              >
                <Text
                  style={[
                    styles.flyText,
                    fly.successful && styles.successfulFlyText,
                  ]}
                >
                  {fly.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.catchSection}>
        <Text style={styles.catchText}>
          Fish Caught: {item.fish_caught}
        </Text>
      </View>

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesText}>Notes: {item.notes}</Text>
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
        {!user ? (
          <>
            <Text style={styles.emptyText}>Sign In to View History</Text>
            <Text style={styles.emptySubtext}>
              Your fishing logs are saved when you're signed in. Sign in to view your catch history!
            </Text>
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.emptyText}>No fishing logs yet</Text>
            <Text style={styles.emptySubtext}>
              Start logging your fishing trips to build your personal database!
            </Text>
          </>
        )}
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
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  deleteButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
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
  signInButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  signInButtonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});