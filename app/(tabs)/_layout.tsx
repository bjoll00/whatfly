import Ionicons from '@expo/vector-icons/Ionicons';
import {router, Tabs} from 'expo-router';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useAuth} from '../../lib/AuthContext';
import ProfileScreen from "@/app/(tabs)/profile";

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

  const HeaderRight = () => (
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
      <TouchableOpacity onPress={() => router.push('/profile')}>
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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e'
        },
        headerShadowVisible: false,
        headerTintColor: '#25292e',
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
        name="feedback/index"
        options={{
          title: 'Feedback',
          tabBarIcon: ({color, focused}) => (
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
          tabBarIcon: ({color, focused}) => (
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
const styles = StyleSheet.create({
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

});
