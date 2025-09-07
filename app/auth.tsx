import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import PinKeypad from "@/components/ui/PinKeypad";
import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { loadSettings } from "@/services/storage/secureStorage";

const AnimatedView = Animated.createAnimatedComponent(View);

const StarField = React.memo(() => {
  const stars = React.useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        key: i,
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
          style={{
            position: "absolute",
            left: star.left as any,
            top: star.top as any,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: "white",
            opacity: 0.3,
          }}
        />
      ))}
    </View>
  );
});

const BiometricAuthButton = React.memo(
  ({
    icon,
    text,
    onPress,
    isAuthenticating,
    scale,
    glow,
  }: {
    icon: string;
    text: string;
    onPress: () => void;
    isAuthenticating: boolean;
    scale: Animated.SharedValue<number>;
    glow: Animated.SharedValue<number>;
  }) => {
    const scaleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      shadowOpacity: glow.value,
    }));

    return (
      <View style={styles.biometricAuthContainer}>
        <Animated.View style={[styles.biometricButton, scaleStyle, glowStyle]}>
          <ReachPressable
            onPress={onPress}
            disabled={isAuthenticating}
            reachScale={1}
            pressScale={1}
          >
            <LinearGradient
              colors={[Colors.dark.neonGreen, Colors.dark.primary]}
              style={styles.biometricButtonContent}
            >
              <Ionicons
                name={isAuthenticating ? "sync" : (icon as any)}
                size={24}
                color="#0a0a0b"
              />
              <Text style={styles.biometricButtonText}>
                {isAuthenticating ? "Authenticating..." : `Use ${text}`}
              </Text>
            </LinearGradient>
          </ReachPressable>
        </Animated.View>

        <Text style={styles.biometricOrText}>or</Text>
      </View>
    );
  }
);

function AuthScreen() {
  const [pin, setPin] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [biometricType, setBiometricType] = useState<
    LocalAuthentication.AuthenticationType[]
  >([]);
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const insets = useSafeAreaInsets();

  const shakeAnimation = useSharedValue(0);
  const biometricScale = useSharedValue(1);
  const biometricGlow = useSharedValue(0.3);
  const { authenticate } = useAppContext();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    // Check user's biometric preference
    const settings = await loadSettings();
    const userEnabledBiometric = settings?.biometricEnabled || false;
    setBiometricEnabled(userEnabledBiometric);

    if (userEnabledBiometric) {
      await checkBiometricAvailability();
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (enrolled) {
          const types =
            await LocalAuthentication.supportedAuthenticationTypesAsync();
          setBiometricType(types);
          setShowBiometric(true);
          // Auto-trigger biometric authentication immediately
          setTimeout(() => {
            handleBiometricAuth();
          }, 300);
        } else {
          // Hardware available but no biometrics enrolled
          setShowBiometric(false);
        }
      }
    } catch (error) {
      console.log("Biometric check error:", error);
      setShowBiometric(false);
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

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    biometricScale.value = withSpring(0.95, {}, () => {
      biometricScale.value = withSpring(1);
    });

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock your Passport",
        biometricsSecurityLevel: "strong",
        cancelLabel: "Use PIN",
        fallbackLabel: "Enter PIN",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Biometric authentication successful - proceed to app
        router.replace("/(tabs)");
      } else if (
        result.error?.toString() === "UserCancel" ||
        result.error?.toString() === "UserFallback"
      ) {
        // User cancelled or chose to use PIN - show PIN input
        setShowBiometric(false);
      } else {
        // Other errors - show PIN as fallback
        setShowBiometric(false);
      }
    } catch (error) {
      console.log("Biometric auth error:", error);
      setShowBiometric(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        // Immediately validate PIN when complete
        setTimeout(() => validatePin(newPin), 50);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const validatePin = async (enteredPin: string) => {
    try {
      // Use the PIN as master password to authenticate
      const success = await authenticate(enteredPin);
      if (success) {
        setFailedAttempts(0);
        router.replace("/(tabs)");
      } else {
        throw new Error("Invalid PIN");
      }
    } catch (error) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      Vibration.vibrate([0, 100, 50, 100]);
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      setTimeout(() => setPin(""), 300);
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  // Start gentle glow animation for biometric button
  React.useEffect(() => {
    biometricGlow.value = withSequence(
      withTiming(0.8, { duration: 2000 }),
      withTiming(0.3, { duration: 2000 })
    );
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StarField />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.spaceshipContainer}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
              <Defs>
                <SvgLinearGradient
                  id="spaceshipGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0%" stopColor={Colors.dark.primary} />
                  <Stop offset="100%" stopColor={Colors.dark.neonGreen} />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx="50"
                cy="50"
                r="35"
                fill="url(#spaceshipGradient)"
                opacity={0.3}
              />
            </Svg>
            <Ionicons
              name="rocket"
              size={50}
              color={Colors.dark.primary}
              style={styles.spaceshipIcon}
            />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            {showBiometric && biometricEnabled && biometricType.length > 0
              ? `Use ${getBiometricText()} or enter your PIN`
              : "Enter your 4-digit PIN"}
          </Text>
        </View>

        {/* Biometric Authentication Option */}
        {showBiometric && biometricEnabled && biometricType.length > 0 && (
          <BiometricAuthButton
            icon={getBiometricIcon()}
            text={getBiometricText()}
            onPress={handleBiometricAuth}
            isAuthenticating={isAuthenticating}
            scale={biometricScale}
            glow={biometricGlow}
          />
        )}

        <AnimatedView style={[styles.pinContainer, animatedContainerStyle]}>
          <PinKeypad
            pin={pin}
            onDigitPress={handleDigitPress}
            onBackspace={handleBackspace}
            maxLength={4}
          />
        </AnimatedView>

        {failedAttempts > 0 && (
          <BlurView intensity={25} tint="dark" style={styles.errorContainer}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={Colors.dark.error}
            />
            <Text style={styles.errorText}>
              {failedAttempts} failed attempt{failedAttempts === 1 ? "" : "s"}
            </Text>
          </BlurView>
        )}

        {/* Switch to PIN option */}
        {!showBiometric && biometricEnabled && biometricType.length > 0 && (
          <View style={styles.switchAuthContainer}>
            <ReachPressable
              style={styles.switchAuthButton}
              onPress={() => {
                setShowBiometric(true);
                setTimeout(() => handleBiometricAuth(), 300);
              }}
              reachScale={1.02}
              pressScale={0.98}
            >
              <Ionicons
                name={getBiometricIcon() as any}
                size={20}
                color={Colors.dark.primary}
              />
              <Text style={styles.switchAuthText}>
                Use {getBiometricText()}
              </Text>
            </ReachPressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
  spaceshipContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "relative",
  },
  spaceshipIcon: {
    position: "absolute",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  pinContainer: {
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 30,
    backgroundColor: "rgba(255, 71, 87, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 71, 87, 0.3)",
    gap: 8,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 14,
    fontWeight: "500",
  },
  // Biometric Auth Styles
  biometricAuthContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  biometricButton: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  biometricButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  biometricButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0b",
  },
  biometricOrText: {
    fontSize: 16,
    color: Colors.dark.textMuted,
    marginVertical: 20,
    textAlign: "center",
  },
  switchAuthContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  switchAuthButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  switchAuthText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
});

export default React.memo(AuthScreen);
