import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ReachPressable } from "@/components/ui";
import Colors from "@/constants/Colors";

interface AppsHeaderProps {
  viewMode: "apps" | "notes";
  loading: boolean;
  installedApps: any[];
  onViewModeChange: (mode: "apps" | "notes") => void;
  onAddNote: () => void;
}

const AppsHeader: React.FC<AppsHeaderProps> = ({
  viewMode,
  loading,
  installedApps,
  onViewModeChange,
  onAddNote,
}) => {
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (loading) {
      pulseScale.value = withRepeat(
        withTiming(1.05, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [loading]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const getHeaderInfo = () => {
    if (viewMode === "apps") {
      return {
        icon: "apps",
        title: "Digital Vault",
        subtitle: loading
          ? "Scanning quantum space..."
          : `${installedApps.length} apps discovered`,
        gradient: [
          "rgba(0, 212, 255, 0.15)",
          "rgba(139, 92, 246, 0.08)",
        ] as const,
      };
    }
    return {
      icon: "document-lock",
      title: "Secure Notes",
      subtitle: "Encrypted information storage",
      gradient: ["rgba(0, 255, 136, 0.15)", "rgba(0, 212, 255, 0.08)"] as const,
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Animated.View style={[styles.iconContainer, pulseAnimatedStyle]}>
              <LinearGradient
                colors={headerInfo.gradient}
                style={styles.iconGradient}
              >
                <Ionicons
                  name={headerInfo.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={Colors.dark.text}
                />
              </LinearGradient>
            </Animated.View>

            <View style={styles.titleContent}>
              <Text style={styles.title}>{headerInfo.title}</Text>
              <Text style={styles.subtitle}>{headerInfo.subtitle}</Text>
            </View>

            {/* Add Note Button */}
            {viewMode === "notes" && (
              <ReachPressable
                onPress={onAddNote}
                style={styles.addButton}
                reachScale={1.1}
                pressScale={0.9}
              >
                <LinearGradient
                  colors={["rgba(0, 255, 136, 0.2)", "rgba(0, 255, 136, 0.1)"]}
                  style={styles.addButtonGradient}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={Colors.dark.neonGreen}
                  />
                </LinearGradient>
              </ReachPressable>
            )}
          </View>
        </View>

        {/* Mode Toggle */}
        <View style={styles.toggleContainer}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.08)",
              "rgba(255, 255, 255, 0.04)",
              "rgba(255, 255, 255, 0.02)",
            ]}
            style={styles.toggleBackground}
          >
            <ReachPressable
              onPress={() => onViewModeChange("apps")}
              style={[
                styles.toggleButton,
                viewMode === "apps" && styles.toggleButtonActive,
              ]}
              reachScale={1.02}
              pressScale={0.98}
            >
              {viewMode === "apps" && (
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.electricBlue]}
                  style={styles.activeToggleGradient}
                />
              )}
              <Ionicons
                name="apps"
                size={18}
                color={
                  viewMode === "apps"
                    ? Colors.dark.background
                    : Colors.dark.textSecondary
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "apps" && styles.toggleTextActive,
                ]}
              >
                Apps
              </Text>
            </ReachPressable>

            <ReachPressable
              onPress={() => onViewModeChange("notes")}
              style={[
                styles.toggleButton,
                viewMode === "notes" && styles.toggleButtonActive,
              ]}
              reachScale={1.02}
              pressScale={0.98}
            >
              {viewMode === "notes" && (
                <LinearGradient
                  colors={[Colors.dark.neonGreen, Colors.dark.primary]}
                  style={styles.activeToggleGradient}
                />
              )}
              <Ionicons
                name="document-lock"
                size={18}
                color={
                  viewMode === "notes"
                    ? Colors.dark.background
                    : Colors.dark.textSecondary
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "notes" && styles.toggleTextActive,
                ]}
              >
                Notes
              </Text>
            </ReachPressable>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 12,
  },
  titleSection: {
    gap: 12,
    paddingBottom: 5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  titleContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.dark.text,
    letterSpacing: 0.5,
    lineHeight: 30,
    textShadowColor: "rgba(0, 212, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  addButton: {
    borderRadius: 18,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.2)",
  },
  toggleContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  toggleBackground: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    position: "relative",
    overflow: "hidden",
  },
  toggleButtonActive: {
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  activeToggleGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    letterSpacing: 0.4,
  },
  toggleTextActive: {
    color: Colors.dark.background,
    fontWeight: "700",
  },
});

export default AppsHeader;
