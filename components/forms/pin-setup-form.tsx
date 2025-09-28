import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { PinKeypad } from "../input";

interface PinSetupFormProps {
  step: "create" | "confirm";
  pin: string;
  confirmPin: string;
  error: string;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  shakeAnimation: Animated.SharedValue<number>;
}

const PinSetupForm: React.FC<PinSetupFormProps> = ({
  step,
  pin,
  confirmPin,
  error,
  onDigitPress,
  onBackspace,
  shakeAnimation,
}) => {
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      <PinKeypad
        pin={step === "create" ? pin : confirmPin}
        onDigitPress={onDigitPress}
        onBackspace={onBackspace}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default PinSetupForm;
