import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import TwinklingStar from "./twinkling-star";
import ShootingStar from "./shooting-star";

const ParallaxStarfield: React.FC = () => {
  const starsLayer1 = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        key: `s1-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 1.5 + 0.5,
      })),
    []
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        key: `ss-${i}`,
        delay: i * 2000,
        duration: 1000 + Math.random() * 2000,
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {starsLayer1.map((star) => (
        <TwinklingStar
          key={star.key}
          style={{ left: star.left, top: star.top }}
          size={star.size}
        />
      ))}
      {shootingStars.map((star) => (
        <ShootingStar
          key={star.key}
          delay={Number(star.key)}
          duration={star.duration}
        />
      ))}
    </View>
  );
};

export default ParallaxStarfield;