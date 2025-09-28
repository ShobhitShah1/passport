import { ParallaxStarfield } from "@/components/onboarding";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to Passport",
    description:
      "Your secure digital vault floating in the depths of space. Store all your passwords in this cosmic sanctuary.",
    icon: "rocket",
  },
  {
    id: 2,
    title: "Stellar Password Generator",
    description:
      "Forge unbreakable passwords with the power of distant stars. Create cosmic-level security for all your accounts.",
    icon: "planet",
  },
  {
    id: 3,
    title: "Quantum Sync",
    description:
      "Your passwords travel at the speed of light across all your devices. Synchronized across the digital universe.",
    icon: "globe",
  },
  {
    id: 4,
    title: "Black Hole Security",
    description:
      "Your data is protected by encryption so strong, not even light can escape. Zero-knowledge, infinite protection.",
    icon: "shield-checkmark",
  },
];

const planetSizes = [10, 14, 12, 16];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const insets = useSafeAreaInsets();
  const displayedStep = onboardingSteps[currentStep];

  const contentOpacity = useSharedValue(1);
  const contentTranslateX = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const orbitRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);
  const nextButtonScale = useSharedValue(1);
  const prevButtonScale = useSharedValue(1);
  const skipButtonScale = useSharedValue(1);

  const activeRingScale = useSharedValue(1);
  const activeRingOpacity = useSharedValue(1);

  useEffect(() => {
    orbitRotation.value = withRepeat(
      withTiming(-360, { duration: 30000, easing: Easing.linear }),
      -1
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    activeRingScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    activeRingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const changeStep = (newStepIndex: number) => {
    const direction = newStepIndex > currentStep ? 1 : -1;

    contentOpacity.value = withTiming(0, { duration: 250 });
    contentTranslateX.value = withTiming(-width * 0.5 * direction, {
      duration: 250,
      easing: Easing.inOut(Easing.quad),
    });

    setTimeout(() => {
      runOnJS(setCurrentStep)(newStepIndex);
      contentTranslateX.value = width * 0.5 * direction;
      contentTranslateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.inOut(Easing.quad),
      });
      contentOpacity.value = withTiming(1, { duration: 250 });
    }, 260);
  };

  const handleNext = () => {
    iconScale.value = withSequence(
      withSpring(1.15, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );

    if (currentStep < onboardingSteps.length - 1) {
      changeStep(currentStep + 1);
    } else {
      router.replace("/setup");
    }
  };

  const handleSkip = () => {
    router.replace("/setup");
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      changeStep(currentStep - 1);
    }
  };

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentTranslateX.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const orbitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const nextButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextButtonScale.value }],
  }));

  const prevButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: prevButtonScale.value }],
  }));

  const skipButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipButtonScale.value }],
  }));

  const activeRingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: activeRingOpacity.value,
      transform: [{ scale: activeRingScale.value }],
    };
  });

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ParallaxStarfield />

      <View style={styles.topSection}>
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const size = planetSizes[index % planetSizes.length];

            const planetAnimatedStyle = useAnimatedStyle(() => {
              const backgroundColor = withTiming(
                isActive
                  ? Colors.dark.primary
                  : isCompleted
                  ? Colors.dark.primary + "99"
                  : Colors.dark.surface,
                { duration: 400 }
              );
              const borderColor = withTiming(
                isActive || isCompleted
                  ? Colors.dark.primary + "60"
                  : Colors.dark.border,
                { duration: 400 }
              );
              return {
                backgroundColor,
                borderColor,
              };
            });

            const pathAnimatedStyle = useAnimatedStyle(() => {
              const borderColor = withTiming(
                isCompleted ? Colors.dark.primary + "50" : Colors.dark.border,
                { duration: 400 }
              );
              return {
                borderColor,
              };
            });

            return (
              <View key={index} style={styles.progressWrapper}>
                <View style={styles.planetContainer}>
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.activePlanetRing,
                        { width: size * 2.5, height: size * 2.5 },
                        activeRingAnimatedStyle,
                      ]}
                    />
                  )}
                  <Animated.View
                    style={[
                      styles.planet,
                      { width: size, height: size, borderRadius: size / 2 },
                      planetAnimatedStyle,
                    ]}
                  />
                </View>
                {index < onboardingSteps.length - 1 && (
                  <Animated.View
                    style={[styles.orbitalPath, pathAnimatedStyle]}
                  />
                )}
              </View>
            );
          })}
        </View>

        <AnimatedPressable
          onPress={handleSkip}
          onPressIn={() =>
            (skipButtonScale.value = withSpring(0.95, { damping: 15 }))
          }
          onPressOut={() => (skipButtonScale.value = withSpring(1))}
          style={[styles.skipButton, skipButtonAnimatedStyle]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </AnimatedPressable>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.iconOrbit, orbitAnimatedStyle]}>
              <View
                style={[
                  styles.orbitDot,
                  { top: -2, left: "50%", marginLeft: -2 },
                ]}
              />
              <View
                style={[
                  styles.orbitDot,
                  { bottom: -2, left: "50%", marginLeft: -2 },
                ]}
              />
              <View
                style={[
                  styles.orbitDot,
                  { left: -2, top: "50%", marginTop: -2 },
                ]}
              />
              <View
                style={[
                  styles.orbitDot,
                  { right: -2, top: "50%", marginTop: -2 },
                ]}
              />
            </Animated.View>
            <Animated.View style={[styles.iconGlow, glowAnimatedStyle]} />
            <View style={styles.iconPlanet}>
              <Animated.View style={iconAnimatedStyle}>
                <Ionicons
                  name={displayedStep.icon}
                  size={45}
                  color={Colors.dark.primary}
                />
              </Animated.View>
            </View>
          </View>

          <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
            <Text style={styles.title}>{displayedStep.title}</Text>
            <Text style={styles.description}>{displayedStep.description}</Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <Animated.View
              style={{ flex: 1 }}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
            >
              <AnimatedPressable
                onPress={handlePrevious}
                onPressIn={() =>
                  (prevButtonScale.value = withSpring(0.95, { damping: 15 }))
                }
                onPressOut={() => (prevButtonScale.value = withSpring(1))}
                style={[styles.prevButton, prevButtonAnimatedStyle]}
              >
                <Text style={styles.prevButtonText}>Previous</Text>
              </AnimatedPressable>
            </Animated.View>
          )}

          <AnimatedPressable
            onPress={handleNext}
            onPressIn={() =>
              (nextButtonScale.value = withSpring(0.95, { damping: 15 }))
            }
            onPressOut={() => (nextButtonScale.value = withSpring(1))}
            style={[
              styles.nextButton,
              currentStep === 0 && styles.nextButtonFull,
              nextButtonAnimatedStyle,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02000a",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    minHeight: 60,
    zIndex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginRight: 60,
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  planetContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  planet: {
    borderWidth: 1.5,
  },
  activePlanetRing: {
    position: "absolute",
    borderRadius: 99,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  orbitalPath: {
    width: 30,
    height: 1,
    borderBottomWidth: 2,
    borderStyle: "dashed",
    marginHorizontal: 4,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface + "60",
  },
  skipText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 1,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  iconOrbit: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "30",
    borderStyle: "dashed",
    position: "absolute",
    zIndex: 1,
  },
  orbitDot: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.dark.primary,
  },
  iconGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.dark.primary,
    zIndex: 2,
  },
  iconPlanet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface || "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "60",
  },
  textContainer: {
    alignItems: "center",
    maxWidth: width * 0.85,
    height: 140,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
  },
  navigationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    zIndex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  prevButton: {
    flex: 1,
    backgroundColor: Colors.dark.surface + "60",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "30",
  },
  prevButtonText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.dark.primary,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    color: Colors.dark.background,
    fontWeight: "600",
  },
});
