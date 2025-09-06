import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import PinKeypad from "@/components/ui/PinKeypad";
import { ReachPressable } from "@/components/ui/ReachPressable";
import {
  setupMasterPassword,
  saveSettings,
  loadSettings,
} from "@/services/storage/secureStorage";

import Colors from "@/constants/Colors";

// --- Static Background Components ---
const ParallaxStarfield = React.memo(() => {
  const stars = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
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
        <View
          key={star.key}
          style={[
            styles.star,
            {
              left: star.left as any,
              top: star.top as any,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: 0.5,
            },
          ]}
        />
      ))}
    </View>
  );
});

// Biometric Setup Component
const BiometricSetup = React.memo(
  ({
    biometricIcon,
    biometricText,
    onEnable,
    onSkip,
    isLoading,
  }: {
    biometricIcon: string;
    biometricText: string;
    onEnable: () => void;
    onSkip: () => void;
    isLoading: boolean;
  }) => {
    const glowAnimation = useSharedValue(0.3);
    const scaleAnimation = useSharedValue(1);

    React.useEffect(() => {
      glowAnimation.value = withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      );

      scaleAnimation.value = withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
      shadowOpacity: glowAnimation.value,
    }));

    const scaleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnimation.value }],
    }));

    return (
      <View style={styles.biometricContainer}>
        <Animated.View
          style={[styles.biometricIconContainer, glowStyle, scaleStyle]}
        >
          <LinearGradient
            colors={[Colors.dark.neonGreen, Colors.dark.primary]}
            style={styles.biometricIconGradient}
          >
            <Ionicons name={biometricIcon as any} size={48} color="#0a0a0b" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.biometricTitle}>Enable {biometricText}?</Text>
        <Text style={styles.biometricSubtitle}>
          Use {biometricText.toLowerCase()} to unlock your vault quickly and
          securely. You can always use your PIN as backup.
        </Text>

        <View style={styles.biometricActions}>
          <ReachPressable
            style={styles.biometricEnableButton}
            onPress={onEnable}
            reachScale={1.02}
            pressScale={0.98}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.dark.neonGreen, Colors.dark.primary]}
              style={styles.biometricEnableGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color="#0a0a0b" />
              <Text style={styles.biometricEnableText}>
                Enable {biometricText}
              </Text>
            </LinearGradient>
          </ReachPressable>

          <ReachPressable
            style={styles.biometricSkipButton}
            onPress={onSkip}
            reachScale={1.02}
            pressScale={0.98}
            disabled={isLoading}
          >
            <View style={styles.biometricSkipContent}>
              <Text style={styles.biometricSkipText}>
                Continue with PIN only
              </Text>
            </View>
          </ReachPressable>
        </View>
      </View>
    );
  }
);

// --- Main Setup Screen ---
export default function SetupScreen() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"create" | "confirm" | "biometric">(
    "create"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricType, setBiometricType] = useState<
    LocalAuthentication.AuthenticationType[]
  >([]);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (enrolled) {
        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        setBiometricType(types);
      }
    }
  };

  const getBiometricIcon = () => {
    if (
      biometricType.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      )
    ) {
      return "happy-outline";
    }
    if (
      biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ) {
      return "finger-print";
    }
    return "lock-closed";
  };

  const getBiometricText = () => {
    if (
      biometricType.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      )
    ) {
      return "Face ID";
    }
    if (
      biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ) {
      return "Fingerprint";
    }
    return "Biometric";
  };

  const buttonScale = useSharedValue(1);
  const shakeAnimation = useSharedValue(0);
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const canProceed = pin.length === 4;

  const handleDigitPress = (digit: string) => {
    if (step === "create") {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        setError("");
        
        // Auto-continue when PIN is complete
        if (newPin.length === 4) {
          setTimeout(() => {
            setStep("confirm");
          }, 200);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + digit;
        setConfirmPin(newConfirmPin);
        setError("");

        if (newConfirmPin.length === 4) {
          setTimeout(() => validatePins(pin, newConfirmPin), 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === "create") {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
    setError("");
  };

  const validatePins = (originalPin: string, confirmationPin: string) => {
    if (originalPin === confirmationPin) {
      if (biometricType.length > 0) {
        setStep("biometric");
      } else {
        handleSetup(originalPin);
      }
    } else {
      setError("PINs don't match. Try again.");
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      setTimeout(() => {
        setConfirmPin("");
        setStep("create");
        setPin("");
      }, 300);
    }
  };


  const handleSetup = async (masterPin: string) => {
    setIsLoading(true);
    try {
      const success = await setupMasterPassword(masterPin);
      if (success) {
        // Update biometric preference in settings
        const settings = await loadSettings();
        if (settings) {
          settings.biometricEnabled = isBiometricEnabled;
          await saveSettings(settings);
        }
        router.replace("/(tabs)");
      } else {
        Alert.alert("Setup Failed", "Failed to set up your master PIN.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithoutBiometric = () => {
    setIsBiometricEnabled(false);
    handleSetup(pin);
  };

  const enableBiometric = () => {
    setIsBiometricEnabled(true);
    handleSetup(pin);
  };

  const handleButtonPress = () => {
    handleSetup(pin);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  return (
    <View style={styles.container}>
      <ParallaxStarfield />

      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={styles.iconOrbit} />
            <View style={styles.iconGlow} />
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
            {step === "create"
              ? "Create a 4-digit PIN to protect your passwords"
              : step === "confirm"
              ? "Confirm your PIN"
              : "Secure your vault with biometric authentication"}
          </Text>
        </View>

        <Animated.View style={[styles.pinSection, shakeStyle]}>
          {step !== "biometric" ? (
            <>
              <PinKeypad
                pin={step === "create" ? pin : confirmPin}
                onDigitPress={handleDigitPress}
                onBackspace={handleBackspace}
                maxLength={4}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="warning-outline"
                    size={16}
                    color={Colors.dark.error}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </>
          ) : (
            <BiometricSetup
              biometricIcon={getBiometricIcon()}
              biometricText={getBiometricText()}
              onEnable={enableBiometric}
              onSkip={proceedWithoutBiometric}
              isLoading={isLoading}
            />
          )}
        </Animated.View>

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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
  },
  iconGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.dark.primary,
    opacity: 0.5,
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
    fontSize: 32,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
  },
  pinSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.error + "20",
    borderRadius: 16,
    marginTop: 20,
    gap: 8,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 14,
    fontWeight: "500",
  },
  actionContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 32,
  },
  actionButton: {
    marginBottom: 20,
  },
  // Biometric Setup Styles
  biometricContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    width: "100%",
  },
  biometricIconContainer: {
    marginBottom: 32,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  biometricIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  biometricTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 16,
  },
  biometricSubtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: "90%",
  },
  biometricActions: {
    width: "100%",
    gap: 16,
  },
  biometricEnableButton: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  biometricEnableGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  biometricEnableText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0b",
  },
  biometricSkipButton: {
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  biometricSkipContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  biometricSkipText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
});
