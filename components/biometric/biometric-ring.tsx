import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

interface BiometricRingProps {
  isActive: boolean;
  progress: Animated.SharedValue<number>;
}

const BiometricRing: React.FC<BiometricRingProps> = ({ isActive, progress }) => {
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
    <Animated.View style={[styles.container, ringStyle]}>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -60,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
});

export default BiometricRing;