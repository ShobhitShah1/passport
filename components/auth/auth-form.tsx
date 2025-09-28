import Colors from "@/constants/Colors";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ReachPressable } from "@/components/ui/reach-pressable";
import { PinKeypad } from "../input";

interface AuthFormProps {
  pin: string;
  failedAttempts: number;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  shakeAnimation: Animated.SharedValue<number>;
}

const AuthForm: React.FC<AuthFormProps> = ({
  pin,
  failedAttempts,
  onDigitPress,
  onBackspace,
  shakeAnimation,
}) => {
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <PinKeypad
        pin={pin}
        onDigitPress={onDigitPress}
        onBackspace={onBackspace}
        maxLength={4}
      />

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
    </Animated.View>
  );
};

interface SwitchAuthButtonProps {
  biometricIcon: string;
  biometricText: string;
  onPress: () => void;
}

export const SwitchAuthButton: React.FC<SwitchAuthButtonProps> = ({
  biometricIcon,
  biometricText,
  onPress,
}) => (
  <View style={styles.switchContainer}>
    <ReachPressable
      style={styles.switchButton}
      onPress={onPress}
      reachScale={1.02}
      pressScale={0.98}
    >
      <Ionicons
        name={biometricIcon as any}
        size={20}
        color={Colors.dark.primary}
      />
      <Text style={styles.switchText}>Use {biometricText}</Text>
    </ReachPressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
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
  switchContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  switchButton: {
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
  switchText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
});

export default AuthForm;
