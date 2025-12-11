import React, { useEffect, useState, useCallback } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUserStore } from '../src/store/userStore';
import { useOfflineQueueStore } from '../src/store/offlineQueueStore';
import { api } from '../src/api/client';
import { useOfflineSync } from '../src/hooks/useOfflineSync';
import { useThemeStore } from '../src/store/themeStore';

const queryClient = new QueryClient();

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted after first render cycle completes
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)' as any);
    }
  }, [isAuthenticated, segments, isMounted, router]);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useUserStore((s) => s.token);
  const loadQueue = useOfflineQueueStore((s) => s.loadQueue);
  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    // Delay loadQueue to ensure native modules are ready
    const timer = setTimeout(() => {
      loadQueue();
    }, 100);
    return () => clearTimeout(timer);
  }, [loadQueue]);

  useOfflineSync(isAuthenticated);
  useProtectedRoute(isAuthenticated);

  return <>{children}</>;
}

export default function RootLayout() {
  const scheme = useThemeStore((s) => s.scheme);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthProvider>
              <Slot />
            </AuthProvider>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
