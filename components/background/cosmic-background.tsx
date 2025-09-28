import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface CosmicBackgroundProps {
  variant?: "auth" | "setup" | "default";
  children?: React.ReactNode;
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  variant = "default",
  children,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case "auth":
        return ["#02000a", "#0a0a0b", "#02000a"];
      case "setup":
        return ["#02000a", "#0a0a0b", "#1a0a1b", "#0a0a0b"];
      default:
        return ["#0a0a0b", "#1a1a1b", "#0a0a0b"];
    }
  };

  const getGradientLocations = () => {
    switch (variant) {
      case "setup":
        return [0, 0.3, 0.7, 1];
      default:
        return undefined;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={getGradientLocations()}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default CosmicBackground;