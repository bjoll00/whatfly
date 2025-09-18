import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="debug" options={{ title: 'Debug' }} />
        <Stack.Screen name="admin-feedback" options={{ title: 'Admin - Feedback Management' }} />
        <Stack.Screen name="test-feedback-permissions" options={{ title: 'Test Feedback Permissions' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}