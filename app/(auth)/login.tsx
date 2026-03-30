import React from 'react';
import { Pressable, Text, TextInput, View, StyleSheet, Image, Dimensions, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../../src/api/auth';
import { useUserStore } from '../../src/store/userStore';
import { useThemeColors } from '../../src/store/themeStore';
import { showErrorDialog } from '../../src/utils/errorDialogs';

interface FormValues {
  phone: string;
  password: string;
}

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const setSession = useUserStore((s) => s.setSession);
  const { colors } = useThemeColors();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values.phone, values.password);
      setSession(res.token, res.user);
    } catch (error: any) {
      showErrorDialog(error, {
        customTitle: 'Login Failed',
        customMessage: error.response?.status === 401
          ? 'Invalid phone number or password. Please try again.'
          : undefined,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      {/* Header with Logos */}
      <View style={styles.logoSection}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.clmLogo}
          resizeMode="contain"
        />
        <View style={styles.logoRow}>
          <Image
            source={require('../../assets/images/govt-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/epi-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.appTitle, { color: colors.primary }]}>Community Led Engagement</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="phone"
          rules={{ required: 'Phone number required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="phone-pad"
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="03001234567"
                placeholderTextColor={colors.muted}
              />
              {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                secureTextEntry
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
              />
              {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
            </View>
          )}
        />

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={[
            styles.button,
            { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }
          ]}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Sign In'}</Text>
        </Pressable>
      </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Powered by EPI & TKF
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  clmLogo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 16,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
