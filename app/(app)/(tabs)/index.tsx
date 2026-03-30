import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../src/store/themeStore';
import { useUserStore } from '../../../src/store/userStore';
import { useOfflineQueueStore } from '../../../src/store/offlineQueueStore';
import { useDashboardStats } from '../../../src/hooks/useDashboardStats';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const GRADIENT_CARDS = [
  { colors: ['#6366f1', '#8b5cf6'], icon: 'assignment' as const, label: 'Core Forms', route: '/core-forms' },
  { colors: ['#22c55e', '#16a34a'], icon: 'description' as const, label: 'Dynamic Forms', route: '/dynamic-forms' },
  { colors: ['#f59e0b', '#d97706'], icon: 'bar-chart' as const, label: 'My Submissions', route: '/my-submissions' },
  { colors: ['#ec4899', '#db2777'], icon: 'settings' as const, label: 'Settings', route: '/settings' },
];

type StatCardProps = {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  subtitle?: string;
};

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.muted }]}>{title}</Text>
        {subtitle && <Text style={[styles.statSubtitle, { color }]}>{subtitle}</Text>}
      </View>
    </View>
  );
}

type QuickActionProps = {
  colors: readonly [string, string, ...string[]];
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

function QuickAction({ colors: gradientColors, icon, label, onPress }: QuickActionProps) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <LinearGradient colors={gradientColors} style={styles.quickActionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <MaterialIcons name={icon} size={28} color="#fff" style={{ marginBottom: 8 }} />
        <Text style={styles.quickActionLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// Simple bar chart component
function MiniBarChart({ data, colors: themeColors }: { data: number[]; colors: any }) {
  const maxValue = Math.max(...data, 1);

  return (
    <View style={styles.barChart}>
      {data.map((value, index) => (
        <View key={index} style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                height: (value / maxValue) * 60,
                backgroundColor: index === data.length - 1 ? COLORS.primary : COLORS.primary + '60',
              },
            ]}
          />
          <Text style={[styles.barLabel, { color: themeColors.muted }]}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, scheme } = useThemeColors();
  const user = useUserStore((s) => s.user);
  const clearSession = useUserStore((s) => s.clearSession);
  const queueCount = useOfflineQueueStore((s) => s.queue.length);
  const syncStatus = useOfflineQueueStore((s) => s.syncStatus);
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const [refreshing, setRefreshing] = useState(false);

  // Use API data or fallback to empty data (Core forms only)
  const weeklyData = stats?.weekly_data ?? [0, 0, 0, 0, 0, 0, 0];
  const recentActivity = stats?.recent_activity ?? [];
  const todayCount = stats?.today?.count ?? 0;
  const percentChange = stats?.today?.percent_change ?? 0;
  const thisWeekTotal = stats?.this_week ?? 0;
  const totalSubmissions = stats?.totals
    ? Object.values(stats.totals).reduce((sum: number, val) => sum + (val as number), 0)
    : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <LinearGradient
        colors={scheme === 'dark' ? ['#1e1b4b', '#312e81'] : ['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <Pressable onPress={clearSession} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Sync Status */}
        {(queueCount > 0 || syncStatus !== 'idle') && (
          <View style={styles.syncBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <MaterialIcons
                name={syncStatus === 'syncing' ? 'sync' : syncStatus === 'error' ? 'warning' : 'cloud-upload'}
                size={18}
                color="#fff"
              />
              <Text style={styles.syncText}>
                {syncStatus === 'syncing'
                  ? 'Syncing...'
                  : syncStatus === 'error'
                  ? 'Sync paused'
                  : `${queueCount} pending`}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard title="Total Submissions" value={totalSubmissions} icon="assignment" color={COLORS.primary} />
        <StatCard title="Pending Sync" value={queueCount} icon="cloud-upload" color={COLORS.warning} />
        <StatCard
          title="Today"
          value={todayCount}
          icon="bar-chart"
          color={COLORS.success}
          subtitle={percentChange !== 0 ? `${percentChange > 0 ? '+' : ''}${percentChange}% from yesterday` : undefined}
        />
        <StatCard title="This Week" value={thisWeekTotal} icon="trending-up" color={COLORS.info} />
      </View>

      {/* Weekly Activity Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Activity</Text>
          <Text style={[styles.chartSubtitle, { color: colors.muted }]}>Submissions per day</Text>
        </View>
        <MiniBarChart data={weeklyData} colors={colors} />
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {GRADIENT_CARDS.map((card, index) => (
          <QuickAction
            key={index}
            colors={card.colors as [string, string]}
            icon={card.icon}
            label={card.label}
            onPress={() => router.push(card.route as any)}
          />
        ))}
      </View>

      {/* Recent Activity */}
      <View style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.recentTitle, { color: colors.text }]}>Recent Activity</Text>
        {statsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading activity...</Text>
          </View>
        ) : recentActivity.length > 0 ? (
          recentActivity.slice(0, 5).map((item, index) => (
            <View key={index} style={[styles.activityItem, { borderColor: colors.border }]}>
              <Text style={styles.activityIcon}>{item.icon}</Text>
              <View style={styles.activityContent}>
                <Text style={[styles.activityAction, { color: colors.text }]}>{item.action}</Text>
                <Text style={[styles.activityTime, { color: colors.muted }]}>{item.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No recent activity</Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>Submit a form to see your activity here</Text>
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoutBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 24,
  },
  syncBanner: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  syncText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginTop: -20,
  },
  statCard: {
    width: (width - 40) / 2,
    margin: 5,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  chartCard: {
    margin: 15,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  quickAction: {
    width: (width - 40) / 2,
    height: 100,
    margin: 5,
  },
  quickActionGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recentCard: {
    margin: 15,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
