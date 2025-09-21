import Colors from "@/constants/Colors";
import { SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReachPressable } from "../ui/ReachPressable";

interface SpaceNoteCardProps {
  note: SecureNote;
  index: number;
  onEdit?: (note: SecureNote) => void;
  onDelete?: (note: SecureNote) => void;
}

export const SpaceNoteCard: React.FC<SpaceNoteCardProps> = ({
  note,
  index,
  onEdit,
  onDelete,
}) => {
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.1);
  const borderOpacity = useSharedValue(0.1);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, {
      duration: 300 + index * 50,
      easing: Easing.out(Easing.quad),
    });

    // Static glow and border effects
    glowOpacity.value = 0.15;
    borderOpacity.value = 0.2;

    return () => {
      cancelAnimation(cardOpacity);
    };
  }, [index]);

  const getCategoryData = (category: string) => {
    switch (category?.toLowerCase()) {
      case "personal":
        return {
          color: Colors.dark.neonGreen,
          gradient: ["rgba(0, 255, 136, 0.15)", "rgba(0, 255, 136, 0.05)"],
          icon: "person",
        };
      case "work":
        return {
          color: Colors.dark.primary,
          gradient: ["rgba(0, 212, 255, 0.15)", "rgba(0, 212, 255, 0.05)"],
          icon: "briefcase",
        };
      case "finance":
        return {
          color: Colors.dark.warning,
          gradient: ["rgba(255, 171, 0, 0.15)", "rgba(255, 171, 0, 0.05)"],
          icon: "card",
        };
      default:
        return {
          color: Colors.dark.textMuted,
          gradient: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
          icon: "document-text",
        };
    }
  };

  const { color, icon } = getCategoryData(note.category);
  const previewText =
    note.content.length > 150
      ? note.content.substring(0, 150) + "..."
      : note.content;

  const wordCount = note.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handlePressIn = () => {
    "worklet";
    cardScale.value = withTiming(0.97, { duration: 150 });
  };

  const handlePressOut = () => {
    "worklet";
    cardScale.value = withTiming(1, { duration: 150 });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Copied", `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert("❌ Error", "Failed to copy to clipboard");
    }
  };

  const handlePress = () => {
    Alert.alert(note.title, note.content, [
      {
        text: "Copy Note",
        onPress: () => copyToClipboard(note.content, "Note content"),
      },
      {
        text: "Copy Title",
        onPress: () => copyToClipboard(note.title, "Note title"),
      },
      {
        text: "Close",
        style: "cancel",
      },
    ]);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(${
      color === Colors.dark.neonGreen
        ? "0, 255, 136"
        : color === Colors.dark.primary
        ? "0, 212, 255"
        : color === Colors.dark.warning
        ? "255, 171, 0"
        : "156, 163, 175"
    }, 0.2)`,
  }));

  return (
    <Animated.View style={[styles.noteCard, cardAnimatedStyle]}>
      <ReachPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        reachScale={1}
        pressScale={1}
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.08)",
            "rgba(255, 255, 255, 0.03)",
            "rgba(0, 0, 0, 0.2)",
          ]}
          style={[styles.cardGradient, { borderColor: color + "40" }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={color}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <View style={styles.metaInfo}>
                  <View style={[styles.categoryBadge, { backgroundColor: color + "20", borderColor: color + "40" }]}>
                    <Text style={[styles.categoryLabel, { color }]}>
                      {note.category}
                    </Text>
                  </View>
                  {note.isFavorite && (
                    <Ionicons name="heart" size={12} color={Colors.dark.warning} />
                  )}
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <ReachPressable
                style={[styles.actionBtn, { backgroundColor: color + "15" }]}
                onPress={() => copyToClipboard(note.content, "Note content")}
                reachScale={1.05}
                pressScale={0.95}
              >
                <Ionicons name="copy-outline" size={18} color={color} />
              </ReachPressable>
              <ReachPressable
                style={[styles.actionBtn, { backgroundColor: color + "15" }]}
                onPress={() => {
                  if (onEdit) {
                    onEdit(note);
                  } else {
                    Alert.alert("Edit Note", `Edit: ${note.title}`);
                  }
                }}
                reachScale={1.05}
                pressScale={0.95}
              >
                <Ionicons name="create-outline" size={18} color={color} />
              </ReachPressable>
              <ReachPressable
                style={[styles.actionBtn, { backgroundColor: "rgba(255, 71, 87, 0.15)" }]}
                onPress={() => {
                  Alert.alert(
                    "Delete Note",
                    `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          if (onDelete) {
                            onDelete(note);
                          }
                        },
                      },
                    ]
                  );
                }}
                reachScale={1.05}
                pressScale={0.95}
              >
                <Ionicons name="trash-outline" size={18} color="#ff4757" />
              </ReachPressable>
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.contentText} numberOfLines={4}>
              {previewText}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerInfo}>
              <Text style={styles.infoLabel}>
                {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.infoLabel}>{wordCount} words</Text>
              <View style={styles.dot} />
              <Text style={styles.infoLabel}>{readingTime}m read</Text>
            </View>
            <View style={styles.encryptionBadge}>
              <Ionicons name="lock-closed" size={10} color={Colors.dark.neonGreen} />
            </View>
          </View>
        </LinearGradient>
      </ReachPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  noteCard: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    minHeight: 180,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerText: {
    flex: 1,
    paddingTop: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  contentSection: {
    marginBottom: 16,
  },
  contentText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    fontWeight: "400",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.dark.textMuted,
    marginHorizontal: 8,
  },
  encryptionBadge: {
    backgroundColor: "rgba(0, 255, 136, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.3)",
  },
});