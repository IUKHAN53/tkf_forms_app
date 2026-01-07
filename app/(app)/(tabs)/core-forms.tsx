import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../../src/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboardStats } from '../../../src/hooks/useDashboardStats';

const { width } = Dimensions.get('window');

const CORE_FORMS = [
  {
    id: 'area-mapping',
    title: 'Area Mapping',
    description: 'Record vaccination area details and coverage information',
    icon: '🗺️',
    colors: ['#6366f1', '#8b5cf6'] as [string, string],
    route: '/core-forms/area-mapping',
  },
  {
    id: 'religious-leaders',
    title: 'Religious Leaders',
    description: 'Engage religious leaders to support vaccination efforts',
    icon: '🕌',
    colors: ['#f59e0b', '#d97706'] as [string, string],
    route: '/core-forms/religious-leaders',
  },
  {
    id: 'community-barriers',
    title: 'Community Explore Immunization Barriers',
    description: 'Document community-level immunization barriers',
    icon: '👥',
    colors: ['#ec4899', '#db2777'] as [string, string],
    route: '/core-forms/community-barriers',
  },
  {
    id: 'healthcare-barriers',
    title: 'Healthcare Workers Explore Immunization Barriers',
    description: 'Document healthcare workers immunization barriers',
    icon: '🏥',
    colors: ['#14b8a6', '#0d9488'] as [string, string],
    route: '/core-forms/healthcare-barriers',
  },
  {
    id: 'bridging-the-gap',
    title: 'Bridging The Gap',
    description: 'Build Immunization Improvement Teams from community participants',
    icon: '🌉',
    colors: ['#3b82f6', '#1d4ed8'] as [string, string],
    route: '/core-forms/bridging-the-gap',
  },
];

type FormCardProps = {
  title: string;
  description: string;
  icon: string;
  colors: [string, string];
  onPress: () => void;
};

function FormCard({ title, description, icon, colors, onPress }: FormCardProps) {
  const { colors: themeColors } = useThemeColors();

  return (
    <Pressable onPress={onPress} style={styles.cardWrapper}>
      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <LinearGradient
          colors={colors}
          style={styles.cardIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cardIconText}>{icon}</Text>
        </LinearGradient>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.cardDescription, { color: themeColors.muted }]} numberOfLines={2}>
            {description}
          </Text>
        </View>
        <Text style={[styles.cardArrow, { color: themeColors.muted }]}>→</Text>
      </View>
    </Pressable>
  );
}

export default function CoreFormsScreen() {
  const router = useRouter();
  const { colors, scheme } = useThemeColors();
  const { stats, loading } = useDashboardStats();

  // Calculate total submissions from stats
  const totalSubmissions = stats?.totals
    ? Object.values(stats.totals).reduce((sum, val) => sum + val, 0)
    : 0;
  const todayCount = stats?.today?.count ?? 0;
  const thisWeekCount = stats?.this_week ?? 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <LinearGradient
        colors={scheme === 'dark' ? ['#1e1b4b', '#312e81'] : ['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Core Forms</Text>
        <Text style={styles.headerSubtitle}>Vaccination tracking and outreach forms</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.statValue, { color: colors.primary }]}>{totalSubmissions}</Text>
            )}
            <Text style={[styles.statLabel, { color: colors.muted }]}>Total</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {loading ? (
              <ActivityIndicator size="small" color="#22c55e" />
            ) : (
              <Text style={[styles.statValue, { color: '#22c55e' }]}>{todayCount}</Text>
            )}
            <Text style={[styles.statLabel, { color: colors.muted }]}>Today</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {loading ? (
              <ActivityIndicator size="small" color="#f59e0b" />
            ) : (
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{thisWeekCount}</Text>
            )}
            <Text style={[styles.statLabel, { color: colors.muted }]}>This Week</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Forms</Text>

        {CORE_FORMS.map((form) => (
          <FormCard
            key={form.id}
            title={form.title}
            description={form.description}
            icon={form.icon}
            colors={form.colors}
            onPress={() => router.push(form.route as any)}
          />
        ))}

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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBadge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
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
  },
  cardArrow: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
});
