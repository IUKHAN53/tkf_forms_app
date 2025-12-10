import React from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useNavigation, useLayoutEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForms } from '../../hooks/useForms';
import { RootStackParamList } from '../../navigation';
import { useUserStore } from '../../store/userStore';
import { useOfflineQueueStore } from '../../store/offlineQueueStore';
import { useThemeColors, useThemeStore } from '../../store/themeStore';

export const FormListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, isError, refetch } = useForms();
  const clearSession = useUserStore((s) => s.clearSession);
  const queueCount = useOfflineQueueStore((s) => s.queue.length);
  const syncStatus = useOfflineQueueStore((s) => s.syncStatus);
  const lastSyncAt = useOfflineQueueStore((s) => s.lastSyncAt);
  const { colors, scheme } = useThemeColors();
  const toggleTheme = useThemeStore((s) => s.toggle);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={toggleTheme}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>{scheme === 'dark' ? 'Light' : 'Dark'}</Text>
          </Pressable>
          <Pressable
            onPress={clearSession}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.primary,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, clearSession, toggleTheme, colors, scheme]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <Text style={{ color: colors.text }} className="mb-2">Failed to load forms</Text>
        <Pressable onPress={() => refetch()} className="px-4 py-2 rounded" style={{ backgroundColor: colors.primary }}>
          <Text style={{ color: '#fff' }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} className="p-4">
      <View
        className="mb-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }} className="mb-1">
          Sync status: {syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'error' ? 'Error' : 'Idle'}
        </Text>
        <Text style={{ color: colors.muted }}>
          Last sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Not synced yet'}
        </Text>
      </View>

      {queueCount > 0 && (
        <View
          className="mb-3 flex-row items-center justify-between rounded-xl px-4 py-3"
          style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text style={{ color: colors.text }}>Pending offline submissions</Text>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>{queueCount}</Text>
          </View>
        </View>
      )}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('FormDetail', { formId: item.id, form: item })}
            className="p-4 rounded-xl"
            style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text style={{ color: colors.text }} className="text-lg font-semibold">{item.name}</Text>
            {item.description ? <Text style={{ color: colors.muted }} className="mt-1">{item.description}</Text> : null}
            <Text style={{ color: colors.muted }} className="mt-2 text-xs">Version {item.version}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};
