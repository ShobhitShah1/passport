import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import Animated, {
  Easing,
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

// Enhanced Biometric Particles Component
const BiometricParticles = React.memo(({ isActive }: { isActive: boolean }) => {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i * 360) / 8,
        distance: useSharedValue(0),
        opacity: useSharedValue(0),
      })),
    []
  );

  React.useEffect(() => {
    particles.forEach((particle, index) => {
      particle.distance.value = withRepeat(
        withSequence(
          withDelay(
            index * 100,
            withTiming(isActive ? 40 : 0, { duration: 800 })
          ),
          withTiming(isActive ? 60 : 0, { duration: 400 })
        ),
        -1,
        true
      );
      particle.opacity.value = withRepeat(
        withSequence(
          withDelay(
            index * 100,
            withTiming(isActive ? 0.6 : 0, { duration: 800 })
          ),
          withTiming(isActive ? 0.2 : 0, { duration: 400 })
        ),
        -1,
        true
      );
    });
  }, [isActive]);

  const ParticleComponent = ({ particle }: { particle: any }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const x =
        Math.cos((particle.angle * Math.PI) / 180) * particle.distance.value;
      const y =
        Math.sin((particle.angle * Math.PI) / 180) * particle.distance.value;
      return {
        transform: [{ translateX: x }, { translateY: y }],
        opacity: particle.opacity.value,
      };
    });

    return <AnimatedView style={[styles.biometricParticle, animatedStyle]} />;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </View>
  );
});

// Enhanced Biometric Ring Component
const BiometricRing = React.memo(
  ({
    isActive,
    progress,
  }: {
    isActive: boolean;
    progress: Animated.SharedValue<number>;
  }) => {
    const ringRotation = useSharedValue(0);
    const ringScale = useSharedValue(1);

    React.useEffect(() => {
      if (isActive) {
        ringRotation.value = withRepeat(
          withTiming(360, { duration: 3000, easing: Easing.linear }),
          -1
        );
        ringScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1
        );
      } else {
        ringRotation.value = withTiming(0, { duration: 500 });
        ringScale.value = withTiming(1, { duration: 500 });
      }
    }, [isActive]);

    const ringStyle = useAnimatedStyle(() => ({
      transform: [
        { rotate: `${ringRotation.value}deg` },
        { scale: ringScale.value },
      ],
    }));

    return (
      <AnimatedView style={[styles.biometricRing, ringStyle]}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          <Defs>
            <SvgLinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop
                offset="0%"
                stopColor={Colors.dark.neonGreen}
                stopOpacity="0.8"
              />
              <Stop
                offset="50%"
                stopColor={Colors.dark.primary}
                stopOpacity="0.6"
              />
              <Stop
                offset="100%"
                stopColor={Colors.dark.secondary}
                stopOpacity="0.4"
              />
            </SvgLinearGradient>
          </Defs>
          <Circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity={isActive ? 1 : 0.3}
          />
          <Circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke={Colors.dark.primary}
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity={isActive ? 0.6 : 0.2}
          />
        </Svg>
      </AnimatedView>
    );
  }
);

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
      <View style={styles.biometricAuthContainer}>
        {/* Enhanced Background Ring */}
        <BiometricRing isActive={isAuthenticating} progress={progress} />

        {/* Particle System */}
        <BiometricParticles isActive={isAuthenticating} />

        <Animated.View style={[styles.biometricButton, scaleStyle, glowStyle]}>
          {/* Outer Ring Glow Effect */}
          <AnimatedView
            style={[styles.biometricButtonOuterGlow, buttonGradientStyle]}
          />

          <ReachPressable
            onPress={onPress}
            disabled={isAuthenticating}
            reachScale={1.03}
            pressScale={0.97}
            style={styles.biometricButtonPressable}
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
              style={styles.biometricButtonContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 0.5, 1]}
            >
              {/* Icon Container with Enhanced Animation */}
              <View style={styles.biometricIconContainer}>
                <AnimatedView
                  style={[styles.biometricIconBackground, rotationStyle]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(255, 255, 255, 0.1)",
                      "rgba(255, 255, 255, 0.05)",
                    ]}
                    style={styles.biometricIconBackgroundGradient}
                  />
                </AnimatedView>
                <Ionicons
                  name={isAuthenticating ? "sync" : (icon as any)}
                  size={28}
                  color={isAuthenticating ? Colors.dark.text : "#0a0a0b"}
                  style={styles.biometricIcon}
                />
              </View>

              {/* Enhanced Text with Typing Effect */}
              <View style={styles.biometricTextContainer}>
                <Text
                  style={[
                    styles.biometricButtonText,
                    { color: isAuthenticating ? Colors.dark.text : "#0a0a0b" },
                  ]}
                >
                  {isAuthenticating
                    ? "Authenticating..."
                    : `Unlock with ${text}`}
                </Text>

                {/* Animated Progress Dots */}
                {isAuthenticating && (
                  <View style={styles.biometricProgressDots}>
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
                        <AnimatedView
                          key={index}
                          style={[styles.biometricProgressDot, dotStyle]}
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            </LinearGradient>
          </ReachPressable>
        </Animated.View>

        <Text style={styles.biometricOrText}>
          <Text style={{ opacity: 0.6 }}>or </Text>
          <Text style={styles.biometricOrTextEmphasis}>enter PIN manually</Text>
        </Text>
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
            <Svg width={120} height={120} viewBox="0 0 100 100">
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
              ? `Quick access with ${getBiometricText()}`
              : "Enter your 4-digit PIN to unlock"}
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
  // Enhanced Biometric Auth Styles
  biometricAuthContainer: {
    alignItems: "center",
    marginVertical: 50,
    position: "relative",
  },
  biometricButton: {
    borderRadius: 28,
    overflow: "visible",
    position: "relative",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  biometricButtonOuterGlow: {
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
  biometricButtonPressable: {
    borderRadius: 28,
  },
  biometricButtonContent: {
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
  biometricIconContainer: {
    position: "relative",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  biometricIconBackground: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  biometricIconBackgroundGradient: {
    flex: 1,
    borderRadius: 18,
  },
  biometricIcon: {
    zIndex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  biometricTextContainer: {
    alignItems: "center",
    flex: 1,
  },
  biometricButtonText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  biometricProgressDots: {
    flexDirection: "row",
    marginTop: 8,
    gap: 4,
  },
  biometricProgressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  biometricOrText: {
    fontSize: 15,
    color: Colors.dark.textMuted,
    marginTop: 32,
    textAlign: "center",
    fontWeight: "500",
  },
  biometricOrTextEmphasis: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  biometricRing: {
    position: "absolute",
    top: -60,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  biometricParticle: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.dark.neonGreen,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    top: "50%",
    left: "50%",
    marginTop: -1.5,
    marginLeft: -1.5,
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
