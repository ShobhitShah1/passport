import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
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

interface CosmicHeaderProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: "auth" | "setup";
}

const CosmicHeader: React.FC<CosmicHeaderProps> = ({
  title,
  subtitle,
  icon,
  variant = "auth",
}) => {
  const orbitRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);
  const iconScale = useSharedValue(1);

  React.useEffect(() => {
    // Orbit animation
    orbitRotation.value = withRepeat(withTiming(-360, { duration: 30000 }), -1);

    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 3000 }),
        withTiming(0.4, { duration: 3000 })
      ),
      -1,
      true
    );

    // Subtle icon pulse
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const orbitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.setupIconContainer}>
        <Animated.View style={[styles.iconOrbit, orbitAnimatedStyle]} />
        <Animated.View style={[styles.iconGlow, glowAnimatedStyle]} />
        <View style={styles.iconPlanet}>
          <Animated.View style={iconAnimatedStyle}>
            <Ionicons name={icon} size={45} color={Colors.dark.primary} />
          </Animated.View>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 60,
  },
  // Auth variant styles
  authIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "relative",
  },
  authIcon: {
    position: "absolute",
  },
  // Setup variant styles
  setupIconContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 32,
  },
  iconOrbit: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "30",
    borderStyle: "dashed",
    position: "absolute",
  },
  iconGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.dark.primary,
    opacity: 0.5,
  },
  iconPlanet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(10, 10, 11, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.primary + "60",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
    maxWidth: "90%",
  },
});

export default CosmicHeader;
