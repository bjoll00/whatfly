// components/PremiumUpgradeModal.tsx
// Premium upgrade modal component

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { StripeService } from '../lib/stripeService';

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
  currentPlan?: string;
  feature?: string; // Specific feature that triggered the upgrade prompt
}

export default function PremiumUpgradeModal({
  visible,
  onClose,
  onUpgrade,
  currentPlan,
  feature
}: PremiumUpgradeModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$2.99',
      period: 'month',
      description: 'Perfect for casual anglers',
      features: [
        'Enhanced fly suggestions',
        'Basic weather integration',
        '50 catch logs per month',
        'Export catch data'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$7.99',
      period: 'month',
      description: 'Most popular for serious anglers',
      features: [
        'Unlimited fly suggestions',
        'Unlimited catch logs',
        'Advanced weather data',
        'Fly tying guides',
        'Community features',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'guide',
      name: 'Guide',
      price: '$14.99',
      period: 'month',
      description: 'For professional guides',
      features: [
        'Everything in Pro',
        'Live weather data',
        'USGS river flow data',
        'Expert guide tips',
        'Advanced analytics',
        'Personal fishing insights'
      ],
      popular: false
    }
  ];

  const getFeatureDescription = (feature?: string) => {
    switch (feature) {
      case 'unlimited_fly_suggestions':
        return 'Get unlimited fly suggestions instead of just 3!';
      case 'unlimited_catch_logs':
        return 'Log unlimited fishing trips instead of just 10!';
      case 'advanced_weather':
        return 'Get real-time weather data for better recommendations!';
      default:
        return 'Upgrade to unlock premium features and improve your fishing success!';
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to upgrade to premium.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const { success, error } = await StripeService.createSubscription(user.id, selectedPlan);
      
      if (success) {
        // The user will be redirected to Stripe Checkout
        // The webhook will handle updating their premium status
        onUpgrade(selectedPlan);
      } else {
        Alert.alert(
          'Upgrade Failed',
          error || 'Failed to start upgrade process. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.title}>🚀 Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              {getFeatureDescription(feature)}
            </Text>
          </View>

          <ScrollView style={styles.plansContainer} showsVerticalScrollIndicator={false}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlan,
                  plan.popular && styles.popularPlan
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.period}>/{plan.period}</Text>
                  </View>
                </View>
                
                <Text style={styles.planDescription}>{plan.description}</Text>
                
                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.upgradeButton, 
                selectedPlan && styles.upgradeButtonActive,
                isProcessing && styles.disabledButton
              ]}
              onPress={handleUpgrade}
              disabled={isProcessing}
            >
              <Text style={[
                styles.upgradeButtonText,
                isProcessing && styles.disabledButtonText
              ]}>
                {isProcessing 
                  ? 'Processing...' 
                  : `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name}`
                }
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.disclaimer}>
              Cancel anytime. No hidden fees.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#25292e',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#444',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    paddingHorizontal: 24,
    maxHeight: 400,
  },
  planCard: {
    backgroundColor: '#1a1d21',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#ffd33d',
  },
  popularPlan: {
    borderColor: '#4ade80',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: 20,
    backgroundColor: '#4ade80',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  popularText: {
    color: '#1a1d21',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  period: {
    fontSize: 14,
    color: '#cccccc',
    marginLeft: 2,
  },
  planDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#666',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonActive: {
    backgroundColor: '#ffd33d',
  },
  upgradeButtonText: {
    color: '#1a1d21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
