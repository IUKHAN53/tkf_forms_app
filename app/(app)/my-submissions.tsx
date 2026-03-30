import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../src/store/themeStore';
import { useDashboardStats } from '../../src/hooks/useDashboardStats';

type SubmissionCardProps = {
  title: string;
  count: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  colors: [string, string];
};

function SubmissionCard({ title, count, icon, colors }: SubmissionCardProps) {
  const { colors: themeColors } = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <LinearGradient colors={colors} style={styles.cardIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <MaterialIcons name={icon} size={28} color="#fff" />
      </LinearGradient>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.cardCount, { color: colors[0] }]}>{count} submissions</Text>
      </View>
    </View>
  );
}

export default function MySubmissionsScreen() {
  const { colors, scheme } = useThemeColors();
  const { stats, loading, error, refetch } = useDashboardStats();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const totals = stats?.totals ?? {
    child_line_lists: 0,
    fgds_community: 0,
    fgds_health_workers: 0,
    bridging_the_gap: 0,
  };

  const totalSubmissions = Object.values(totals).reduce((sum, val) => sum + val, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <LinearGradient
        colors={scheme === 'dark' ? ['#1e1b4b', '#312e81'] : ['#f59e0b', '#d97706']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>My Submissions</Text>
        <Text style={styles.headerSubtitle}>View all your submitted forms</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalCount}>{totalSubmissions}</Text>
          <Text style={styles.totalLabel}>Total Submissions</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading submissions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="warning" size={48} color="#f59e0b" style={{ marginBottom: 12 }} />
            <Text style={[styles.errorText, { color: colors.text }]}>Failed to load submissions</Text>
            <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Submissions by Form Type</Text>

            <SubmissionCard
              title="Child Line Lists"
              count={totals.child_line_lists}
              icon="child-care"
              colors={['#6366f1', '#8b5cf6']}
            />
            <SubmissionCard
              title="FGDs Community"
              count={totals.fgds_community}
              icon="groups"
              colors={['#22c55e', '#16a34a']}
            />
            <SubmissionCard
              title="FGDs Health Workers"
              count={totals.fgds_health_workers}
              icon="local-hospital"
              colors={['#f59e0b', '#d97706']}
            />
            <SubmissionCard
              title="Bridging The Gap"
              count={totals.bridging_the_gap}
              icon="compare-arrows"
              colors={['#ec4899', '#db2777']}
            />
          </>
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
  totalBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
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
  cardCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

