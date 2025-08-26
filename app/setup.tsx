import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withSpring,
  cancelAnimation,
} from "react-native-reanimated";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator";
import { setupMasterPassword } from "@/services/storage/secureStorage";
import {
  calculatePasswordStrength,
  calculateEntropy,
} from "@/services/password/generator";

// --- Updated Color Palette ---
const Colors = {
  dark: {
    background: "#02000a",
    surface: "#1a1a1b",
    text: "#f0f2f5",
    textSecondary: "#a3a3a3",
    textMuted: "#666666",
    primary: "#00d4ff",
    neonGreen: "#00ff88",
    error: "#ff4757",
    border: "#333333",
    glassBorder: "rgba(255, 255, 255, 0.15)",
    glassBackground: "rgba(20, 20, 22, 0.6)",
  },
};

// --- Background Animation Components ---
const TwinklingStar = ({ style, size }: { style: object; size: number }) => {
  const opacity = useSharedValue(0);
  useEffect(() => {
    const randomDelay = Math.random() * 5000;
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8 + Math.random() * 0.2, {
            duration: 1500 + Math.random() * 2000,
          }),
          withTiming(0.3 + Math.random() * 0.2, {
            duration: 1500 + Math.random() * 2000,
          })
        ),
        -1,
        true
      );
    }, randomDelay);
    return () => {
      clearTimeout(timer);
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        styles.star,
        { width: size, height: size, borderRadius: size / 2 },
        style,
        animatedStyle,
      ]}
    />
  );
};

const ParallaxStarfield = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        key: `s1-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 1.5 + 0.5,
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <TwinklingStar
          key={star.key}
          style={{ left: star.left, top: star.top }}
          size={star.size}
        />
      ))}
    </View>
  );
};

// --- Animated Requirement Item ---
const RequirementItem = ({ text, met }: { text: string; met: boolean }) => {
  const scale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);

  useEffect(() => {
    if (met) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      checkmarkOpacity.value = withTiming(1);
    } else {
      scale.value = withTiming(0);
      checkmarkOpacity.value = withTiming(0);
    }
  }, [met]);

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: checkmarkOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: withTiming(met ? Colors.dark.textSecondary : Colors.dark.textMuted, {
      duration: 300,
    }),
  }));

  return (
    <View style={styles.requirementItem}>
      <View style={styles.requirementIconContainer}>
        <Ionicons
          name={"ellipse-outline"}
          size={18}
          color={Colors.dark.textMuted}
        />
        <Animated.View
          style={[StyleSheet.absoluteFill, checkmarkAnimatedStyle]}
        >
          <Ionicons
            name={"checkmark-circle"}
            size={18}
            color={Colors.dark.neonGreen}
          />
        </Animated.View>
      </View>
      <Animated.Text style={[styles.requirementText, textAnimatedStyle]}>
        {text}
      </Animated.Text>
    </View>
  );
};

// --- Main Setup Screen ---
export default function SetupScreen() {
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const contentTranslateY = useSharedValue(50);
  const contentOpacity = useSharedValue(0);
  const orbitRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);
  const buttonScale = useSharedValue(1);
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  useEffect(() => {
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    contentOpacity.value = withTiming(1, { duration: 500 });
    orbitRotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
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
  }, []);

  const passwordsMatch =
    masterPassword === confirmPassword && confirmPassword.length > 0;
  const passwordStrength = calculatePasswordStrength(masterPassword);
  const entropy = calculateEntropy(masterPassword, 95);
  const canProceed = masterPassword.length >= 8 && passwordsMatch;

  const handleSetup = async () => {
    if (!canProceed) return;
    setIsLoading(true);
    try {
      const success = await setupMasterPassword(masterPassword);
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Setup Failed", "Failed to set up your master password.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));
  const orbitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />
      <ParallaxStarfield />

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: 150 },
        ]}
        showsVerticalScrollIndicator={false}
        style={contentAnimatedStyle}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.iconOrbit, orbitAnimatedStyle]} />
            <Animated.View style={[styles.iconGlow, glowAnimatedStyle]} />
            <View style={styles.iconPlanet}>
              <Ionicons
                name="shield-checkmark"
                size={45}
                color={Colors.dark.primary}
              />
            </View>
          </View>
          <Text style={styles.title}>Secure Your Vault</Text>
          <Text style={styles.subtitle}>
            Create a master password to protect your digital life.
          </Text>
        </View>

        <BlurView intensity={25} tint="dark" style={styles.glassPanel}>
          <Input
            label="Master Password"
            value={masterPassword}
            onChangeText={setMasterPassword}
            variant="password"
            showPasswordToggle
            leftIcon="key-outline"
          />
          {masterPassword.length > 0 && (
            <PasswordStrengthIndicator
              strength={passwordStrength}
              entropy={entropy}
            />
          )}
          <Input
            label="Confirm Master Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            variant="password"
            showPasswordToggle
            leftIcon="key-outline"
            error={
              confirmPassword.length > 0 && !passwordsMatch
                ? "Passwords do not match"
                : undefined
            }
          />
        </BlurView>

        <View style={styles.requirementsContainer}>
          <RequirementItem
            text="At least 8 characters long"
            met={masterPassword.length >= 8}
          />
          <RequirementItem
            text="Contains uppercase & lowercase"
            met={/[a-z]/.test(masterPassword) && /[A-Z]/.test(masterPassword)}
          />
          <RequirementItem
            text="Contains numbers"
            met={/\d/.test(masterPassword)}
          />
          <RequirementItem
            text="Contains special characters"
            met={/[^A-Za-z0-9]/.test(masterPassword)}
          />
        </View>
      </Animated.ScrollView>

      <View
        style={[styles.buttonContainer, { paddingBottom: insets.bottom || 24 }]}
      >
        <AnimatedPressable
          onPress={handleSetup}
          disabled={!canProceed || isLoading}
          onPressIn={() => (buttonScale.value = withSpring(0.95))}
          onPressOut={() => (buttonScale.value = withSpring(1))}
          style={buttonAnimatedStyle}
        >
          <Button
            title="Create Master Password"
            onPress={handleSetup}
            disabled={!canProceed}
            loading={isLoading}
            variant="primary"
            fullWidth
            size="large"
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  star: {
    position: "absolute",
    backgroundColor: "white",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 24,
  },
  iconOrbit: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "30",
    borderStyle: "dashed",
    position: "absolute",
  },
  iconGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.dark.primary,
  },
  iconPlanet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(10, 10, 11, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.primary + "60",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
  },
  glassPanel: {
    backgroundColor: Colors.dark.glassBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
    padding: 20,
    gap: 20,
    overflow: "hidden",
    marginBottom: 28,
  },
  requirementsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementIconContainer: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  requirementText: {
    fontSize: 15,
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
