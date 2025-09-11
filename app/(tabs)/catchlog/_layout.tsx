import { Stack } from 'expo-router';

    export default function CatchLogLayout() {
      return (
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,   // 🚀 hides the extra "index" header
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              title: 'History',
              headerStyle: {
                backgroundColor: '#25292e', // Background color of the header
              },
              headerTintColor: '#fff', // Color of the back button and title
            }}
          />
          <Stack.Screen
            name="newlog"
            options={{
              title: 'New Log',
              headerStyle: {
                backgroundColor: '#25292e', // Background color of the header
              },
              headerTintColor: '#fff', // Color of the back button and title
            }}
          />
        </Stack>
      );
    }