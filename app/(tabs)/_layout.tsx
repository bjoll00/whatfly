import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';
import { useAuth } from '../../lib/AuthContext';

const BrownTroutLogo = require('@/assets/images/Brown_trout_logo (2).png');

export default function TabLayout() {
  const { user, isGuest, profile } = useAuth();

  const HeaderLeft = () => (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      minHeight: 60
    }}>
      <Image 
        source={BrownTroutLogo} 
        style={{ 
          width: 200, 
          height: 80,
          maxWidth: '90%'
        }} 
        resizeMode="contain" 
      />
    </View>
  );

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
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
      }}
    >
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: 'Map', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="feed" 
        options={{ 
          title: 'Feed', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'} color={color} size={24} />
          ),
          headerShown: false, // Feed has its own header
        }} 
      />
      <Tabs.Screen 
        name="feedback/index" 
        options={{ 
          title: 'Feedback',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'chatbubble' : 'chatbubble-outline'} 
              color={color} 
              size={24} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              color={color} 
              size={24} 
            />
          ),
        }} 
      />
      {/* Hide the old settings tab */}
      <Tabs.Screen 
        name="settings" 
        options={{ 
          href: null, // This hides the tab from navigation
        }} 
      />
    </Tabs>
  );
}