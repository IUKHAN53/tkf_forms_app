import { Stack } from 'expo-router';
import { useThemeColors } from '../../src/store/themeStore';

export default function AppLayout() {
  const { colors } = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}
    >
      {/* Tab Navigator */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Core Form Screens (pushed from tabs) */}
      <Stack.Screen name="core-forms/area-mapping" options={{ title: 'Area Mapping' }} />
      <Stack.Screen name="core-forms/religious-leaders" options={{ title: 'Religious Leaders Activity' }} />
      <Stack.Screen name="core-forms/community-barriers" options={{ title: 'Community Explore Immunization Barriers' }} />
      <Stack.Screen name="core-forms/healthcare-barriers" options={{ title: 'Healthcare Workers Explore Immunization Barriers' }} />

      {/* My Submissions */}
      <Stack.Screen name="my-submissions" options={{ title: 'My Submissions' }} />

      {/* Dynamic Form Details */}
      <Stack.Screen name="forms/[id]" options={{ title: 'Form' }} />
    </Stack>
  );
}
