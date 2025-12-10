import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FormListScreen } from '../screens/FormList/FormListScreen';
import { FormDetailScreen } from '../screens/FormDetail/FormDetailScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { Form } from '../api/forms';

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
  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Home' : 'Login'}
      screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#fff' }}
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
