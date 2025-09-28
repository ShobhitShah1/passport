import React, { useCallback, useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface ShootingStarProps {
  delay: number;
  duration: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({ delay, duration }) => {
  const translateX = useSharedValue(width * 2);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const animateStar = useCallback(() => {
    "worklet";

    const loop = () => {
      "worklet";
      translateX.value = Math.random() * width * 1.2 - width * 0.1;
      translateY.value = -100;
      opacity.value = 0;

      const randomDelay = delay + Math.random() * 4000;

      opacity.value = withDelay(
        randomDelay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(1, { duration: duration - 600 }),
          withTiming(0, { duration: 500 })
        )
      );

      translateY.value = withDelay(
        randomDelay,
        withTiming(height + 100, {
          duration: duration,
          easing: Easing.linear,
        })
      );

      translateX.value = withDelay(
        randomDelay,
        withTiming(
          translateX.value - height,
          {
            duration: duration,
            easing: Easing.linear,
          },
          (isFinished) => {
            if (isFinished) {
              loop();
            }
          }
        )
      );
    };

    loop();
  }, [delay, duration]);

  useEffect(() => {
    animateStar();

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [animateStar]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: "-45deg" },
    ],
  }));

  return <Animated.View style={[styles.shootingStar, animatedStyle]} />;
};

const styles = StyleSheet.create({
  shootingStar: {
    position: "absolute",
    width: 80,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 1,
  },
});

export default ShootingStar;