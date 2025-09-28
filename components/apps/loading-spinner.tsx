import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const LoadingSpinner: React.FC = React.memo(() => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingSpinner, animatedStyle]}>
        <Ionicons name="sync" size={32} color={Colors.dark.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>Scanning installed apps...</Text>
      <Text style={styles.loadingSubtext}>This may take a moment</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingSpinner: {
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default LoadingSpinner;