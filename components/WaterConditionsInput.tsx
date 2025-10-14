import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { FishingConditions } from '../lib/types';

interface WaterConditions {
  water_temperature?: number;
  water_clarity: 'clear' | 'slightly_murky' | 'murky' | 'very_murky';
  water_level: 'low' | 'normal' | 'high' | 'flooding';
  water_flow: 'still' | 'slow' | 'moderate' | 'fast' | 'rapid';
  water_depth?: number;
  water_ph?: number;
  dissolved_oxygen?: number;
  notes?: string;
}

interface WaterConditionsInputProps {
  conditions: Partial<FishingConditions>;
  onConditionsChange: (field: keyof FishingConditions, value: any) => void;
  showAdvanced?: boolean;
}

export default function WaterConditionsInput({
  conditions,
  onConditionsChange,
  showAdvanced = false,
}: WaterConditionsInputProps) {
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  const handleInputChange = (field: keyof FishingConditions, value: any) => {
    onConditionsChange(field, value);
  };

  const getClarityIcon = (clarity: string) => {
    switch (clarity) {
      case 'clear': return '💧';
      case 'slightly_murky': return '🌊';
      case 'murky': return '🌫️';
      case 'very_murky': return '☁️';
      default: return '💧';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return '📉';
      case 'normal': return '📊';
      case 'high': return '📈';
      case 'flooding': return '🌊';
      default: return '📊';
    }
  };

  const getFlowIcon = (flow: string) => {
    switch (flow) {
      case 'still': return '🫧';
      case 'slow': return '💨';
      case 'moderate': return '🌊';
      case 'fast': return '💨💨';
      case 'rapid': return '⚡';
      default: return '🌊';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Water Conditions</Text>
      
      {/* Water Temperature */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Water Temperature (°F)</Text>
        <TextInput
          style={styles.input}
          value={conditions.water_temperature?.toString() || ''}
          onChangeText={(text) => {
            const temp = text ? parseFloat(text) : undefined;
            handleInputChange('water_temperature', temp);
          }}
          placeholder="Enter water temperature (e.g., 65)"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>
          💡 Ideal range: 50-70°F for trout, 65-75°F for bass
        </Text>
      </View>

      {/* Water Clarity */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Water Clarity</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={conditions.water_clarity || 'clear'}
            onValueChange={(value) => handleInputChange('water_clarity', value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label={`💧 Clear`} value="clear" />
            <Picker.Item label={`🌊 Slightly Murky`} value="slightly_murky" />
            <Picker.Item label={`🌫️ Murky`} value="murky" />
            <Picker.Item label={`☁️ Very Murky`} value="very_murky" />
          </Picker>
        </View>
      </View>

      {/* Water Level */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Water Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={conditions.water_level || 'normal'}
            onValueChange={(value) => handleInputChange('water_level', value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label={`📉 Low`} value="low" />
            <Picker.Item label={`📊 Normal`} value="normal" />
            <Picker.Item label={`📈 High`} value="high" />
            <Picker.Item label={`🌊 Flooding`} value="flooding" />
          </Picker>
        </View>
      </View>

      {/* Water Flow */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Water Flow</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={conditions.water_flow || 'moderate'}
            onValueChange={(value) => handleInputChange('water_flow', value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label={`🫧 Still`} value="still" />
            <Picker.Item label={`💨 Slow`} value="slow" />
            <Picker.Item label={`🌊 Moderate`} value="moderate" />
            <Picker.Item label={`💨💨 Fast`} value="fast" />
            <Picker.Item label={`⚡ Rapid`} value="rapid" />
          </Picker>
        </View>
      </View>

      {/* Water Depth */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Average Water Depth (feet)</Text>
        <TextInput
          style={styles.input}
          value={conditions.water_depth?.toString() || ''}
          onChangeText={(text) => {
            const depth = text ? parseFloat(text) : undefined;
            handleInputChange('water_depth', depth);
          }}
          placeholder="Enter average depth (e.g., 8)"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
      </View>

      {/* Advanced Options Button */}
      <TouchableOpacity
        style={styles.advancedButton}
        onPress={() => setShowAdvancedModal(true)}
      >
        <Text style={styles.advancedButtonText}>🔬 Advanced Water Conditions</Text>
      </TouchableOpacity>

      {/* Notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={conditions.notes || ''}
          onChangeText={(text) => handleInputChange('notes', text)}
          placeholder="Any additional water observations..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Advanced Modal */}
      <Modal
        visible={showAdvancedModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdvancedModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAdvancedModal(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Advanced Water Conditions</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* pH Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Water pH Level</Text>
              <TextInput
                style={styles.input}
                value={conditions.water_ph?.toString() || ''}
                onChangeText={(text) => {
                  const ph = text ? parseFloat(text) : undefined;
                  handleInputChange('water_ph', ph);
                }}
                placeholder="Enter pH (e.g., 7.2)"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                💡 Ideal range: 6.5-8.5 for most freshwater fish
              </Text>
            </View>

            {/* Dissolved Oxygen */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dissolved Oxygen (mg/L)</Text>
              <TextInput
                style={styles.input}
                value={conditions.dissolved_oxygen?.toString() || ''}
                onChangeText={(text) => {
                  const oxygen = text ? parseFloat(text) : undefined;
                  handleInputChange('dissolved_oxygen', oxygen);
                }}
                placeholder="Enter DO level (e.g., 8.5)"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                💡 Good range: 5-12 mg/L for healthy fish activity
              </Text>
            </View>

            {/* Water Condition Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Water Condition Tips</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • <Text style={styles.tipBold}>Clear water:</Text> Use natural colors, smaller flies
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • <Text style={styles.tipBold}>Murky water:</Text> Use bright colors, larger flies
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • <Text style={styles.tipBold}>Fast flow:</Text> Use weighted flies, fish eddies
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • <Text style={styles.tipBold}>High water:</Text> Fish near banks, use streamers
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>
                  • <Text style={styles.tipBold}>Low water:</Text> Use dry flies, be stealthy
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
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
  helperText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
    fontStyle: 'italic',
  },
  advancedButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
    marginBottom: 15,
  },
  advancedButtonText: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  tipsContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
