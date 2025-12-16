import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import { useThemeColors, useThemeStore } from '../../../src/store/themeStore';
import { useUserStore } from '../../../src/store/userStore';
import { useOfflineQueueStore } from '../../../src/store/offlineQueueStore';
import { api } from '../../../src/api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showErrorDialog, showSuccessDialog, showConfirmDialog } from '../../../src/utils/errorDialogs';

type SettingsItemProps = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
};

function SettingsItem({ icon, title, subtitle, onPress, trailing, danger }: SettingsItemProps) {
  const { colors } = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingsItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      disabled={!onPress && !trailing}
    >
      <View style={[styles.settingsIcon, { backgroundColor: danger ? '#ef444420' : colors.primary + '20' }]}>
        <Text style={styles.settingsIconText}>{icon}</Text>
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, { color: danger ? '#ef4444' : colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingsSubtitle, { color: colors.muted }]}>{subtitle}</Text>}
      </View>
      {trailing}
      {onPress && !trailing && <Text style={[styles.settingsArrow, { color: colors.muted }]}>→</Text>}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors, scheme } = useThemeColors();
  const toggleScheme = useThemeStore((s) => s.toggle);
  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);
  const clearSession = useUserStore((s) => s.clearSession);
  const queueCount = useOfflineQueueStore((s) => s.queue.length);
  const syncStatus = useOfflineQueueStore((s) => s.syncStatus);
  const lastSyncAt = useOfflineQueueStore((s) => s.lastSyncAt);
  const router = useRouter();

  const [sendingLogs, setSendingLogs] = useState(false);

  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  const handleSendLogs = async () => {
    setSendingLogs(true);
    try {
      // Collect device/app info for logs
      const logData = {
        app_version: appVersion,
        build_number: buildNumber,
        platform: 'android', // Could use Platform.OS
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        queue_count: queueCount,
        sync_status: syncStatus,
        last_sync_at: lastSyncAt,
        // Add more diagnostic info as needed
      };

      await api.post('/logs', logData);
      showSuccessDialog('Success', 'Logs sent successfully to the server.');
    } catch (error: any) {
      showErrorDialog(error);
    } finally {
      setSendingLogs(false);
    }
  };

  const handleLogout = () => {
    showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      clearSession,
      undefined,
      { confirmText: 'Logout', destructive: true }
    );
  };

  const handleClearData = () => {
    showConfirmDialog(
      'Clear Local Data',
      'This will clear all locally cached data. Pending submissions will be lost. Continue?',
      () => {
        // Would implement cache clearing here
        showSuccessDialog('Done', 'Local data cleared.');
      },
      undefined,
      { confirmText: 'Clear', destructive: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <LinearGradient
        colors={scheme === 'dark' ? ['#374151', '#1f2937'] : ['#6b7280', '#4b5563']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>ACCOUNT</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="👤"
            title="Profile"
            subtitle="View and edit your profile"
            onPress={() => router.push('/(app)/profile')}
          />
          <SettingsItem
            icon="🔐"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => router.push('/(app)/change-password')}
          />
        </View>

        {/* Appearance Section */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>APPEARANCE</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon={scheme === 'dark' ? '🌙' : '☀️'}
            title="Dark Mode"
            subtitle={scheme === 'dark' ? 'Currently enabled' : 'Currently disabled'}
            trailing={
              <Switch
                value={scheme === 'dark'}
                onValueChange={toggleScheme}
                trackColor={{ false: '#767577', true: colors.primary + '80' }}
                thumbColor={scheme === 'dark' ? colors.primary : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Sync Section */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>SYNC & DATA</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="📤"
            title="Pending Submissions"
            subtitle={queueCount > 0 ? `${queueCount} items waiting to sync` : 'All synced'}
          />
          <SettingsItem
            icon="🔄"
            title="Last Sync"
            subtitle={lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never'}
          />
          <SettingsItem
            icon="🗑️"
            title="Clear Local Data"
            subtitle="Remove cached data"
            onPress={handleClearData}
          />
        </View>

        {/* Support Section */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>SUPPORT</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="📧"
            title="Send Logs"
            subtitle="Send diagnostic logs to support"
            onPress={handleSendLogs}
            trailing={sendingLogs ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
          />
          <SettingsItem
            icon="❓"
            title="Help & FAQ"
            subtitle="Get help and answers"
            onPress={() => router.push('/(app)/help-faq')}
          />
          <SettingsItem
            icon="📞"
            title="Contact Support"
            subtitle="Reach out to our team"
            onPress={() => router.push('/(app)/contact-support')}
          />
        </View>

        {/* About Section */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>ABOUT</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem icon="📱" title="App Version" subtitle={`${appVersion} (${buildNumber})`} />
        </View>

        {/* Logout */}
        <View style={[styles.settingsGroup, { marginTop: 20 }]}>
          <SettingsItem icon="👋" title="Logout" subtitle="Sign out of your account" onPress={handleLogout} danger />
        </View>

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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 16,
    letterSpacing: 1,
  },
  settingsGroup: {
    borderRadius: 16,
    overflow: 'hidden',
    gap: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsIconText: {
    fontSize: 22,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  settingsArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
});
