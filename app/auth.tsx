import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import PinKeypad from "@/components/ui/PinKeypad";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// PIN will be validated against stored master PIN

const StarField = React.memo(() => {
  const stars = React.useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.5,
    })), []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <View
          key={star.key}
          style={{
            position: 'absolute',
            left: star.left as any,
            top: star.top as any,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: 'white',
            opacity: 0.3,
          }}
        />
      ))}
    </View>
  );
});

function AuthScreen() {
  const [pin, setPin] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const insets = useSafeAreaInsets();

  const shakeAnimation = useSharedValue(0);
  const { authenticate } = useAppContext();

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(() => validatePin(newPin), 200);
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

      setTimeout(() => setPin(""), 500);
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));


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
            <Svg width={100} height={100} viewBox="0 0 100 100">
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
          <Text style={styles.subtitle}>Enter your 4-digit PIN</Text>
        </View>

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
});

export default React.memo(AuthScreen);
