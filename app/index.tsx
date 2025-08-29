import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { isSetupComplete, state } = useAppContext();
  const insets = useSafeAreaInsets();

  const rocketRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Start animations
    rocketRotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );

    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      const setupComplete = await isSetupComplete();

      if (!setupComplete) {
        // First time user - show onboarding
        router.replace("/onboarding");
      } else if (!state.isAuthenticated) {
        // User needs to authenticate
        router.replace("/auth");
      } else {
        // User is authenticated - go to main app
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error checking app state:", error);
      router.replace("/onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  const rocketAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rocketRotation.value}deg` }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.dark.background, "#1a1a2e", Colors.dark.background]}
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.content}>
          <AnimatedView style={[styles.logoContainer, pulseAnimatedStyle]}>
            <AnimatedView style={[styles.logoGlow, glowAnimatedStyle]} />
            <View style={styles.logo}>
              <AnimatedView style={rocketAnimatedStyle}>
                <Ionicons
                  name="rocket"
                  size={40}
                  color={Colors.dark.background}
                />
              </AnimatedView>
            </View>
            <Text style={styles.appName}>Space Vault</Text>
            <Text style={styles.tagline}>Securing the cosmos...</Text>
          </AnimatedView>

          <View style={styles.loadingContainer}>
            <View style={styles.loadingDots}>
              {[0, 1, 2].map((index) => (
                <AnimatedView
                  key={index}
                  style={[
                    styles.dot,
                    {
                      animationDelay: `${index * 200}ms`,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    zIndex: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
  },
});
