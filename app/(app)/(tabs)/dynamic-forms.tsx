import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../../src/store/themeStore';
import { useForms } from '../../../src/hooks/useForms';
import { SafeAreaView } from 'react-native-safe-area-context';

const FORM_COLORS = [
  ['#6366f1', '#8b5cf6'],
  ['#22c55e', '#16a34a'],
  ['#f59e0b', '#d97706'],
  ['#ec4899', '#db2777'],
  ['#14b8a6', '#0d9488'],
  ['#3b82f6', '#2563eb'],
  ['#a855f7', '#9333ea'],
  ['#ef4444', '#dc2626'],
] as const;

const FORM_ICONS = ['📋', '📝', '📊', '📑', '📄', '🗂️', '📃', '📜'];

export default function DynamicFormsScreen() {
  const router = useRouter();
  const { colors, scheme } = useThemeColors();
  const { data: forms, isLoading, refetch } = useForms();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <LinearGradient
        colors={scheme === 'dark' ? ['#1e3a5f', '#1e1b4b'] : ['#3b82f6', '#6366f1']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Dynamic Forms</Text>
        <Text style={styles.headerSubtitle}>Custom forms created by administrators</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading forms...</Text>
          </View>
        ) : forms && forms.length > 0 ? (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{forms.length}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Forms</Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: '#22c55e' }]}>
                  {forms.filter((f) => f.is_active).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Active</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Forms</Text>

            {forms.map((form, index) => (
              <Pressable
                key={form.id}
                onPress={() => router.push(`/forms/${form.id}` as any)}
                style={styles.cardWrapper}
              >
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <LinearGradient
                    colors={FORM_COLORS[index % FORM_COLORS.length] as [string, string]}
                    style={styles.cardIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.cardIconText}>{FORM_ICONS[index % FORM_ICONS.length]}</Text>
                  </LinearGradient>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{form.name}</Text>
                    <Text style={[styles.cardDescription, { color: colors.muted }]} numberOfLines={2}>
                      {form.description || 'No description available'}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Text style={[styles.cardMetaText, { color: colors.muted }]}>
                        {form.fields?.length || 0} fields
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: form.is_active ? '#22c55e20' : '#ef444420' },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: form.is_active ? '#22c55e' : '#ef4444' }]}
                        >
                          {form.is_active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.cardArrow, { color: colors.muted }]}>→</Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Forms Available</Text>
            <Text style={[styles.emptyDescription, { color: colors.muted }]}>
              Dynamic forms will appear here once they are created by administrators.
            </Text>
            <Pressable
              onPress={onRefresh}
              style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: -15,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  statBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 5,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIconText: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardMetaText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardArrow: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
