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

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
            <Text style={styles.sectionTitle}>Agreement to Terms</Text>
            <Text style={styles.paragraph}>
              Welcome to WhatFly! These Terms of Service ("Terms") govern your use of the 
              WhatFly mobile application ("App") operated by WhatFly ("we," "us," or "our").
              {'\n\n'}
              By accessing or using the App, you agree to be bound by these Terms. If you 
              disagree with any part of these Terms, you may not access the App.
            </Text>
          </View>

          {/* Use License */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Use License</Text>
            <Text style={styles.paragraph}>
              We grant you a limited, non-exclusive, non-transferable, revocable license to 
              use the App for your personal, non-commercial fly fishing activities.
              {'\n\n'}
              This license does not include:{'\n'}
              • Modifying or copying App materials{'\n'}
              • Using materials for commercial purposes{'\n'}
              • Attempting to reverse engineer the App{'\n'}
              • Removing any copyright or proprietary notations{'\n'}
              • Transferring the license to another person
            </Text>
          </View>

          {/* Account Responsibilities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Responsibilities</Text>
            <Text style={styles.paragraph}>
              When you create an account, you agree to:{'\n\n'}
              • Provide accurate and complete information{'\n'}
              • Maintain the security of your account credentials{'\n'}
              • Promptly update any changes to your information{'\n'}
              • Accept responsibility for all activities under your account{'\n'}
              • Notify us immediately of any unauthorized access{'\n\n'}
              You must be at least 13 years old to create an account and use the App.
            </Text>
          </View>

          {/* Acceptable Use */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceptable Use</Text>
            <Text style={styles.paragraph}>
              You agree NOT to use the App to:{'\n\n'}
              • Violate any laws or regulations{'\n'}
              • Harass, abuse, or harm other users{'\n'}
              • Post false, misleading, or deceptive content{'\n'}
              • Impersonate others or misrepresent your identity{'\n'}
              • Spam, advertise, or solicit without permission{'\n'}
              • Upload malware, viruses, or malicious code{'\n'}
              • Interfere with the App's operation or security{'\n'}
              • Scrape or collect user data without consent{'\n'}
              • Circumvent any access restrictions
            </Text>
          </View>

          {/* User Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Content</Text>
            <Text style={styles.paragraph}>
              You retain ownership of content you post (photos, catch reports, tips). By 
              posting content, you grant us a non-exclusive, royalty-free, worldwide license 
              to use, display, and distribute your content within the App.
              {'\n\n'}
              You are responsible for your content and represent that:{'\n'}
              • You own the content or have rights to post it{'\n'}
              • Your content doesn't violate others' rights{'\n'}
              • Your content is accurate and not misleading{'\n\n'}
              We may remove content that violates these Terms at our discretion.
            </Text>
          </View>

          {/* Fishing Information Disclaimer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fishing Information Disclaimer</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Important:</Text> WhatFly provides fly suggestions, 
              weather data, and fishing conditions for informational purposes only.
              {'\n\n'}
              We do not guarantee:{'\n'}
              • Accuracy of fly recommendations{'\n'}
              • Fishing success or catch rates{'\n'}
              • Real-time accuracy of weather or water data{'\n'}
              • Availability of fish at any location{'\n\n'}
              You are responsible for:{'\n'}
              • Verifying local fishing regulations{'\n'}
              • Obtaining required licenses and permits{'\n'}
              • Following catch limits and seasonal restrictions{'\n'}
              • Your personal safety while fishing{'\n\n'}
              Always check official sources for current regulations in your area.
            </Text>
          </View>

          {/* Third-Party Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Third-Party Services</Text>
            <Text style={styles.paragraph}>
              The App integrates with third-party services (weather APIs, mapping services, 
              USGS data). These services are governed by their own terms and conditions.
              {'\n\n'}
              We are not responsible for:{'\n'}
              • Third-party service availability or accuracy{'\n'}
              • Changes to third-party services{'\n'}
              • Third-party terms or privacy practices
            </Text>
          </View>

          {/* Intellectual Property */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The App and its original content, features, and functionality are owned by 
              WhatFly and are protected by copyright, trademark, and other intellectual 
              property laws.
              {'\n\n'}
              Our trademarks and trade dress may not be used without our prior written consent.
            </Text>
          </View>

          {/* Subscription & Payments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscriptions & Payments</Text>
            <Text style={styles.paragraph}>
              Some features may require a paid subscription. By subscribing, you agree to:{'\n\n'}
              • Pay all fees associated with your subscription{'\n'}
              • Automatic renewal unless cancelled before the renewal date{'\n'}
              • Cancellation through your app store account settings{'\n\n'}
              Refunds are handled according to the respective app store policies 
              (Apple App Store or Google Play Store).
            </Text>
          </View>

          {/* Limitation of Liability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              To the maximum extent permitted by law, WhatFly shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages resulting from:{'\n\n'}
              • Your use or inability to use the App{'\n'}
              • Any fishing activities or decisions{'\n'}
              • Errors or inaccuracies in content{'\n'}
              • Unauthorized access to your account{'\n'}
              • Any third-party conduct or content{'\n\n'}
              Our total liability shall not exceed the amount you paid us in the past 12 months.
            </Text>
          </View>

          {/* Disclaimer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disclaimer</Text>
            <Text style={styles.paragraph}>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              {'\n\n'}
              We do not warrant that the App will be uninterrupted, secure, or error-free.
            </Text>
          </View>

          {/* Termination */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account immediately, without prior notice, 
              for any reason, including breach of these Terms.
              {'\n\n'}
              Upon termination:{'\n'}
              • Your right to use the App ceases immediately{'\n'}
              • We may delete your account and content{'\n'}
              • Provisions that should survive termination will remain in effect
            </Text>
          </View>

          {/* Changes to Terms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify these Terms at any time. We will notify users 
              of significant changes through the App or via email.
              {'\n\n'}
              Continued use of the App after changes constitutes acceptance of the revised Terms.
            </Text>
          </View>

          {/* Governing Law */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of 
              the United States, without regard to conflict of law provisions.
              {'\n\n'}
              Any disputes arising from these Terms will be resolved through binding 
              arbitration, except where prohibited by law.
            </Text>
          </View>

          {/* Contact Us */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about these Terms of Service, please contact us at:
              {'\n\n'}
              📧 Email: whatflyfishing@gmail.com
              {'\n\n'}
              We aim to respond to all inquiries within 48 hours.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🎣 Tight lines and happy fishing!
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

