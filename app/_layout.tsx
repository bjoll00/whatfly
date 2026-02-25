import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { AuthProvider } from '../lib/AuthContext';
import { FishingProvider } from '../lib/FishingContext';
import { asyncStoragePersister, queryClient } from '../lib/queryClient';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links when app is already running
    const handleDeepLink = (url: string) => {
      console.log('RootLayout: Received deep link:', url);
      
      // Check if it's an email verification link
      if (url.includes('whatfly://auth?verified=true')) {
        console.log('RootLayout: Email verification deep link detected');
        router.push('/auth?verified=true');
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle deep link if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [router]);

  return (
    <AuthProvider>
      <PersistQueryClientProvider 
        client={queryClient} 
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <FishingProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin-feedback" options={{ title: 'Admin - Feedback Management' }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="create-post" options={{ headerShown: false }} />
          <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="edit-post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="feedback" options={{ headerShown: false }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
          <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
          <Stack.Screen name="log-catch" options={{ headerShown: false }} />
          <Stack.Screen name="username-setup" options={{ headerShown: false }} />
          <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        </Stack>
        </FishingProvider>
      </PersistQueryClientProvider>
    </AuthProvider>
  );
}