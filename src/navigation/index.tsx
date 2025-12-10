import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
import { FormListScreen } from '../screens/FormList/FormListScreen';
import { FormDetailScreen } from '../screens/FormDetail/FormDetailScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { Form } from '../api/forms';
import { useThemeColors, useThemeStore } from '../store/themeStore';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  FormList: undefined;
  FormDetail: { formId: number; form?: Form };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isAuthenticated: boolean;
};

export const AppNavigator = ({ isAuthenticated }: Props) => {
  const { colors, scheme } = useThemeColors();
  const toggleTheme = useThemeStore((s) => s.toggle);

  const headerThemeButton = () => (
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
  );

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Home' : 'Login'}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerRight: headerThemeButton,
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
          <Stack.Screen name="FormList" component={FormListScreen} options={{ title: 'Forms' }} />
          <Stack.Screen name="FormDetail" component={FormDetailScreen} options={{ title: 'Form' }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};
