import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface StarFieldProps {
  density?: "low" | "medium" | "high";
  animated?: boolean;
}

interface Star {
  key: string;
  left: string;
  top: string;
  size: number;
  opacity: number;
  delay: number;
}

const TwinklingStar: React.FC<{ star: Star; animated: boolean }> = ({
  star,
  animated,
}) => {
  const opacity = useSharedValue(star.opacity);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    if (!animated) return;

    const animate = () => {
      opacity.value = withSequence(
        withDelay(
          star.delay,
          withTiming(Math.random() * 0.8 + 0.2, { duration: 2000 })
        ),
        withTiming(Math.random() * 0.8 + 0.2, { duration: 2000 })
      );
      scale.value = withSequence(
        withDelay(
          star.delay,
          withTiming(Math.random() * 0.5 + 0.8, { duration: 2000 })
        ),
        withTiming(Math.random() * 0.5 + 0.8, { duration: 2000 })
      );
      setTimeout(animate, 4000 + Math.random() * 2000);
    };
    animate();
  }, [animated, star.delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animated ? opacity.value : star.opacity,
    transform: [{ scale: animated ? scale.value : 1 }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const StarField: React.FC<StarFieldProps> = ({
  density = "medium",
  animated = true,
}) => {
  const starCount = {
    low: 15,
    medium: 25,
    high: 40,
  }[density];

  const stars = useMemo(
    () =>
      Array.from({ length: starCount }, (_, i) => ({
        key: `star-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.2,
        delay: Math.random() * 3000,
      })),
    [starCount]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <TwinklingStar key={star.key} star={star} animated={animated} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: "absolute",
    backgroundColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
});

export default StarField;