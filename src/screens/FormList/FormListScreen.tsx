import React from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useNavigation, useLayoutEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForms } from '../../hooks/useForms';
import { RootStackParamList } from '../../navigation';
import { useUserStore } from '../../store/userStore';
import { useOfflineQueueStore } from '../../store/offlineQueueStore';
import { useThemeColors } from '../../store/themeStore';

export const FormListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, isError, refetch } = useForms();
  const clearSession = useUserStore((s) => s.clearSession);
  const queueCount = useOfflineQueueStore((s) => s.queue.length);
  const { colors } = useThemeColors();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={clearSession} className="px-3 py-1 rounded-lg bg-slate-800">
          <Text className="text-white text-sm">Logout</Text>
        </Pressable>
      ),
    });
  }, [navigation, clearSession]);

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
