import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 70;
const NOTCH_HEIGHT = 40;
const ICON_CONTAINER_SIZE = 56;

// Tab-specific color themes
const TabThemes = {
  index: {
    primary: Colors.dark.electricBlue,
    gradient: ["rgba(0, 212, 255, 0.2)", "rgba(0, 212, 255, 0.05)"],
    glow: "rgba(0, 212, 255, 0.4)",
  },
  apps: {
    primary: Colors.dark.neonGreen,
    gradient: ["rgba(0, 255, 136, 0.2)", "rgba(0, 255, 136, 0.05)"],
    glow: "rgba(0, 255, 136, 0.4)",
  },
  generator: {
    primary: Colors.dark.pinkFlash,
    gradient: ["rgba(255, 107, 157, 0.2)", "rgba(255, 107, 157, 0.05)"],
    glow: "rgba(255, 107, 157, 0.4)",
  },
  settings: {
    primary: Colors.dark.purpleGlow,
    gradient: ["rgba(139, 92, 246, 0.2)", "rgba(139, 92, 246, 0.05)"],
    glow: "rgba(139, 92, 246, 0.4)",
  },
};

const SlidingNotchTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { routes, index: activeIndex } = state;
  const glowOpacity = useSharedValue(0);
  
  React.useEffect(() => {
    glowOpacity.value = withTiming(1, { duration: 300 });
  }, [activeIndex]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Dynamic background gradient based on active tab */}
      <LinearGradient
        colors={TabThemes[routes[activeIndex]?.name as keyof typeof TabThemes]?.gradient || TabThemes.index.gradient}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.tabItemsContainer}>
        {routes.map((route, index) => {
          const isFocused = activeIndex === index;
          const iconName = getIconName(route.name, isFocused);
          const theme = TabThemes[route.name as keyof typeof TabThemes] || TabThemes.index;
          const iconColor = isFocused ? theme.primary : Colors.dark.textMuted;

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
            <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
              {isFocused && (
                <Animated.View style={[styles.activeTabIndicator, animatedGlowStyle]}>
                  <LinearGradient
                    colors={[theme.primary, `${theme.primary}80`]}
                    style={styles.indicatorGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
              )}
              <View style={styles.iconWrapper}>
                <Ionicons name={iconName} size={28} color={iconColor} />
              </View>
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
      key="tabs"
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
    backgroundColor: Colors.dark.background,
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  tabItemsContainer: {
    flexDirection: "row",
    height: "100%",
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
    paddingVertical: 12,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    paddingVertical: 8,
  },
  activeTabIndicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 2,
    zIndex: 1,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
});
