import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation';
import { useUserStore } from './src/store/userStore';
import { useOfflineQueueStore } from './src/store/offlineQueueStore';
import { api } from './src/api/client';
import { useOfflineSync } from './src/hooks/useOfflineSync';
import { useThemeStore } from './src/store/themeStore';

const queryClient = new QueryClient();

export default function App() {
  const token = useUserStore((s) => s.token);
  const loadQueue = useOfflineQueueStore((s) => s.loadQueue);
  const isAuthenticated = !!token;
  const scheme = useThemeStore((s) => s.scheme);

  React.useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  React.useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useOfflineSync(isAuthenticated);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppNavigator isAuthenticated={isAuthenticated} />
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
