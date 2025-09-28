import React, { useRef } from "react";
import { Animated, Pressable, PressableProps } from "react-native";

interface ReachPressableProps extends PressableProps {
  children: React.ReactNode;
  reachScale?: number;
  pressScale?: number;
  duration?: number;
}

export function ReachPressable({
  children,
  reachScale = 1.05,
  pressScale = 0.95,
  duration = 150,
  onPressIn,
  onPressOut,
  ...props
}: ReachPressableProps) {
  const { style } = props;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: reachScale,
        duration: duration * 0.7,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: pressScale,
        duration: duration * 0.3,
        delay: duration * 0.7,
        useNativeDriver: true,
      }),
    ]).start();

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();

    onPressOut?.(event);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={null}
    >
      {children}
    </Pressable>
  );
}

export default ReachPressable;
