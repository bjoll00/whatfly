import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/AuthContext';

const BrownTroutLogo = require('@/assets/images/Brown_trout_logo (2).png');

export default function TabLayout() {
  const {user, profile} = useAuth();


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
  function HeaderRight(){
  if (!user) {
    return null; // or a loading indicator
  }
  return (
    <View style={{
      marginRight: 40,
      marginBottom: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: '#303030',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
        {profile?.avatar_url ? (
          <Image
            source={{uri: profile.avatar_url}}
            style={styles.avatar}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="#666"/>
        )}
      </TouchableOpacity>
    </View>
  );
  }

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
        headerLeft: () => <HeaderLeft/>,
        headerRight: () => <HeaderRight/>,
        headerTitle: '',
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({color, focused}) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={24}/>
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
          headerShown: false,
        }} 
      />
      <Tabs.Screen 
        name="messages" 
        options={{ 
          title: 'Messages', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} size={24} />
          ),
          headerShown: false,
        }} 
      />
      <Tabs.Screen 
        name="feedback/index" 
        options={{ 
          href: null, // Hidden from tab bar, accessible via profile settings
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: profile?.avatar_url ? () => null : 'Profile',
          tabBarIcon: ({color, focused}) => (
            profile?.avatar_url ? (
              <View style={[
                styles.tabAvatar,
                focused && styles.tabAvatarFocused
              ]}>
                <Image
                  source={{uri: profile.avatar_url}}
                  style={styles.tabAvatarImage}
                />
              </View>
            ) : (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                color={color}
                size={24}
              />
            )
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
const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabAvatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginTop: 15,
  },
  tabAvatarFocused: {
    borderColor: '#ffd33d',
  },
  tabAvatarImage: {
    width: '100%',
    height: '100%',
  },
});
