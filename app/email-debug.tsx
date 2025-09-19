import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function EmailDebugScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { resetPassword } = useAuth();
  const router = useRouter();

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const handleTestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    setLoading(true);
    setDebugInfo([]);
    
    try {
      addDebugInfo(`Starting password reset for: ${email}`);
      addDebugInfo(`Current app URL: ${typeof window !== 'undefined' ? window.location.origin : 'Unknown'}`);
      
      const { error } = await resetPassword(email);
      
      if (error) {
        addDebugInfo(`❌ Error: ${error.message}`);
        Alert.alert('Reset Failed', `Failed to send reset email: ${error.message}`);
      } else {
        addDebugInfo('✅ Password reset request sent successfully');
        addDebugInfo('📧 Check your email (including spam folder)');
        addDebugInfo('🔗 Look for email from: noreply@supabase.co');
        
        Alert.alert(
          'Reset Email Sent!',
          `Password reset email sent to ${email}. Check your email and spam folder.`,
          [
            {
              text: 'Check Email',
              onPress: () => {
                addDebugInfo('📬 Please check your email for the reset link');
              }
            },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      addDebugInfo(`❌ Unexpected error: ${error}`);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Email Debug Tool</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#8E8E93"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleTestReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugSection}>
        <View style={styles.debugHeader}>
          <Text style={styles.debugTitle}>Debug Information:</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearDebugInfo}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.debugContainer}>
          {debugInfo.length === 0 ? (
            <Text style={styles.debugPlaceholder}>Debug information will appear here...</Text>
          ) : (
            debugInfo.map((info, index) => (
              <Text key={index} style={styles.debugText}>{info}</Text>
            ))
          )}
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Troubleshooting Steps:</Text>
        <Text style={styles.instructionText}>1. Enter your email address</Text>
        <Text style={styles.instructionText}>2. Click "Send Reset Email"</Text>
        <Text style={styles.instructionText}>3. Check your email immediately</Text>
        <Text style={styles.instructionText}>4. Look in spam folder if not in inbox</Text>
        <Text style={styles.instructionText}>5. Check debug information above</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/reset-password')}
        >
          <Text style={styles.linkText}>Go to Reset Password Page</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd33d',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1d21',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugSection: {
    marginBottom: 30,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  debugTitle: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  debugContainer: {
    backgroundColor: '#1a1d21',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ade80',
    minHeight: 150,
  },
  debugPlaceholder: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 50,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  instructions: {
    backgroundColor: '#1a1d21',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffd33d',
    marginBottom: 30,
  },
  instructionsTitle: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
  actions: {
    marginBottom: 30,
  },
  linkButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
