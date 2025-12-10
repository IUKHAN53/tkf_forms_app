import React, { useEffect } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { useForms } from '../../hooks/useForms';
import { useOfflineQueueStore } from '../../store/offlineQueueStore';
import { useUserStore } from '../../store/userStore';
import { useThemeColors, useThemeStore } from '../../store/themeStore';

const fadeIn = () => {
  const opacity = new Animated.Value(0);
  Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  return opacity;
};

export type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<HomeProps> = ({ navigation }) => {
  const { data, isLoading, refetch } = useForms();
  const queueCount = useOfflineQueueStore((s) => s.queue.length);
  const lastSyncAt = useOfflineQueueStore((s) => s.lastSyncAt);
  const syncStatus = useOfflineQueueStore((s) => s.syncStatus);
  const user = useUserStore((s) => s.user);
  const { colors, scheme } = useThemeColors();
  const toggleTheme = useThemeStore((s) => s.toggle);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const stats = [
    { label: 'Active forms', value: data?.length ?? 0 },
    { label: 'Pending offline', value: queueCount },
    { label: 'Last sync', value: lastSyncAt ? new Date(lastSyncAt).toLocaleString() : '—' },
  ];

  if (isLoading && !data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} className="px-5 py-6">
      <Text style={{ color: colors.text }} className="text-3xl font-bold mb-2">Welcome{user ? `, ${user.name}` : ''}</Text>
      <Text style={{ color: colors.muted }} className="mb-6">Track your forms and sync status at a glance.</Text>

      <Pressable onPress={toggleTheme} className="self-start mb-4 px-3 py-2 rounded-lg" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
        <Text style={{ color: colors.text }}>Switch to {scheme === 'dark' ? 'Light' : 'Dark'} mode</Text>
      </Pressable>

      <View className="space-y-3 mb-6">
        {stats.map((item) => {
          const opacity = fadeIn();
          return (
            <Animated.View
              key={item.label}
              style={{ opacity, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
              className="rounded-2xl px-4 py-3"
            >
              <Text style={{ color: colors.muted }} className="text-sm mb-1">{item.label}</Text>
              <Text style={{ color: colors.text }} className="text-xl font-semibold">{item.value}</Text>
            </Animated.View>
          );
        })}
      </View>

      {syncStatus === 'syncing' ? (
        <View
          className="mb-4 rounded-xl px-4 py-3"
          style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text style={{ color: colors.text }}>Syncing offline submissions...</Text>
        </View>
      ) : null}
      {syncStatus === 'error' ? (
        <View
          className="mb-4 rounded-xl px-4 py-3"
          style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text style={{ color: colors.text }}>Sync paused after an error. Will retry.</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => navigation.navigate('FormList')}
        className="rounded-xl py-4 px-4 items-center mb-3"
        style={{ backgroundColor: colors.primary }}
      >
        <Text style={{ color: '#fff' }} className="text-lg font-semibold">Browse Forms</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('FormList')}
        className="rounded-xl py-4 px-4 items-center"
        style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
      >
        <Text style={{ color: colors.text }} className="font-semibold">View Submissions</Text>
      </Pressable>
    </View>
  );
};
