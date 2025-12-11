import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../src/store/themeStore';

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    'core-forms': '📋',
    forms: '📝',
    settings: '⚙️',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconFocused]}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>{icons[name] || '📄'}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.bg,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="core-forms"
        options={{
          title: 'Core Forms',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <TabIcon name="core-forms" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dynamic-forms"
        options={{
          title: 'Forms',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <TabIcon name="forms" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <TabIcon name="settings" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
  icon: {
    fontSize: 20,
  },
});
