import React, { useEffect } from "react";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";

interface TwinklingStarProps {
  style: any;
  size: number;
}

const TwinklingStar: React.FC<TwinklingStarProps> = ({ style, size }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const randomDelay = Math.random() * 5000;
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8 + Math.random() * 0.2, {
            duration: 1500 + Math.random() * 2000,
          }),
          withTiming(0.3 + Math.random() * 0.2, {
            duration: 1500 + Math.random() * 2000,
          })
        ),
        -1,
        true
      );
    }, randomDelay);

    return () => {
      clearTimeout(timer);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
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
};

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    backgroundColor: "white",
  },
});

export default TwinklingStar;