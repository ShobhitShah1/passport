import Colors from "@/constants/Colors";
import { ReachPressable } from "@/components/ui/reach-pressable";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import BiometricParticles from "./biometric-particles";
import BiometricRing from "./biometric-ring";

interface BiometricAuthButtonProps {
  icon: string;
  text: string;
  onPress: () => void;
  isAuthenticating: boolean;
  scale: Animated.SharedValue<number>;
  glow: Animated.SharedValue<number>;
}

const BiometricAuthButton: React.FC<BiometricAuthButtonProps> = ({
  icon,
  text,
  onPress,
  isAuthenticating,
  scale,
  glow,
}) => {
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.3);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * glowIntensity.value,
    shadowRadius: 25 + glow.value * 15,
    shadowColor: isAuthenticating
      ? Colors.dark.primary
      : Colors.dark.neonGreen,
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const buttonGradientStyle = useAnimatedStyle(() => ({
    opacity: isAuthenticating ? 0.9 : 1,
  }));

  React.useEffect(() => {
    if (isAuthenticating) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1
      );
      progress.value = withRepeat(withTiming(1, { duration: 2000 }), -1);
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1
      );
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 })
        ),
        -1
      );
    } else {
      rotation.value = withTiming(0, { duration: 600 });
      progress.value = withTiming(0, { duration: 300 });
      pulseScale.value = withTiming(1, { duration: 400 });
      glowIntensity.value = withTiming(0.3, { duration: 400 });
    }
  }, [isAuthenticating]);

  return (
    <View style={styles.container}>
      <BiometricRing isActive={isAuthenticating} progress={progress} />
      <BiometricParticles isActive={isAuthenticating} />

      <Animated.View style={[styles.button, scaleStyle, glowStyle]}>
        <Animated.View style={[styles.outerGlow, buttonGradientStyle]} />

        <ReachPressable
          onPress={onPress}
          disabled={isAuthenticating}
          reachScale={1.03}
          pressScale={0.97}
          style={styles.pressable}
        >
          <LinearGradient
            colors={
              isAuthenticating
                ? [
                    Colors.dark.primary,
                    Colors.dark.secondary,
                    Colors.dark.primary,
                  ]
                : [
                    Colors.dark.neonGreen,
                    Colors.dark.primary,
                    Colors.dark.neonGreen,
                  ]
            }
            style={styles.content}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.5, 1]}
          >
            <View style={styles.iconContainer}>
              <Animated.View style={[styles.iconBackground, rotationStyle]}>
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.1)",
                    "rgba(255, 255, 255, 0.05)",
                  ]}
                  style={styles.iconBackgroundGradient}
                />
              </Animated.View>
              <Ionicons
                name={isAuthenticating ? "sync" : (icon as any)}
                size={28}
                color={isAuthenticating ? Colors.dark.text : "#0a0a0b"}
                style={styles.icon}
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.buttonText,
                  { color: isAuthenticating ? Colors.dark.text : "#0a0a0b" },
                ]}
              >
                {isAuthenticating ? "Authenticating..." : `Unlock with ${text}`}
              </Text>

              {isAuthenticating && (
                <View style={styles.progressDots}>
                  {[0, 1, 2].map((index) => {
                    const dotScale = useSharedValue(0.8);
                    const dotOpacity = useSharedValue(0.3);

                    React.useEffect(() => {
                      dotScale.value = withRepeat(
                        withDelay(
                          index * 200,
                          withSequence(
                            withTiming(1.2, { duration: 400 }),
                            withTiming(0.8, { duration: 400 })
                          )
                        ),
                        -1
                      );
                      dotOpacity.value = withRepeat(
                        withDelay(
                          index * 200,
                          withSequence(
                            withTiming(0.8, { duration: 400 }),
                            withTiming(0.3, { duration: 400 })
                          )
                        ),
                        -1
                      );
                    }, []);

                    const dotStyle = useAnimatedStyle(() => ({
                      transform: [{ scale: dotScale.value }],
                      opacity: dotOpacity.value,
                    }));

                    return (
                      <Animated.View
                        key={index}
                        style={[styles.progressDot, dotStyle]}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          </LinearGradient>
        </ReachPressable>
      </Animated.View>

      <Text style={styles.orText}>
        <Text style={{ opacity: 0.6 }}>or </Text>
        <Text style={styles.orTextEmphasis}>enter PIN manually</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 50,
    position: "relative",
  },
  button: {
    borderRadius: 28,
    overflow: "visible",
    position: "relative",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  outerGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 36,
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  pressable: {
    borderRadius: 28,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 32,
    gap: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minWidth: 240,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  iconContainer: {
    position: "relative",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  iconBackgroundGradient: {
    flex: 1,
    borderRadius: 18,
  },
  icon: {
    zIndex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textContainer: {
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  progressDots: {
    flexDirection: "row",
    marginTop: 8,
    gap: 4,
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  orText: {
    fontSize: 15,
    color: Colors.dark.textMuted,
    marginTop: 32,
    textAlign: "center",
    fontWeight: "500",
  },
  orTextEmphasis: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
});

export default BiometricAuthButton;