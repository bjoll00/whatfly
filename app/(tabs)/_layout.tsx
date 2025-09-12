import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../lib/AuthContext';

export default function TabLayout() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // If user is not authenticated, redirect to auth
  if (!user) {
    console.log('TabLayout: No user, redirecting to auth');
    return <Redirect href="/auth" />;
  }

  const handleSignOut = () => {
    console.log('TabLayout: Sign out button pressed');
    console.log('TabLayout: Showing alert dialog...');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('TabLayout: User cancelled sign out')
        },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            console.log('TabLayout: User confirmed sign out');
            setIsSigningOut(true);
            try {
              console.log('TabLayout: Calling signOut...');
              await signOut();
              console.log('TabLayout: Sign out completed');
            } catch (error) {
              console.error('TabLayout: Sign out error:', error);
            } finally {
              setIsSigningOut(false);
            }
          }
        },
      ]
    );
  };

  const handleDirectSignOut = async () => {
    console.log('TabLayout: Direct sign out called');
    setIsSigningOut(true);
    try {
      console.log('TabLayout: Calling signOut...');
      await signOut();
      console.log('TabLayout: Sign out completed');
    } catch (error) {
      console.error('TabLayout: Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#ffd33d',
            headerStyle: {
                backgroundColor: '#25292e'
            },
            headerShadowVisible: false,
            headerTintColor: '#fff',
            tabBarStyle: {
                backgroundColor: '#25292e',
            },
            headerRight: () => (
              <TouchableOpacity 
                onPress={() => {
                  console.log('TabLayout: TouchableOpacity pressed');
                  handleDirectSignOut();
                }} 
                style={{ marginRight: 15, opacity: isSigningOut ? 0.5 : 1 }}
                disabled={isSigningOut}
              >
                <Ionicons 
                  name={isSigningOut ? "hourglass-outline" : "log-out-outline"} 
                  size={24} 
                  color="#ffd33d" 
                />
              </TouchableOpacity>
            ),
        }}
        >

        <Tabs.Screen name="index" options={{ title: 'Home',
        tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
        }} />
        <Tabs.Screen name="whatfly/index" options={{ title: 'What Fly', tabBarIcon: ({ color, focused }) => (
            <AntDesign name={focused ? 'question-circle' : 'question-circle'} size={24} color={color} />
        ),
    }}/>
        <Tabs.Screen name="catchlog" options={{ title: 'Catch Log', tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ?'fish-sharp' : 'fish-outline'} color={color} size={24} />
            ),
        }} />
    </Tabs>
  );
}