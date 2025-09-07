import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Polygon,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const AnimatedView = Animated.createAnimatedComponent(View);

const HolographicHexagon = ({
  style,
  size,
  opacity,
}: {
  style: any;
  size: number;
  opacity: number;
}) => {
  const hexagonPoints = (size: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  return (
    <View style={[{ position: "absolute" }, style]}>
      <Svg
        width={size * 2}
        height={size * 2}
        viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      >
        <Defs>
          <SvgLinearGradient id={`hexGrad${size}`} x1="0" y1="0" x2="1" y2="1">
            <Stop
              offset="0%"
              stopColor={Colors.dark.primary}
              stopOpacity={opacity * 0.4}
            />
            <Stop
              offset="50%"
              stopColor={Colors.dark.neonGreen}
              stopOpacity={opacity * 0.2}
            />
            <Stop
              offset="100%"
              stopColor={Colors.dark.secondary}
              stopOpacity={opacity * 0.3}
            />
          </SvgLinearGradient>
        </Defs>
        <Polygon
          points={hexagonPoints(size * 0.8)}
          fill={`url(#hexGrad${size})`}
          stroke={Colors.dark.primary}
          strokeWidth="1"
          strokeOpacity={opacity}
        />
      </Svg>
    </View>
  );
};

const FloatingParticle = React.memo(({ particle }: { particle: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const moveX = withRepeat(
      withTiming(Math.random() * 50 - 25, {
        duration: 4000 + Math.random() * 2000,
      }),
      -1,
      true
    );
    const moveY = withRepeat(
      withTiming(Math.random() * 50 - 25, {
        duration: 3000 + Math.random() * 2000,
      }),
      -1,
      true
    );
    const opacity = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 })
      ),
      -1
    );

    return {
      transform: [{ translateX: moveX }, { translateY: moveY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: Colors.dark.primary,
          shadowColor: Colors.dark.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 3,
        },
        animatedStyle,
      ]}
    />
  );
});

const FloatingParticles = React.memo(() => {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
});

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { isSetupComplete, state } = useAppContext();
  const insets = useSafeAreaInsets();

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

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const hexagonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${hexagonRotation.value}deg` }],
  }));

  if (isLoading) {
    return (
      <LinearGradient
        colors={[
          Colors.dark.background,
          "#0a0a0f",
          "#1a1a2e",
          Colors.dark.background,
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <FloatingParticles />

        {/* Background Hexagons */}
        <HolographicHexagon
          style={{ left: screenWidth * 0.1, top: screenHeight * 0.2 }}
          size={30}
          opacity={0.3}
        />
        <HolographicHexagon
          style={{ right: screenWidth * 0.15, top: screenHeight * 0.15 }}
          size={20}
          opacity={0.4}
        />
        <HolographicHexagon
          style={{ left: screenWidth * 0.8, bottom: screenHeight * 0.3 }}
          size={25}
          opacity={0.35}
        />
        <HolographicHexagon
          style={{ left: screenWidth * 0.05, bottom: screenHeight * 0.2 }}
          size={35}
          opacity={0.25}
        />

        <View style={styles.content}>
          <AnimatedView style={[styles.logoContainer, logoAnimatedStyle]}>
            <AnimatedView
              style={[styles.hexagonContainer, hexagonAnimatedStyle]}
            >
              <Svg width={160} height={160} viewBox="-80 -80 160 160">
                <Defs>
                  <SvgLinearGradient id="hexBg" x1="0" y1="0" x2="1" y2="1">
                    <Stop
                      offset="0%"
                      stopColor={Colors.dark.primary}
                      stopOpacity="0.2"
                    />
                    <Stop
                      offset="50%"
                      stopColor={Colors.dark.neonGreen}
                      stopOpacity="0.3"
                    />
                    <Stop
                      offset="100%"
                      stopColor={Colors.dark.secondary}
                      stopOpacity="0.2"
                    />
                  </SvgLinearGradient>
                </Defs>
                <Polygon
                  points="70,0 35,60.62 -35,60.62 -70,0 -35,-60.62 35,-60.62"
                  fill="url(#hexBg)"
                  stroke={Colors.dark.primary}
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                <Polygon
                  points="50,0 25,43.30 -25,43.30 -50,0 -25,-43.30 25,-43.30"
                  fill="none"
                  stroke={Colors.dark.neonGreen}
                  strokeWidth="1"
                  strokeOpacity="0.8"
                />
              </Svg>
            </AnimatedView>
          </AnimatedView>

          <AnimatedView style={[styles.titleContainer, titleAnimatedStyle]}>
            <Text style={styles.appName}>SPACE VAULT</Text>
            <Text style={styles.tagline}>🔐 Quantum Security Platform</Text>
            <Text style={styles.subtitle}>Initializing neural networks...</Text>
          </AnimatedView>

          <View style={styles.loadingSection}>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <AnimatedView
                  style={[styles.progressBar, progressAnimatedStyle]}
                />
                <View style={styles.progressGlow} />
              </View>
              <Text style={styles.progressText}>
                {Math.round(loadingProgress)}%
              </Text>
            </View>

            <Text style={styles.loadingStatus}>
              {loadingProgress < 30 && "⚡ Connecting to secure servers..."}
              {loadingProgress >= 30 &&
                loadingProgress < 60 &&
                "🔒 Initializing encryption protocols..."}
              {loadingProgress >= 60 &&
                loadingProgress < 90 &&
                "🛡️ Verifying security systems..."}
              {loadingProgress >= 90 && "✅ System ready!"}
            </Text>
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 25,
    zIndex: 1,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 2,
    borderColor: Colors.dark.neonGreen,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
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
