import { CosmicBackground, StarField } from "@/components/background";
import { BiometricSetupForm, PinSetupForm } from "@/components/forms";
import { CosmicHeader } from "@/components/layout";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/use-app-context";
import {
  loadSettings,
  saveSettings,
  setupMasterPassword,
} from "@/services/storage/secureStorage";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModal } from "../contexts/modal-context";

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
  const { authenticate } = useAppContext();
  const { showError, showConfirm } = useModal();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setBiometricType([]);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setBiometricType([]);
        return;
      }

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.length === 0) {
        setBiometricType([]);
        return;
      }

      setBiometricType(types);
    } catch (error) {
      console.error("Error checking biometric support:", error);
      setBiometricType([]);
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

        // Authenticate the user through the context after successful setup
        const authSuccess = await authenticate(masterPin);
        if (authSuccess) {
          router.replace("/(tabs)");
        } else {
          showError("Setup Failed", "Failed to authenticate after setup.");
        }
      } else {
        showError("Setup Failed", "Failed to set up your master PIN.");
      }
    } catch (error) {
      showError("Error", "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithoutBiometric = () => {
    setIsBiometricEnabled(false);
    handleSetup(pin);
  };

  const enableBiometric = async () => {
    setIsLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          "Verify your biometric authentication to enable this feature",
        biometricsSecurityLevel: "strong",
        cancelLabel: "Cancel",
        fallbackLabel: "Use PIN",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsBiometricEnabled(true);
        handleSetup(pin);
      } else {
        showConfirm(
          "Biometric Setup Failed",
          "Biometric authentication failed. You can enable it later in settings.",
          () => enableBiometric(),
          () => {
            setIsBiometricEnabled(false);
            handleSetup(pin);
          }
        );
      }
    } catch (error) {
      showError(
        "Error",
        "Failed to verify biometric authentication. Continuing with PIN only."
      );
      setIsBiometricEnabled(false);
      handleSetup(pin);
    } finally {
      setIsLoading(false);
    }
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
      <CosmicBackground variant="setup">
        <StarField density="high" />
      </CosmicBackground>

      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <CosmicHeader
          title="Secure Your Vault"
          subtitle={
            step === "create"
              ? "Create a 4-digit PIN to protect your passwords"
              : step === "confirm"
              ? "Confirm your PIN"
              : "Secure your vault with biometric authentication"
          }
          icon="shield-checkmark"
          variant="setup"
        />

        {step !== "biometric" ? (
          <PinSetupForm
            step={step}
            pin={pin}
            confirmPin={confirmPin}
            error={error}
            onDigitPress={handleDigitPress}
            onBackspace={handleBackspace}
            shakeAnimation={shakeAnimation}
          />
        ) : (
          <BiometricSetupForm
            biometricIcon={getBiometricIcon()}
            biometricText={getBiometricText()}
            onEnable={enableBiometric}
            onSkip={proceedWithoutBiometric}
            isLoading={isLoading}
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
});
