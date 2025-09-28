import Colors from "@/constants/Colors";
import { ReachPressable } from "@/components/ui/reach-pressable";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface BiometricSetupFormProps {
  biometricIcon: string;
  biometricText: string;
  onEnable: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

const BiometricSetupForm: React.FC<BiometricSetupFormProps> = ({
  biometricIcon,
  biometricText,
  onEnable,
  onSkip,
  isLoading,
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
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, glowStyle, scaleStyle]}>
        <LinearGradient
          colors={[Colors.dark.neonGreen, Colors.dark.primary]}
          style={styles.iconGradient}
        >
          <Ionicons name={biometricIcon as any} size={48} color="#0a0a0b" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.title}>Enable {biometricText}?</Text>
      <Text style={styles.subtitle}>
        Use {biometricText.toLowerCase()} to unlock your vault quickly and
        securely. You can always use your PIN as backup.
      </Text>

      <View style={styles.actions}>
        <ReachPressable
          style={styles.enableButton}
          onPress={onEnable}
          reachScale={1.02}
          pressScale={0.98}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[Colors.dark.neonGreen, Colors.dark.primary]}
            style={styles.enableGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color="#0a0a0b" />
            <Text style={styles.enableText}>Enable {biometricText}</Text>
          </LinearGradient>
        </ReachPressable>

        <ReachPressable
          style={styles.skipButton}
          onPress={onSkip}
          reachScale={1.02}
          pressScale={0.98}
          disabled={isLoading}
        >
          <View style={styles.skipContent}>
            <Text style={styles.skipText}>Continue with PIN only</Text>
          </View>
        </ReachPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 32,
    width: "100%",
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: "90%",
  },
  actions: {
    width: "100%",
    gap: 16,
  },
  enableButton: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  enableGradient: {
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
  enableText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0b",
  },
  skipButton: {
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  skipContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
});

export default BiometricSetupForm;