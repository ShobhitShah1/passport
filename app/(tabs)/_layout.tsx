import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.primary,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.dark.surface,
          borderTopColor: Colors.dark.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color }) => <TabBarIcon name="lock" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="generator"
        options={{
          title: 'Generator',
          tabBarIcon: ({ color }) => <TabBarIcon name="key" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
