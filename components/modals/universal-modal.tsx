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
import Colors from "../../constants/Colors";
import { ReachPressable } from "../ui";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export type ModalType = "success" | "error" | "warning" | "info" | "confirm";

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: "primary" | "secondary" | "danger";
}

interface UniversalModalProps {
  visible: boolean;
  onClose: () => void;
  type: ModalType;
  title: string;
  message: string;
  buttons?: ModalButton[];
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const FloatingParticle = ({
  particle,
  type,
}: {
  particle: any;
  type: ModalType;
}) => {
  const getParticleColor = () => {
    switch (type) {
      case "success":
        return Colors.dark.neonGreen;
      case "error":
        return Colors.dark.error;
      case "warning":
        return "#FFA500";
      case "info":
        return Colors.dark.primary;
      default:
        return Colors.dark.primary;
    }
  };

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
          backgroundColor: getParticleColor(),
          shadowColor: getParticleColor(),
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 3,
        },
        animatedStyle,
      ]}
    />
  );
};

const FloatingParticles = ({ type }: { type: ModalType }) => {
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
        <FloatingParticle key={particle.id} particle={particle} type={type} />
      ))}
    </View>
  );
};

const getModalConfig = (type: ModalType) => {
  switch (type) {
    case "success":
      return {
        icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
        color: Colors.dark.neonGreen,
        gradientColors: [Colors.dark.neonGreen, Colors.dark.primary],
      };
    case "error":
      return {
        icon: "close-circle" as keyof typeof Ionicons.glyphMap,
        color: Colors.dark.error,
        gradientColors: [Colors.dark.error, "#8B0000"],
      };
    case "warning":
      return {
        icon: "warning" as keyof typeof Ionicons.glyphMap,
        color: "#FFA500",
        gradientColors: ["#FFA500", "#FF8C00"],
      };
    case "info":
      return {
        icon: "information-circle" as keyof typeof Ionicons.glyphMap,
        color: Colors.dark.primary,
        gradientColors: [Colors.dark.primary, Colors.dark.secondary],
      };
    case "confirm":
      return {
        icon: "help-circle" as keyof typeof Ionicons.glyphMap,
        color: Colors.dark.primary,
        gradientColors: [Colors.dark.primary, Colors.dark.secondary],
      };
  }
};

export default function UniversalModal({
  visible,
  onClose,
  type,
  title,
  message,
  buttons = [{ text: "OK", onPress: onClose, style: "primary" }],
  autoClose = false,
  autoCloseDelay = 2000,
}: UniversalModalProps) {
  const insets = useSafeAreaInsets();
  const config = getModalConfig(type);

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.5);
  const modalOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
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

      if (type === "success") {
        iconRotation.value = withDelay(
          200,
          withSequence(
            withTiming(360, { duration: 600, easing: Easing.out(Easing.quad) })
          )
        );
      } else if (type === "error") {
        iconRotation.value = withDelay(
          200,
          withSequence(
            withTiming(-10, { duration: 100 }),
            withTiming(10, { duration: 100 }),
            withTiming(-10, { duration: 100 }),
            withTiming(0, { duration: 100 })
          )
        );
      }

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

      // Auto close
      if (autoClose) {
        setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
      }
    } else {
      // Exit animations
      backdropOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      iconScale.value = withTiming(0, { duration: 200 });
      textOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, type, autoClose, autoCloseDelay]);

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

  const handleButtonPress = (button: ModalButton) => {
    handleClose();
    setTimeout(() => {
      button.onPress();
    }, 200);
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

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const getButtonStyle = (buttonStyle: string = "primary") => {
    switch (buttonStyle) {
      case "danger":
        return {
          colors: [Colors.dark.error, "#8B0000"],
          textColor: "#FFFFFF",
        };
      case "secondary":
        return {
          colors: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
          textColor: Colors.dark.text,
        };
      default:
        return {
          colors: config.gradientColors,
          textColor: "#0a0a0b",
        };
    }
  };

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
        <FloatingParticles type={type} />

        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <View style={styles.modal}>
            {/* Header with icon */}
            <View style={styles.header}>
              <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
                <Animated.View
                  style={[
                    styles.iconGlow,
                    glowStyle,
                    { backgroundColor: config.color },
                  ]}
                />
                <Svg width={80} height={80} viewBox="0 0 80 80">
                  <Defs>
                    <SvgLinearGradient
                      id={`iconGrad-${type}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <Stop offset="0%" stopColor={config.color} />
                      <Stop
                        offset="100%"
                        stopColor={config.gradientColors[1]}
                      />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill={`url(#iconGrad-${type})`}
                    opacity={0.3}
                  />
                </Svg>
                <View style={styles.iconContent}>
                  <Ionicons name={config.icon} size={32} color={config.color} />
                </View>
              </Animated.View>
            </View>

            {/* Content */}
            <Animated.View style={[styles.content, textAnimatedStyle]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </Animated.View>

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => {
                const buttonConfig = getButtonStyle(button.style);
                const buttonScale = useSharedValue(1);

                const buttonAnimatedStyle = useAnimatedStyle(() => ({
                  transform: [{ scale: buttonScale.value }],
                }));

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.buttonWrapper,
                      buttonAnimatedStyle,
                      buttons.length === 1 && styles.singleButton,
                    ]}
                  >
                    <ReachPressable
                      style={styles.button}
                      onPress={() => handleButtonPress(button)}
                      onPressIn={() => (buttonScale.value = withSpring(0.95))}
                      onPressOut={() => (buttonScale.value = withSpring(1))}
                      reachScale={1.02}
                      pressScale={0.98}
                    >
                      <LinearGradient
                        colors={buttonConfig.colors as any}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            { color: buttonConfig.textColor },
                          ]}
                        >
                          {button.text}
                        </Text>
                      </LinearGradient>
                    </ReachPressable>
                  </Animated.View>
                );
              })}
            </View>
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
    gap: 12,
  },
  buttonWrapper: {
    width: "100%",
  },
  singleButton: {
    width: "100%",
  },
  button: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
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
  },
});
