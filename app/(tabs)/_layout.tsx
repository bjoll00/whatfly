import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/AuthContext';

const BrownTroutLogo = require('@/assets/images/Brown_trout_logo (2).png');

export default function TabLayout() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Allow guest access - users can use basic features without login
  // Only redirect to auth for account-specific features

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
    <View style={{ marginRight: 15 }}>
      {user ? (
        // Authenticated user - show sign out button
        <TouchableOpacity 
          onPress={() => {
            console.log('TabLayout: TouchableOpacity pressed');
            handleDirectSignOut();
          }} 
          style={{ 
            opacity: isSigningOut ? 0.5 : 1 
          }}
          disabled={isSigningOut}
        >
          <Ionicons 
            name={isSigningOut ? "hourglass-outline" : "log-out-outline"} 
            size={24} 
            color="#ffd33d" 
          />
        </TouchableOpacity>
      ) : (
        // Guest user - show sign in button
        <TouchableOpacity 
          onPress={() => {
            console.log('TabLayout: Navigate to auth');
            router.push('/auth');
          }} 
        >
          <Ionicons 
            name="log-in-outline" 
            size={24} 
            color="#ffd33d" 
          />
        </TouchableOpacity>
      )}
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
            headerRight: () => <HeaderRight />,
            headerTitle: '',
        }}
        >

        <Tabs.Screen name="index" options={{ title: 'Home',
        tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
        }} />
        <Tabs.Screen name="whatfly/index" options={{ title: 'What Fly', tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 name={focused ? "mosquito" : "mosquito"} size={24} color={color} />
        ),
    }}/>
        <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={24} />
        ),
    }} />
        <Tabs.Screen name="catchlog" options={{ title: 'Catch Log', tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ?'fish-sharp' : 'fish-outline'} color={color} size={24} />
            ),
        }} />
        <Tabs.Screen 
            name="feedback/index" 
            options={{ 
                title: 'Feedback',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons 
                        name={focused ? 'heart' : 'heart-outline'} 
                        color={color} 
                        size={24} 
                    />
                ),
            }} 
        />
        <Tabs.Screen 
            name="settings" 
            options={{ 
                title: 'Settings',
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons 
                        name={focused ? 'settings' : 'settings-outline'} 
                        color={user ? color : '#666'} 
                        size={24} 
                    />
                ),
            }} 
        />
    </Tabs>
  );
}