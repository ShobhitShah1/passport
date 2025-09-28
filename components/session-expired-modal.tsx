import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
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
import Colors from "../constants/Colors";
import { ReachPressable } from "./ui";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface SessionExpiredModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const FloatingParticle = ({ particle }: { particle: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const moveX = withRepeat(
      withTiming(Math.random() * 30 - 15, {
        duration: 3000 + Math.random() * 2000,
      }),
      -1,
      true
    );
    const moveY = withRepeat(
      withTiming(Math.random() * 30 - 15, {
        duration: 2500 + Math.random() * 1500,
      }),
      -1,
      true
    );
    const opacity = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1
    );

    return {
      transform: [{ translateX: moveX }, { translateY: moveY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: Colors.dark.primary,
          shadowColor: Colors.dark.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 3,
        },
        animatedStyle,
      ]}
    />
  );
};

const FloatingParticles = () => {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 300,
        y: Math.random() * 200,
        size: Math.random() * 2 + 1,
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

export default function SessionExpiredModal({
  visible,
  onClose,
  title = "Session Expired",
  message = "Your session has expired. Please log in again to access your vault.",
  buttonText = "Back to Login",
}: SessionExpiredModalProps) {
  const insets = useSafeAreaInsets();

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.5);
  const modalOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Enter animations
      backdropOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      modalOpacity.value = withTiming(1, { duration: 300 });

      // Icon animations
      iconScale.value = withDelay(
        200,
        withSpring(1, { damping: 12, stiffness: 150 })
      );
      iconRotation.value = withDelay(
        200,
        withSequence(
          withTiming(360, { duration: 800, easing: Easing.out(Easing.quad) }),
          withRepeat(
            withTiming(360, { duration: 4000, easing: Easing.linear }),
            -1
          )
        )
      );

      // Glow animation
      glowOpacity.value = withDelay(
        400,
        withRepeat(
          withSequence(
            withTiming(0.8, { duration: 2000 }),
            withTiming(0.4, { duration: 2000 })
          ),
          -1
        )
      );

      // Text animation
      textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    } else {
      // Exit animations
      backdropOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      iconScale.value = withTiming(0, { duration: 200 });
      textOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const handleClose = () => {
    // Trigger exit animations then close
    modalScale.value = withTiming(0.9, { duration: 150 });
    modalOpacity.value = withTiming(0, { duration: 150 });
    backdropOpacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <AnimatedBlurView
        style={[styles.backdrop, backdropStyle]}
        intensity={25}
        tint="dark"
      >
        <FloatingParticles />

        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <View style={styles.modal}>
            {/* Header with rotating icon */}
            <View style={styles.header}>
              <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
                <Animated.View style={[styles.iconGlow, glowStyle]} />
                <Svg width={80} height={80} viewBox="0 0 80 80">
                  <Defs>
                    <SvgLinearGradient
                      id="iconGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <Stop offset="0%" stopColor={Colors.dark.error} />
                      <Stop offset="100%" stopColor={Colors.dark.primary} />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="url(#iconGrad)"
                    opacity={0.3}
                  />
                </Svg>
                <View style={styles.iconContent}>
                  <Ionicons
                    name="time-outline"
                    size={32}
                    color={Colors.dark.error}
                  />
                </View>
              </Animated.View>
            </View>

            {/* Content */}
            <Animated.View style={[styles.content, textAnimatedStyle]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </Animated.View>

            {/* Action button */}
            <Animated.View
              style={[styles.buttonContainer, buttonAnimatedStyle]}
            >
              <ReachPressable
                style={styles.button}
                onPress={handleClose}
                onPressIn={() => (buttonScale.value = withSpring(0.95))}
                onPressOut={() => (buttonScale.value = withSpring(1))}
                reachScale={1.02}
                pressScale={0.98}
              >
                <LinearGradient
                  colors={[Colors.dark.error, Colors.dark.primary]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="arrow-forward" size={20} color="#0a0a0b" />
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </LinearGradient>
              </ReachPressable>
            </Animated.View>
          </View>
        </Animated.View>
      </AnimatedBlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    maxWidth: screenWidth * 0.85,
    width: "100%",
  },
  modal: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 80,
    height: 80,
  },
  iconGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.error,
    shadowColor: Colors.dark.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  iconContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  content: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: Colors.dark.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a0a0b",
  },
});
