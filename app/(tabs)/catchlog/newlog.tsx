import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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
import FlySelector from '../../../components/FlySelector';
import { useAuth } from '../../../lib/AuthContext';
import { flySuggestionService } from '../../../lib/flySuggestionService';
import { fishingLogsService, getCurrentUserId } from '../../../lib/supabase';
import { FishingLog, Fly } from '../../../lib/types';

export default function NewLogScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FishingLog>>({
    location: '',
    weather_conditions: 'sunny',
    water_clarity: 'clear',
    water_level: 'normal',
    time_of_day: 'morning',
    time_of_year: 'summer',
    flies_used: [],
    successful_flies: [],
    fish_caught: 0,
    notes: '',
  });

  const handleInputChange = (field: keyof FishingLog, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFlySelect = (fly: Fly) => {
    setFormData(prev => ({
      ...prev,
      flies_used: [...(prev.flies_used || []), fly.name],
    }));
  };

  const removeFly = (index: number) => {
    setFormData(prev => ({
      ...prev,
      flies_used: prev.flies_used?.filter((_, i) => i !== index) || [],
    }));
  };

  const toggleSuccessfulFly = (fly: string) => {
    setFormData(prev => {
      const successfulFlies = prev.successful_flies || [];
      const isSuccessful = successfulFlies.includes(fly);
      
      return {
        ...prev,
        successful_flies: isSuccessful
          ? successfulFlies.filter(f => f !== fly)
          : [...successfulFlies, fly],
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.location) {
      Alert.alert('Missing Information', 'Please enter a location.');
      return;
    }

    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to save your fishing logs. Would you like to sign in now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') }
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Auth error', 'Please sign in to save fishing logs.');
        return;
      }
      const newLog: Omit<FishingLog, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        location: formData.location!,
        weather_conditions: formData.weather_conditions!,
        water_conditions: 'calm', // Default value since we removed it from the form
        water_clarity: formData.water_clarity!,
        water_level: formData.water_level!,
        time_of_day: formData.time_of_day!,
        time_of_year: formData.time_of_year!,
        flies_used: formData.flies_used || [],
        successful_flies: formData.successful_flies || [],
        fish_caught: formData.fish_caught || 0,
        notes: formData.notes,
      };

      console.log('Creating new log:', newLog);
      const createdLog = await fishingLogsService.createLog(newLog);
      console.log('Log created successfully:', createdLog);
      
      // Learn from the fishing results to improve future suggestions
      try {
        // If fish were caught, mark all flies as successful
        const successfulFlies = newLog.fish_caught > 0 ? newLog.flies_used : newLog.successful_flies;
        
        await flySuggestionService.learnFromResult({
          flies_used: newLog.flies_used,
          successful_flies: successfulFlies,
          conditions: {
            weather_conditions: newLog.weather_conditions,
            water_clarity: newLog.water_clarity,
            water_level: newLog.water_level,
            time_of_day: newLog.time_of_day,
          }
        });
        console.log('Successfully learned from fishing results');
      } catch (error) {
        console.error('Error learning from results:', error);
        // Don't show error to user as the log was saved successfully
      }
      
      Alert.alert('Success', 'Fishing log saved successfully!');
      
      // Reset form
      setFormData({
        location: '',
        weather_conditions: 'sunny',
        water_clarity: 'clear',
        water_level: 'normal',
        time_of_day: 'morning',
        time_of_year: 'summer',
        flies_used: [],
        successful_flies: [],
        fish_caught: 0,
        notes: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save fishing log. Please try again.');
      console.error('Error saving log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>New Fishing Log</Text>
        <Text style={styles.subtitle}>
          Record your fishing session details
        </Text>
        
        {/* Location - Only text input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder="Where did you fish?"
            placeholderTextColor="#666"
          />
        </View>

        {/* Time of Year */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time of Year</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.time_of_year}
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
              selectedValue={formData.time_of_day}
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
              selectedValue={formData.weather_conditions}
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
              selectedValue={formData.water_clarity}
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
              selectedValue={formData.water_level}
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


        {/* Flies Used */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Flies Used</Text>
          {(formData.fish_caught || 0) > 0 && (
            <Text style={styles.autoSuccessText}>
              ✨ All flies will be marked as successful since you caught fish!
            </Text>
          )}
          <FlySelector
            onFlySelect={handleFlySelect}
            selectedFlies={formData.flies_used || []}
            placeholder="Search flies by name, type, or color..."
          />
          
          {formData.flies_used && formData.flies_used.length > 0 && (
            <View style={styles.fliesList}>
              {formData.flies_used.map((fly, index) => (
                <View key={index} style={styles.flyItem}>
                  <TouchableOpacity
                    style={[
                      styles.flyButton,
                      formData.successful_flies?.includes(fly) && styles.successfulFly
                    ]}
                    onPress={() => toggleSuccessfulFly(fly)}
                  >
                    <Text style={[
                      styles.flyText,
                      formData.successful_flies?.includes(fly) && styles.successfulFlyText
                    ]}>
                      {fly}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFly(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Fish Caught */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fish Caught</Text>
          <TextInput
            style={styles.input}
            value={formData.fish_caught?.toString() || ''}
            onChangeText={(text) => handleInputChange('fish_caught', text ? parseInt(text) : 0)}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => handleInputChange('notes', text)}
            placeholder="Any additional observations..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Saving...' : 'Save Log'}
          </Text>
        </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  autoSuccessText: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  fliesList: {
    marginTop: 10,
  },
  flyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flyButton: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#555',
  },
  successfulFly: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  flyText: {
    color: '#fff',
    textAlign: 'center',
  },
  successfulFlyText: {
    color: '#fff',
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#ffd33d',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#25292e',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});