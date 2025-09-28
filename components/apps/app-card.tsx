import { AppIcon } from "@/components/icons";
import { ReachPressable } from "@/components/ui";
import Colors from "@/constants/Colors";
import { InstalledApp } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AppCardProps {
  app: InstalledApp;
  index: number;
  hasPassword: boolean;
  onAddPassword: (app: InstalledApp) => void;
}

const AppCard: React.FC<AppCardProps> = React.memo(
  ({ app, index, hasPassword, onAddPassword }) => {
    const cardScale = useSharedValue(1);

    const handlePress = () => {
      if (hasPassword) {
        Alert.alert(
          "Password Saved",
          `You already have credentials for ${app.name}. Would you like to view them?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "View",
              onPress: () => {
                // TODO: Navigate to password details
              },
            },
          ]
        );
      } else {
        onAddPassword(app);
      }
    };

    const handlePressIn = () => {
      "worklet";
      cardScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
      "worklet";
      cardScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    return (
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        <ReachPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cardPressable}
          reachScale={1}
          pressScale={1}
        >
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.06)",
              "rgba(255, 255, 255, 0.02)",
              "rgba(255, 255, 255, 0.01)",
            ]}
            style={[
              styles.card,
              hasPassword && styles.cardSecured,
              !app.isSupported && styles.cardUnsupported,
            ]}
          >
            {/* App Icon */}
            <View style={styles.iconContainer}>
              <AppIcon
                appName={app.name}
                appId={app.id}
                icon={app.icon}
                size="large"
                showGlow={app.isSupported}
              />
              {hasPassword && (
                <View style={styles.securedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#000000" />
                </View>
              )}
            </View>

            {/* App Details */}
            <View style={styles.appDetails}>
              <Text style={styles.appName} numberOfLines={1}>
                {app.name}
              </Text>

              <View style={styles.metadataContainer}>
                <Text style={styles.categoryText}>
                  {app.category || (app.isSupported ? "Supported" : "Custom")}
                </Text>

                {app.isSupported && (
                  <View style={styles.verifiedBadge}>
                    <View style={styles.verifiedDot} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>

              {app.packageName && (
                <Text style={styles.packageName} numberOfLines={1}>
                  {app.packageName}
                </Text>
              )}
            </View>

            {/* Action Button */}
            <View style={styles.actionContainer}>
              <View
                style={[
                  styles.actionButton,
                  hasPassword && styles.actionButtonSecured,
                ]}
              >
                <Ionicons
                  name={hasPassword ? "checkmark-circle" : "add-circle"}
                  size={18}
                  color={
                    hasPassword ? Colors.dark.neonGreen : Colors.dark.primary
                  }
                />
                <Text
                  style={[
                    styles.actionText,
                    hasPassword && styles.actionTextSecured,
                  ]}
                >
                  {hasPassword ? "Secured" : "Add"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ReachPressable>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 6,
    maxWidth: "48%",
  },
  cardPressable: {
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 15,
    minHeight: 160,
    justifyContent: "space-between",
  },
  cardSecured: {
    borderColor: "rgba(0, 255, 136, 0.3)",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardUnsupported: {
    // opacity: 0.6,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  securedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 255, 136, 0.2)",
    borderWidth: 2,
    borderColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
  },
  appDetails: {
    flex: 1,
    marginBottom: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 3,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  metadataContainer: {
    alignItems: "center",
    gap: 5,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  verifiedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.neonGreen,
  },
  verifiedText: {
    fontSize: 10,
    color: Colors.dark.neonGreen,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  packageName: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontStyle: "italic",
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: 4,
  },
  actionContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButtonSecured: {
    borderColor: "rgba(0, 255, 136, 0.2)",
    backgroundColor: "rgba(0, 255, 136, 0.05)",
  },
  actionText: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  actionTextSecured: {
    fontSize: 12,
    color: Colors.dark.neonGreen,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default AppCard;
