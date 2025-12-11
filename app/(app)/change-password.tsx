import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../src/store/themeStore';
import { api } from '../../src/api/client';

export default function ChangePasswordScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Error', 'New password is required');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.icon}>🔐</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Update Your Password</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Choose a strong password with at least 8 characters
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter current password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showCurrentPassword}
              />
              <Pressable 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <Text style={{ fontSize: 18 }}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter new password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showNewPassword}
              />
              <Pressable 
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <Text style={{ fontSize: 18 }}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Confirm new password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Text style={{ fontSize: 18 }}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Password Requirements */}
        <View style={[styles.requirementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.requirementsTitle, { color: colors.text }]}>Password Requirements</Text>
          <View style={styles.requirement}>
            <Text style={[styles.requirementIcon, { color: newPassword.length >= 8 ? colors.success : colors.muted }]}>
              {newPassword.length >= 8 ? '✓' : '○'}
            </Text>
            <Text style={[styles.requirementText, { color: colors.muted }]}>At least 8 characters</Text>
          </View>
          <View style={styles.requirement}>
            <Text style={[styles.requirementIcon, { color: newPassword === confirmPassword && newPassword.length > 0 ? colors.success : colors.muted }]}>
              {newPassword === confirmPassword && newPassword.length > 0 ? '✓' : '○'}
            </Text>
            <Text style={[styles.requirementText, { color: colors.muted }]}>Passwords match</Text>
          </View>
        </View>

        {/* Change Button */}
        <Pressable
          onPress={handleChangePassword}
          disabled={isLoading}
          style={[styles.changeButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -9 }],
  },
  requirementsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 10,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 13,
  },
  changeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  changeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
