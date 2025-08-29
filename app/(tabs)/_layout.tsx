import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Colors from "@/constants/Colors";
import { Pressable, PressableProps } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.primary,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: "rgba(26, 26, 27, 0.98)",
          borderTopColor: Colors.dark.borderAccent,
          borderTopWidth: 2,
          paddingTop: 12,
          paddingBottom: 12,
          height: 80,
          position: "absolute",
          borderRadius: 30,
          marginHorizontal: 12,
          marginBottom: 10,
          shadowColor: Colors.dark.primary,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 15,
          borderWidth: 1.5,
          borderColor: Colors.dark.borderAccent,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          // paddingVertical: 4,
          borderRadius: 20,
          marginHorizontal: 4,
        },
        headerShown: useClientOnlyValue(false, true),
        tabBarButton: (props: PressableProps) => (
          <Pressable {...props} android_ripple={{ color: "transparent" }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "shield" : "shield-outline"}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: "Apps",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "apps" : "apps-outline"}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="generator"
        options={{
          title: "Generator",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "flash" : "flash-outline"}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Mission",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
