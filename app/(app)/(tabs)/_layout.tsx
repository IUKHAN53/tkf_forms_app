import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../src/store/themeStore';

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  home: 'home',
  'core-forms': 'assignment',
  forms: 'description',
  settings: 'settings',
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconFocused]}>
      <MaterialIcons name={TAB_ICONS[name] || 'article'} size={24} color={color} />
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
});
