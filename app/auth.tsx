import { AuthForm, SwitchAuthButton } from "@/components/auth";
import { CosmicBackground, StarField } from "@/components/background";
import { BiometricAuthButton } from "@/components/biometric";
import { CosmicHeader } from "@/components/layout";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/use-app-context";
import { loadSettings } from "@/services/storage/secureStorage";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Vibration, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
      <CosmicBackground variant="auth">
        <StarField density="medium" />
      </CosmicBackground>

      <View style={styles.content}>
        <CosmicHeader
          title="Welcome Back"
          subtitle={
            showBiometric && biometricEnabled && biometricType.length > 0
              ? `Quick access with ${getBiometricText()}`
              : "Enter your 4-digit PIN to unlock"
          }
          icon="rocket"
          variant="auth"
        />

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

        <AuthForm
          pin={pin}
          failedAttempts={failedAttempts}
          onDigitPress={handleDigitPress}
          onBackspace={handleBackspace}
          shakeAnimation={shakeAnimation}
        />

        {/* Switch to PIN option */}
        {!showBiometric && biometricEnabled && biometricType.length > 0 && (
          <SwitchAuthButton
            biometricIcon={getBiometricIcon()}
            biometricText={getBiometricText()}
            onPress={() => {
              setShowBiometric(true);
              setTimeout(() => handleBiometricAuth(), 300);
            }}
          />
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
});

export default React.memo(AuthScreen);
