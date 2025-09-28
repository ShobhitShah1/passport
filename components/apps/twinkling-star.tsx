import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface TwinklingStarProps {
  style: object;
  size: number;
}

const TwinklingStar: React.FC<TwinklingStarProps> = React.memo(({ style, size }) => {
  const opacity = useSharedValue(0.2);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 2000 + Math.random() * 1000 }),
      -1,
      true
    );
    scale.value = withRepeat(
      withTiming(1.2, { duration: 3000 + Math.random() * 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        { width: size, height: size, borderRadius: size / 2 },
        style,
        animatedStyle,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    backgroundColor: "white",
  },
});

export default TwinklingStar;