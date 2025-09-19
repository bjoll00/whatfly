import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAuth } from '../../lib/AuthContext';

const WhatflyImage = require('@/assets/images/grasshopper.jpg');
const LogImage = require('@/assets/images/square_cutthroat.jpg');


export default function Index() {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Index: Starting sign out...');
              await signOut();
              console.log('Index: Sign out completed');
            } catch (error) {
              console.error('Index: Sign out error:', error);
              Alert.alert('Error', 'Sign out failed');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer} >
        <Link href='/whatfly' >
          <View style={styles.buttonContainer}>
            <Image source={WhatflyImage} style={styles.image} />
            <Text style={styles.buttonLabel}>What Fly</Text>
          </View>
        </Link>
      
        <Link href='/catchlog' >
          <View style={styles.buttonContainer}>
            <Image source={LogImage} style={styles.image} />
            <Text style={styles.buttonLabel}>Catch Log</Text>
          </View>
        </Link>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Link href='/test-reset' style={styles.testLink}>
          <Text style={styles.testLinkText}>🔧 Test Password Reset</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 60,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  buttonContainer:{
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  buttonLabel: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 15,
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  testLink: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  testLinkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});