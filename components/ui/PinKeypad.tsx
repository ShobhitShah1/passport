import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PinKeypadProps {
  pin: string;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  maxLength?: number;
}

const PinDot = memo(({ filled, index }: { filled: boolean; index: number }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    scale.value = withSpring(filled ? 1 : 0.8, { damping: 15 });
    opacity.value = withTiming(filled ? 1 : 0.3, { duration: 150 });
  }, [filled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pinDot, animatedStyle]}>
      <View
        style={[
          styles.pinDotInner,
          {
            backgroundColor: filled ? Colors.dark.primary : Colors.dark.surface,
          },
        ]}
      />
    </Animated.View>
  );
});

const KeypadButton = memo(
  ({
    children,
    onPress,
    style,
  }: {
    children: React.ReactNode;
    onPress: () => void;
    style?: any;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15 });
    };

    return (
      <AnimatedPressable
        style={[styles.keypadButton, style, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.keypadButtonInner}>{children}</View>
      </AnimatedPressable>
    );
  }
);

export default memo(function PinKeypad({
  pin,
  onDigitPress,
  onBackspace,
  maxLength = 4,
}: PinKeypadProps) {
  const handleDigitPress = React.useCallback(
    (digit: string) => {
      if (pin.length < maxLength) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        onDigitPress(digit);
      }
    },
    [pin.length, maxLength, onDigitPress]
  );

  const handleBackspace = React.useCallback(() => {
    if (pin.length > 0) {
      onBackspace();
    }
  }, [pin.length, onBackspace]);

  return (
    <View style={styles.container}>
      <View style={styles.pinContainer}>
        {Array.from({ length: maxLength }, (_, i) => (
          <PinDot key={i} filled={i < pin.length} index={i} />
        ))}
      </View>

      <View style={styles.keypad}>
        <View style={styles.keypadRow}>
          <KeypadButton onPress={() => handleDigitPress("1")}>
            <Text style={styles.keypadButtonText}>1</Text>
          </KeypadButton>
          <KeypadButton onPress={() => handleDigitPress("2")}>
            <Text style={styles.keypadButtonText}>2</Text>
          </KeypadButton>
          <KeypadButton onPress={() => handleDigitPress("3")}>
            <Text style={styles.keypadButtonText}>3</Text>
          </KeypadButton>
        </View>

        <View style={styles.keypadRow}>
          <KeypadButton onPress={() => handleDigitPress("4")}>
            <Text style={styles.keypadButtonText}>4</Text>
          </KeypadButton>
          <KeypadButton onPress={() => handleDigitPress("5")}>
            <Text style={styles.keypadButtonText}>5</Text>
          </KeypadButton>
          <KeypadButton onPress={() => handleDigitPress("6")}>
            <Text style={styles.keypadButtonText}>6</Text>
          </KeypadButton>
        </View>

        <View style={styles.keypadRow}>
          <KeypadButton onPress={() => handleDigitPress("7")}>
            <Text style={styles.keypadButtonText}>7</Text>
          </KeypadButton>
          <KeypadButton onPress={() => handleDigitPress("8")}>
            <Text style={styles.keypadButtonText}>8</Text>
          </KeypadButton>
          <KeypadButton onPress={() => handleDigitPress("9")}>
            <Text style={styles.keypadButtonText}>9</Text>
          </KeypadButton>
        </View>

        <View style={styles.keypadRow}>
          <View style={styles.keypadButton} />
          <KeypadButton onPress={() => handleDigitPress("0")}>
            <Text style={styles.keypadButtonText}>0</Text>
          </KeypadButton>
          <KeypadButton onPress={handleBackspace}>
            <Ionicons
              name="backspace-outline"
              size={24}
              color={Colors.dark.textSecondary}
            />
          </KeypadButton>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    gap: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  keypad: {
    gap: 16,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
  },
  keypadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  keypadButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.dark.text,
  },
});
