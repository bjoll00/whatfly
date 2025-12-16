import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.content}>
          {/* Last Updated */}
          <Text style={styles.lastUpdated}>Last Updated: December 15, 2024</Text>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to WhatFly ("we," "our," or "us"). We are committed to protecting your 
              privacy and ensuring you have a positive experience using our fly fishing 
              companion app. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our mobile application.
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
            
            <Text style={styles.subheading}>Account Information</Text>
            <Text style={styles.paragraph}>
              When you create an account, we collect:{'\n'}
              • Email address{'\n'}
              • Username{'\n'}
              • Profile information (optional: location, fishing experience level, bio)
            </Text>

            <Text style={styles.subheading}>Location Data</Text>
            <Text style={styles.paragraph}>
              With your permission, we collect location data to:{'\n'}
              • Show fishing conditions for your area{'\n'}
              • Provide relevant fly suggestions based on local conditions{'\n'}
              • Display nearby rivers and fishing spots{'\n\n'}
              You can disable location access at any time through your device settings.
            </Text>

            <Text style={styles.subheading}>Usage Data</Text>
            <Text style={styles.paragraph}>
              We automatically collect:{'\n'}
              • App usage patterns{'\n'}
              • Feature interactions{'\n'}
              • Device information (device type, operating system){'\n'}
              • Crash logs and error reports
            </Text>

            <Text style={styles.subheading}>User-Generated Content</Text>
            <Text style={styles.paragraph}>
              If you post content, we collect:{'\n'}
              • Posts, photos, and catch reports{'\n'}
              • Comments and messages{'\n'}
              • Fly fishing tips and recommendations you share
            </Text>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use the information we collect to:{'\n\n'}
              • Provide and maintain the WhatFly app{'\n'}
              • Personalize fly suggestions based on conditions{'\n'}
              • Display relevant weather and water data{'\n'}
              • Enable social features and community interaction{'\n'}
              • Send important app updates and notifications{'\n'}
              • Improve our services and develop new features{'\n'}
              • Respond to customer support requests{'\n'}
              • Detect and prevent fraud or abuse
            </Text>
          </View>

          {/* Data Sharing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Share Your Information</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal information. We may share data with:{'\n\n'}
              <Text style={styles.bold}>Service Providers:</Text> Third-party services that 
              help us operate the app (hosting, analytics, weather data providers).{'\n\n'}
              <Text style={styles.bold}>Other Users:</Text> Information you choose to make 
              public (posts, profile info, catch reports) is visible to other users.{'\n\n'}
              <Text style={styles.bold}>Legal Requirements:</Text> When required by law or 
              to protect our rights and safety.
            </Text>
          </View>

          {/* Third-Party Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Third-Party Services</Text>
            <Text style={styles.paragraph}>
              WhatFly integrates with third-party services:{'\n\n'}
              • <Text style={styles.bold}>Supabase:</Text> For secure authentication and data storage{'\n'}
              • <Text style={styles.bold}>Weather APIs:</Text> To provide current conditions{'\n'}
              • <Text style={styles.bold}>USGS:</Text> For water flow and temperature data{'\n'}
              • <Text style={styles.bold}>Mapbox:</Text> For mapping and location services{'\n\n'}
              These services have their own privacy policies governing their use of data.
            </Text>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate security measures to protect your personal information, 
              including:{'\n\n'}
              • Encrypted data transmission (HTTPS/TLS){'\n'}
              • Secure password hashing{'\n'}
              • Regular security audits{'\n'}
              • Access controls for our team{'\n\n'}
              However, no method of transmission over the internet is 100% secure. We cannot 
              guarantee absolute security.
            </Text>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rights & Choices</Text>
            <Text style={styles.paragraph}>
              You have the right to:{'\n\n'}
              • <Text style={styles.bold}>Access:</Text> Request a copy of your personal data{'\n'}
              • <Text style={styles.bold}>Update:</Text> Correct inaccurate information in your profile{'\n'}
              • <Text style={styles.bold}>Delete:</Text> Request deletion of your account and data{'\n'}
              • <Text style={styles.bold}>Opt-out:</Text> Disable location services or notifications{'\n'}
              • <Text style={styles.bold}>Export:</Text> Request your data in a portable format{'\n\n'}
              To exercise these rights, go to Settings {'>'} Delete Account or contact us at 
              whatflyfishing@gmail.com.
            </Text>
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your personal data for as long as your account is active or as needed 
              to provide services. When you delete your account, we will delete your personal 
              information within 30 days, except where we are required to retain it for legal 
              purposes.
            </Text>
          </View>

          {/* Children's Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
            <Text style={styles.paragraph}>
              WhatFly is not intended for users under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you believe we have 
              collected information from a child under 13, please contact us immediately.
            </Text>
          </View>

          {/* Changes to Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new policy in the app and updating the "Last Updated" 
              date. Continued use of the app after changes constitutes acceptance of the 
              revised policy.
            </Text>
          </View>

          {/* Contact Us */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about this Privacy Policy or our data practices, 
              please contact us at:{'\n\n'}
              📧 Email: whatflyfishing@gmail.com{'\n\n'}
              We aim to respond to all inquiries within 48 hours.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🎣 Thank you for trusting WhatFly with your information.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffd33d',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    marginTop: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

