import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function TestFeedbackPermissions() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testReadPermissions = async () => {
    try {
      addResult('Testing READ permissions...');
      const { data, error } = await supabase
        .from('feedback')
        .select('id, title, status')
        .limit(5);

      if (error) {
        addResult(`READ ERROR: ${error.message}`);
        return;
      }

      addResult(`READ SUCCESS: Found ${data?.length || 0} feedback items`);
    } catch (error) {
      addResult(`READ EXCEPTION: ${error.message}`);
    }
  };

  const testUpdatePermissions = async () => {
    try {
      addResult('Testing UPDATE permissions...');
      
      // First, get a feedback item to update
      const { data: feedbackData, error: fetchError } = await supabase
        .from('feedback')
        .select('id, status')
        .limit(1);

      if (fetchError || !feedbackData?.length) {
        addResult(`UPDATE ERROR: No feedback found to test with`);
        return;
      }

      const feedbackId = feedbackData[0].id;
      const currentStatus = feedbackData[0].status;
      const newStatus = currentStatus === 'pending' ? 'in_review' : 'pending';

      addResult(`Attempting to update feedback ${feedbackId} from ${currentStatus} to ${newStatus}`);

      const { data, error } = await supabase
        .from('feedback')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedbackId)
        .select();

      if (error) {
        addResult(`UPDATE ERROR: ${error.message}`);
        return;
      }

      addResult(`UPDATE SUCCESS: Updated feedback ${feedbackId}`);
    } catch (error) {
      addResult(`UPDATE EXCEPTION: ${error.message}`);
    }
  };

  const testDeletePermissions = async () => {
    try {
      addResult('Testing DELETE permissions...');
      
      // First, create a test feedback item to delete
      const { data: insertData, error: insertError } = await supabase
        .from('feedback')
        .insert({
          user_id: 'test-user-id',
          type: 'general_feedback',
          title: 'Test Feedback for Deletion',
          description: 'This is a test feedback item that will be deleted',
          priority: 'low'
        })
        .select();

      if (insertError) {
        addResult(`DELETE ERROR: Could not create test feedback - ${insertError.message}`);
        return;
      }

      const testFeedbackId = insertData[0].id;
      addResult(`Created test feedback ${testFeedbackId}, now attempting to delete...`);

      const { error: deleteError } = await supabase
        .from('feedback')
        .delete()
        .eq('id', testFeedbackId);

      if (deleteError) {
        addResult(`DELETE ERROR: ${deleteError.message}`);
        return;
      }

      addResult(`DELETE SUCCESS: Deleted test feedback ${testFeedbackId}`);
    } catch (error) {
      addResult(`DELETE EXCEPTION: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('Starting permission tests...');
    
    await testReadPermissions();
    await testUpdatePermissions();
    await testDeletePermissions();
    
    addResult('All tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedback Permissions Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testReadPermissions}>
          <Text style={styles.buttonText}>Test READ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUpdatePermissions}>
          <Text style={styles.buttonText}>Test UPDATE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testDeletePermissions}>
          <Text style={styles.buttonText}>Test DELETE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.runAllButton]} onPress={runAllTests}>
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffd33d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  runAllButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    padding: 15,
  },
  resultText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
