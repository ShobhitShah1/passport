import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface BiometricParticlesProps {
  isActive: boolean;
}

const BiometricParticles: React.FC<BiometricParticlesProps> = ({ isActive }) => {
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

    return <Animated.View style={[styles.particle, animatedStyle]} />;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
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
});

export default BiometricParticles;