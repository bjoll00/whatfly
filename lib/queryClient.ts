import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

// Query client with offline-first settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 mins
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Refetch when network reconnects
      networkMode: 'offlineFirst', // Use cache first, then network
    },
  },
});

// AsyncStorage persister for offline support
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'whatfly-query-cache',
  throttleTime: 1000, // Only persist every 1 second to avoid performance issues
});
