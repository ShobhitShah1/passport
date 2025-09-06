import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 70;
const NOTCH_HEIGHT = 40;
const ICON_CONTAINER_SIZE = 56;

const Colors = {
  background: "#121212",
  tabBarBackground: "#1E1E1E",
  active: "#FFFFFF",
  inactive: "#8E8E93",
  primary: "#3b82f6",
};

type TabBarLayout = { x: number; width: number };

const SlidingNotchTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const layouts = useRef<TabBarLayout[]>([]).current;
  const { routes, index: activeIndex } = state;

  const notchPositionX = useSharedValue(0);

  useEffect(() => {
    const newLayout = layouts[activeIndex];
    if (newLayout) {
      notchPositionX.value = withSpring(
        newLayout.x + newLayout.width / 2 - ICON_CONTAINER_SIZE / 2,
        { damping: 15, stiffness: 100 }
      );
    }
  }, [activeIndex, layouts, notchPositionX]);

  const onLayout = (event: LayoutChangeEvent, index: number) => {
    layouts[index] = event.nativeEvent.layout;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabItemsContainer}>
        {routes.map((route, index) => {
          const isFocused = activeIndex === index;
          const iconName = getIconName(route.name, isFocused);
          const iconColor = isFocused ? Colors.primary : Colors.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLayout={(event) => onLayout(event, index)}
              style={styles.tabItem}
            >
              <Ionicons name={iconName} size={26} color={iconColor} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const getIconName = (
  routeName: string,
  isFocused: boolean
): React.ComponentProps<typeof Ionicons>["name"] => {
  switch (routeName) {
    case "index":
      return isFocused ? "shield" : "shield-outline";
    case "apps":
      return isFocused ? "apps" : "apps-outline";
    case "generator":
      return isFocused ? "flash" : "flash-outline";
    case "settings":
      return isFocused ? "settings" : "settings-outline";
    default:
      return "alert-circle-outline";
  }
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <SlidingNotchTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="apps" />
      <Tabs.Screen name="generator" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH,
    height: TAB_BAR_HEIGHT,
    backgroundColor: Colors.background,
  },
  backgroundSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  notchContainer: {
    position: "absolute",
    top: -NOTCH_HEIGHT + 1,
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemsContainer: {
    flexDirection: "row",
    height: "100%",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: ICON_CONTAINER_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -38, // Position icon inside the notch area
  },
});
