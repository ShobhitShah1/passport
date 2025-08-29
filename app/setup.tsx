import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { setupMasterPassword } from "@/services/storage/secureStorage";

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


// --- Main Setup Screen ---
export default function SetupScreen() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();

  const buttonScale = useSharedValue(1);
  const shakeAnimation = useSharedValue(0);
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const canProceed = pin.length === 4;

  const handleDigitPress = (digit: string) => {
    if (step === 'create') {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        setError("");
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + digit;
        setConfirmPin(newConfirmPin);
        setError("");
        
        if (newConfirmPin.length === 4) {
          setTimeout(() => validatePins(pin, newConfirmPin), 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'create') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
    setError("");
  };

  const validatePins = (originalPin: string, confirmationPin: string) => {
    if (originalPin === confirmationPin) {
      handleSetup(originalPin);
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
        setStep('create');
        setPin("");
      }, 1500);
    }
  };

  const proceedToConfirm = () => {
    if (pin.length === 4) {
      setStep('confirm');
    }
  };

  const handleSetup = async (masterPin: string) => {
    setIsLoading(true);
    try {
      // Use PIN as master password for now - in production you'd want to derive a proper password
      const success = await setupMasterPassword(masterPin);
      if (success) {
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
            {step === 'create' 
              ? 'Create a 4-digit PIN to protect your passwords'
              : 'Confirm your PIN'
            }
          </Text>
        </View>

        <Animated.View style={[styles.pinSection, shakeStyle]}>
          <PinKeypad
            pin={step === 'create' ? pin : confirmPin}
            onDigitPress={handleDigitPress}
            onBackspace={handleBackspace}
            maxLength={4}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={16} color={Colors.dark.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Animated.View>

        {step === 'create' && pin.length === 4 && (
          <View style={styles.continueContainer}>
            <Button
              title="Continue"
              onPress={proceedToConfirm}
              variant="primary"
              fullWidth
              style={styles.continueButton}
            />
          </View>
        )}
      </View>

      <View
        style={[styles.buttonContainer, { paddingBottom: insets.bottom || 24 }]}
      >
        <AnimatedPressable
          onPress={handleButtonPress}
          disabled={!canProceed || isLoading}
          onPressIn={() => (buttonScale.value = withSpring(0.95))}
          onPressOut={() => (buttonScale.value = withSpring(1))}
          style={buttonAnimatedStyle}
        >
          <Button
            title="Create Master PIN"
            onPress={handleButtonPress}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.error + '20',
    borderRadius: 16,
    marginTop: 20,
    gap: 8,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 14,
    fontWeight: '500',
  },
  continueContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  continueButton: {
    marginBottom: 20,
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
