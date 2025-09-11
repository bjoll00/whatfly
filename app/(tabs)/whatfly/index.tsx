import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PopularFliesSection from '../../../components/PopularFliesSection';
import { flySuggestionService } from '../../../lib/flySuggestionService';
import { FishingConditions, FlySuggestion } from '../../../lib/types';

export default function WhatFlyScreen() {
  const [conditions, setConditions] = useState<Partial<FishingConditions>>({
    location: '',
    weather_conditions: 'sunny',
    water_clarity: 'clear',
    water_level: 'normal',
    time_of_day: 'morning',
    time_of_year: 'summer',
  });

  const [suggestions, setSuggestions] = useState<FlySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInputChange = (field: keyof FishingConditions, value: any) => {
    setConditions(prev => ({ ...prev, [field]: value }));
  };

  const getSuggestions = async () => {
    if (!conditions.location) {
      Alert.alert('Missing Information', 'Please enter a location.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Getting suggestions for conditions:', conditions);
      const flySuggestions = await flySuggestionService.getSuggestions(conditions as FishingConditions);
      console.log('Received suggestions:', flySuggestions);
      setSuggestions(flySuggestions);
      
      if (flySuggestions.length === 0) {
        Alert.alert('No Suggestions', 'No fly suggestions found. The database might be empty or there might be a connection issue.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get fly suggestions. Please try again.');
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setConditions({
      location: '',
      weather_conditions: 'sunny',
      water_clarity: 'clear',
      water_level: 'normal',
      time_of_day: 'morning',
      time_of_year: 'summer',
    });
    setSuggestions([]);
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What Fly Should I Use?</Text>
        <Text style={styles.subtitle}>
          Select your fishing conditions to get AI-powered fly suggestions
        </Text>
        
        {/* Location - Only text input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={conditions.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder="Where are you fishing?"
            placeholderTextColor="#666"
          />
        </View>

        {/* Time of Year */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time of Year</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={conditions.time_of_year}
              onValueChange={(value) => handleInputChange('time_of_year', value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="❄️ Winter" value="winter" />
              <Picker.Item label="🌸 Early Spring" value="early_spring" />
              <Picker.Item label="🌷 Spring" value="spring" />
              <Picker.Item label="🌱 Late Spring" value="late_spring" />
              <Picker.Item label="🌿 Early Summer" value="early_summer" />
              <Picker.Item label="☀️ Summer" value="summer" />
              <Picker.Item label="🌻 Late Summer" value="late_summer" />
              <Picker.Item label="🍂 Early Fall" value="early_fall" />
              <Picker.Item label="🍁 Fall" value="fall" />
              <Picker.Item label="🍂 Late Fall" value="late_fall" />
            </Picker>
          </View>
        </View>

        {/* Time of Day */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time of Day</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={conditions.time_of_day}
              onValueChange={(value) => handleInputChange('time_of_day', value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="🌅 Dawn" value="dawn" />
              <Picker.Item label="🌄 Morning" value="morning" />
              <Picker.Item label="☀️ Midday" value="midday" />
              <Picker.Item label="🌤️ Afternoon" value="afternoon" />
              <Picker.Item label="🌅 Dusk" value="dusk" />
              <Picker.Item label="🌙 Night" value="night" />
            </Picker>
          </View>
        </View>

        {/* Weather Conditions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weather Conditions</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={conditions.weather_conditions}
              onValueChange={(value) => handleInputChange('weather_conditions', value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="☀️ Sunny" value="sunny" />
              <Picker.Item label="⛅ Cloudy" value="cloudy" />
              <Picker.Item label="☁️ Overcast" value="overcast" />
              <Picker.Item label="🌧️ Rainy" value="rainy" />
              <Picker.Item label="⛈️ Stormy" value="stormy" />
              <Picker.Item label="🌫️ Foggy" value="foggy" />
            </Picker>
          </View>
        </View>

        {/* Water Clarity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Water Clarity</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={conditions.water_clarity}
              onValueChange={(value) => handleInputChange('water_clarity', value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="💧 Clear" value="clear" />
              <Picker.Item label="💧 Slightly Murky" value="slightly_murky" />
              <Picker.Item label="💧 Murky" value="murky" />
              <Picker.Item label="💧 Very Murky" value="very_murky" />
            </Picker>
          </View>
        </View>

        {/* Water Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Water Level</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={conditions.water_level}
              onValueChange={(value) => handleInputChange('water_level', value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="📉 Low" value="low" />
              <Picker.Item label="📊 Normal" value="normal" />
              <Picker.Item label="📈 High" value="high" />
              <Picker.Item label="🌊 Flooding" value="flooding" />
            </Picker>
          </View>
        </View>


        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearForm}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={refreshData}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.suggestButton, isLoading && styles.suggestButtonDisabled]}
            onPress={getSuggestions}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#25292e" />
            ) : (
              <Text style={styles.suggestButtonText}>Get Suggestions</Text>
            )}
          </TouchableOpacity>
        </View>


        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Recommended Flies</Text>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.flyName}>{suggestion.fly.name}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {Math.round(suggestion.confidence)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.flyType}>
                  {suggestion.fly.type.toUpperCase()} • Size {suggestion.fly.size} • {suggestion.fly.color}
                </Text>
                <Text style={styles.flyDescription}>
                  {suggestion.fly.description || 'No description available'}
                </Text>
                <Text style={styles.reasonText}>
                  💡 {suggestion.reason}
                </Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    Success Rate: {Math.round(suggestion.fly.success_rate * 100)}%
                  </Text>
                  <Text style={styles.statText}>
                    Uses: {suggestion.fly.total_uses}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Popular Flies Section */}
        <PopularFliesSection refreshTrigger={refreshTrigger} />

        {suggestions.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Select your fishing conditions above to get personalized fly suggestions!
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  pickerContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    color: '#fff',
    height: 50,
    backgroundColor: 'transparent',
    width: '100%',
  },
  pickerItem: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    height: 50,
    lineHeight: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#666',
    marginRight: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestButton: {
    backgroundColor: '#ffd33d',
    marginLeft: 5,
  },
  suggestButtonDisabled: {
    backgroundColor: '#666',
  },
  suggestButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsSection: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  flyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  flyType: {
    fontSize: 14,
    color: '#ffd33d',
    marginBottom: 8,
  },
  flyDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
});