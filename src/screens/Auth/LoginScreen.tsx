import React from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { login } from '../../api/auth';
import { useUserStore } from '../../store/userStore';

interface FormValues {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const setSession = useUserStore((s) => s.setSession);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { email: 'admin@example.com', password: 'password' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values.email, values.password);
      setSession(res.token, res.user);
    } catch (error) {
      Alert.alert('Login failed', 'Check your credentials and try again');
    }
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 justify-center">
      <View className="mb-10">
        <Text className="text-3xl font-bold text-white">TKF Forms</Text>
        <Text className="text-slate-400 mt-2">Sign in to submit forms</Text>
      </View>

      <View className="space-y-4">
        <Controller
          control={control}
          name="email"
          rules={{ required: 'Email required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <View>
              <Text className="text-slate-300 mb-2">Email</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-800"
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
              />
              {fieldState.error && <Text className="text-red-500 text-sm mt-1">{fieldState.error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <View>
              <Text className="text-slate-300 mb-2">Password</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                secureTextEntry
                className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-800"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
              />
              {fieldState.error && <Text className="text-red-500 text-sm mt-1">{fieldState.error.message}</Text>}
            </View>
          )}
        />

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="bg-primary rounded-xl py-3 items-center mt-2"
        >
          <Text className="text-white font-semibold">{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
        </Pressable>
      </View>
    </View>
  );
};
