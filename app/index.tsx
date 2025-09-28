import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/use-app-context";
import { navigationService } from "@/services/NavigationService";
import { clearSession } from "@/services/storage/secureStorage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { isSetupComplete, tryAutoAuthenticate, state } = useAppContext();

  const rocketRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const pulseScale = useSharedValue(1);
  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const hexagonRotation = useSharedValue(0);

  useEffect(() => {
    // Start entrance animations
    logoScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    titleOpacity.value = withTiming(1, { duration: 1000 });

    // Continuous animations
    rocketRotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1
    );
    hexagonRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1
    );

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + Math.random() * 15 + 5;
        return next >= 100 ? 100 : next;
      });
    }, 200);

    checkAppState();

    return () => {
      clearInterval(progressInterval);
      cancelAnimation(logoScale);
      cancelAnimation(titleOpacity);
      cancelAnimation(rocketRotation);
      cancelAnimation(glowOpacity);
      cancelAnimation(pulseScale);
      cancelAnimation(hexagonRotation);
    };
  }, []);

  useEffect(() => {
    progressWidth.value = withTiming(loadingProgress, { duration: 300 });
  }, [loadingProgress]);

  const checkAppState = async () => {
    try {
      console.log("🚀 Starting app state check...");

      // Add minimum loading time for UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const setupComplete = await isSetupComplete();
      console.log("📋 Setup complete:", setupComplete);

      if (!setupComplete) {
        // First time user - show onboarding
        console.log("🆕 First time user - redirecting to onboarding");
        await clearSession();
        navigationService.safeNavigate("/onboarding");
        return;
      }

      // Check for valid session first
      const hasValidSessionToken = await tryAutoAuthenticate();
      console.log("🔑 Valid session token:", hasValidSessionToken);

      if (hasValidSessionToken) {
        // Valid session exists - go directly to main app
        console.log("✅ Valid session found - navigating to main app");
        navigationService.safeNavigate("/(tabs)");
      } else {
        // No valid session - user needs to authenticate
        console.log("🔐 No valid session - redirecting to auth");
        navigationService.safeNavigate("/auth");
      }
    } catch (error) {
      console.error("❌ Error checking app state:", error);
      // Clear session on error and go to onboarding as fallback
      await clearSession();
      navigationService.safeNavigate("/onboarding");
    } finally {
      // Delay to prevent navigation conflicts
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <LinearGradient
          colors={["#0a0a0b", "#1a1a1b", "#0a0a0b"]}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.splashContent}>
          <AnimatedView style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🔒</Text>
            </View>
          </AnimatedView>

          <AnimatedView style={[styles.titleContainer, titleAnimatedStyle]}>
            <Text style={styles.title}>PASSPORT</Text>
          </AnimatedView>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Simple clean layout
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  splashContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.electricBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 40,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.dark.text,
    letterSpacing: 4,
  },
  // Original styles
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  hexagonContainer: {
    position: "absolute",
    zIndex: 0,
  },
  logoGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.dark.electricBlue,
    opacity: 0.15,
    top: -20,
    left: -20,
    zIndex: -1,
  },
  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: Colors.dark.text,
    marginBottom: 12,
    letterSpacing: 3,
    textShadowColor: Colors.dark.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: Colors.dark.neonGreen,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  loadingSection: {
    alignItems: "center",
    width: "100%",
    gap: 20,
  },
  progressContainer: {
    width: "80%",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 3,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 212, 255, 0.2)",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.primary,
    letterSpacing: 1,
  },
  loadingStatus: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  holoDotsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  holoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.neonGreen,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});
