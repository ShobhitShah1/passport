import React, { useCallback } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AppIcon } from "@/components/icons";
import { ReachPressable } from "@/components/ui";
import Colors from "@/constants/Colors";
import { usePasswordManager } from "@/hooks/use-password-manager";
import { Password, PasswordStrength } from "@/types";

interface PasswordPreviewCardProps {
  item: Password;
  copyToClipboard: (text: string, label?: string) => Promise<void>;
  index?: number;
  isRevealed: boolean;
  onToggleVisibility: (id: string) => void;
  onEdit: (password: Password) => void;
}

const PasswordPreviewCard: React.FC<PasswordPreviewCardProps> = ({
  item,
  copyToClipboard,
  index = 0,
  isRevealed,
  onToggleVisibility,
  onEdit,
}) => {
  const cardScale = useSharedValue(1);
  const { deletePassword: deletePasswordFromManager } = usePasswordManager();

  const getStrengthData = (strength: PasswordStrength) => {
    if (strength >= PasswordStrength.VERY_STRONG)
      return {
        color: Colors.dark.neonGreen,
        text: "Very Strong",
        icon: "shield-checkmark",
      };
    if (strength >= PasswordStrength.STRONG)
      return { color: Colors.dark.primary, text: "Strong", icon: "shield" };
    if (strength >= PasswordStrength.MODERATE)
      return {
        color: Colors.dark.warning,
        text: "Moderate",
        icon: "warning",
      };
    return { color: Colors.dark.error, text: "Weak", icon: "alert-circle" };
  };

  const strengthData = getStrengthData(item.strength);

  const handlePressIn = () => {
    "worklet";
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 150 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
  };

  const handlePressOut = () => {
    "worklet";
    cardScale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    handlePressIn();
  };

  const getBorderColor = () => {
    if (strengthData.color === Colors.dark.neonGreen)
      return "rgba(0, 255, 136, 0.2)";
    if (strengthData.color === Colors.dark.primary)
      return "rgba(0, 212, 255, 0.2)";
    if (strengthData.color === Colors.dark.warning)
      return "rgba(255, 171, 0, 0.2)";
    return "rgba(255, 71, 87, 0.2)";
  };

  const maskedPassword = item.password.replace(/./g, "•");

  const handleCopy = useCallback(
    async (text: string, label: string) => {
      try {
        await copyToClipboard(text, label);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Alert.alert("Copied!", `${label} copied to clipboard`);
      } catch (error) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        Alert.alert("Error", "Failed to copy to clipboard");
      }
    },
    [copyToClipboard]
  );

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View style={[styles.passwordPreviewCard, cardAnimatedStyle]}>
      <ReachPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.passwordPreviewContent}
        reachScale={1}
        pressScale={1}
      >
        <View
          style={[
            styles.passwordCardBorder,
            { borderColor: getBorderColor() },
          ]}
        >
          <LinearGradient
            colors={[
              `rgba(${
                strengthData.color === Colors.dark.neonGreen
                  ? "0, 255, 136"
                  : strengthData.color === Colors.dark.primary
                  ? "0, 212, 255"
                  : strengthData.color === Colors.dark.warning
                  ? "255, 171, 0"
                  : "255, 71, 87"
              }, 0.08)`,
              "rgba(255, 255, 255, 0.04)",
              "rgba(255, 255, 255, 0.01)",
            ]}
            style={styles.passwordPreviewGradient}
          >
            <View style={styles.passwordPreviewHeader}>
              <View style={styles.passwordAppInfo}>
                <View style={styles.appIconWrapper}>
                  <AppIcon appName={item.appName} size="medium" />
                  <View
                    style={[
                      styles.strengthIndicator,
                      { backgroundColor: strengthData.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={
                        strengthData.icon as keyof typeof Ionicons.glyphMap
                      }
                      size={10}
                      color={strengthData.color}
                    />
                  </View>
                </View>
                <View style={styles.passwordAppText}>
                  <Text style={styles.passwordAppName} numberOfLines={1}>
                    {item.appName}
                  </Text>
                  <View style={styles.passwordMetaRow}>
                    <View
                      style={[
                        styles.strengthBadge,
                        { backgroundColor: strengthData.color + "15" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.strengthBadgeText,
                          { color: strengthData.color },
                        ]}
                      >
                        {strengthData.text}
                      </Text>
                    </View>
                    <Text style={styles.passwordLastUsed}>
                      {item.lastUsed
                        ? new Date(item.lastUsed).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Never"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.passwordActions}>
                <ReachPressable
                  style={[styles.actionChip, styles.viewActionChip]}
                  onPress={() => onEdit(item)}
                  reachScale={1.1}
                  pressScale={0.9}
                >
                  <Ionicons
                    name="eye-outline"
                    size={14}
                    color={Colors.dark.primary}
                  />
                </ReachPressable>
                <ReachPressable
                  style={[styles.actionChip, styles.copyActionChip]}
                  onPress={() => handleCopy(item.password, "Password")}
                  reachScale={1.1}
                  pressScale={0.9}
                >
                  <Ionicons
                    name="copy-outline"
                    size={14}
                    color={Colors.dark.neonGreen}
                  />
                </ReachPressable>
                <ReachPressable
                  style={[styles.actionChip, styles.deleteActionChip]}
                  onPress={() => {
                    Alert.alert(
                      "Delete Password",
                      `Are you sure you want to delete the password for ${item.appName}? This action cannot be undone.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await deletePasswordFromManager(item.id);
                              await Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Success
                              );
                              Alert.alert(
                                "Success",
                                "Password deleted successfully"
                              );
                            } catch (error) {
                              await Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Error
                              );
                              Alert.alert(
                                "Error",
                                "Failed to delete password"
                              );
                            }
                          },
                        },
                      ]
                    );
                  }}
                  reachScale={1.1}
                  pressScale={0.9}
                >
                  <Ionicons name="trash-outline" size={14} color="#ff4757" />
                </ReachPressable>
              </View>
            </View>

            <View style={styles.passwordCredentials}>
              <View style={styles.credentialRow}>
                <View style={styles.credentialInfo}>
                  <Text style={styles.credentialLabel}>
                    {item.email
                      ? "📧 Email"
                      : item.username
                      ? "👤 Username"
                      : "🔑 Account"}
                  </Text>
                  <Text style={styles.credentialValue} numberOfLines={1}>
                    {item.email || item.username || "No account info"}
                  </Text>
                </View>
                {(item.email || item.username) && (
                  <ReachPressable
                    style={styles.inlineActionButton}
                    onPress={() => {
                      const value = item?.email || item?.username;
                      if (value) {
                        handleCopy(value, item.email ? "Email" : "Username");
                      }
                    }}
                    reachScale={1.1}
                    pressScale={0.9}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(0, 212, 255, 0.2)",
                        "rgba(0, 212, 255, 0.1)",
                      ]}
                      style={styles.inlineActionGradient}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={14}
                        color={Colors.dark.primary}
                      />
                    </LinearGradient>
                  </ReachPressable>
                )}
              </View>

              <View style={styles.credentialRow}>
                <View style={styles.credentialInfo}>
                  <Text style={styles.credentialLabel}>🔐 Password</Text>
                  <View style={styles.passwordDisplayContainer}>
                    <Text
                      style={styles.passwordDisplayText}
                      numberOfLines={1}
                    >
                      {isRevealed ? item.password : maskedPassword}
                    </Text>
                    <View style={styles.passwordStrengthBar}>
                      <View
                        style={[
                          styles.strengthBarFill,
                          {
                            width: `${(item.strength / 4) * 100}%`,
                            backgroundColor: strengthData.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.passwordActionButtons}>
                  <ReachPressable
                    style={styles.inlineActionButton}
                    onPress={() => onToggleVisibility(item.id)}
                    reachScale={1.1}
                    pressScale={0.9}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255, 171, 0, 0.2)",
                        "rgba(255, 171, 0, 0.1)",
                      ]}
                      style={styles.inlineActionGradient}
                    >
                      <Ionicons
                        name={isRevealed ? "eye-off-outline" : "eye-outline"}
                        size={14}
                        color={Colors.dark.warning}
                      />
                    </LinearGradient>
                  </ReachPressable>
                  <ReachPressable
                    style={styles.inlineActionButton}
                    onPress={() => handleCopy(item.password, "Password")}
                    reachScale={1.1}
                    pressScale={0.9}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(0, 255, 136, 0.2)",
                        "rgba(0, 255, 136, 0.1)",
                      ]}
                      style={styles.inlineActionGradient}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={14}
                        color={Colors.dark.neonGreen}
                      />
                    </LinearGradient>
                  </ReachPressable>
                </View>
              </View>
            </View>

            <View style={styles.passwordCardFooter}>
              <View style={styles.footerStats}>
                <View style={styles.statItem}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={Colors.dark.textMuted}
                  />
                  <Text style={styles.statText}>
                    {item.lastUsed ? "Used recently" : "Never used"}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons
                    name="shield-checkmark"
                    size={12}
                    color={strengthData.color}
                  />
                  <Text
                    style={[styles.statText, { color: strengthData.color }]}
                  >
                    {strengthData.text}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ReachPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  passwordPreviewCard: {
    borderRadius: 24,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 5,
  },
  passwordPreviewContent: {
    borderRadius: 24,
    overflow: "hidden",
  },
  passwordCardBorder: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  passwordPreviewGradient: {
    padding: 24,
    borderRadius: 24,
    minHeight: 200,
    position: "relative",
    overflow: "hidden",
  },
  passwordPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  appIconWrapper: {
    position: "relative",
    marginRight: 12,
  },
  strengthIndicator: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  viewActionChip: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  copyActionChip: {
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderColor: "rgba(0, 255, 136, 0.2)",
  },
  deleteActionChip: {
    backgroundColor: "rgba(255, 71, 87, 0.1)",
    borderColor: "rgba(255, 71, 87, 0.2)",
  },
  passwordAppInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  passwordAppText: {
    flex: 1,
  },
  passwordMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  strengthBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  passwordAppName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.text,
    letterSpacing: 0.3,
  },
  passwordLastUsed: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  passwordCredentials: {
    gap: 16,
    marginBottom: 20,
  },
  credentialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  credentialInfo: {
    flex: 1,
  },
  credentialLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  credentialValue: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  passwordDisplayContainer: {
    gap: 8,
  },
  passwordDisplayText: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  passwordStrengthBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  passwordActionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  inlineActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  inlineActionGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  passwordCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  footerStats: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default PasswordPreviewCard;