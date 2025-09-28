import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface SecurityStatusProps {
  score: number;
  total: number;
  weak: number;
}

const SecurityStatus: React.FC<SecurityStatusProps> = ({ score, total, weak }) => {
  const getStatusData = (score: number) => {
    if (score >= 80)
      return {
        icon: "shield-checkmark",
        color: Colors.dark.neonGreen,
        text: "Excellent Security",
        description: "Your vault is well protected",
        bgColor: "rgba(0, 255, 127, 0.1)",
      };
    if (score >= 60)
      return {
        icon: "shield",
        color: Colors.dark.primary,
        text: "Good Security",
        description: "Room for improvement",
        bgColor: "rgba(0, 212, 255, 0.1)",
      };
    return {
      icon: "warning",
      color: Colors.dark.warning,
      text: "Needs Attention",
      description: "Some passwords are weak",
      bgColor: "rgba(255, 171, 0, 0.1)",
    };
  };

  const { icon, color, text, description, bgColor } = getStatusData(score);
  const progress = Math.min(score / 100, 1);

  return (
    <View style={styles.securityStatus}>
      <LinearGradient
        colors={[bgColor, "rgba(255, 255, 255, 0.02)"]}
        style={styles.securityStatusGradient}
      >
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <LinearGradient
              colors={[color + "20", color + "10"]}
              style={styles.statusIconGradient}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={color}
              />
            </LinearGradient>
          </View>

          <View style={styles.statusHeaderText}>
            <Text style={styles.statusTitle}>Security Score</Text>
            <Text style={[styles.statusText, { color }]}>{text}</Text>
            <Text style={styles.statusDescription}>{description}</Text>
          </View>

          <View style={styles.statusScoreContainer}>
            <Text style={[styles.statusScore, { color }]}>{score}</Text>
            <Text style={styles.statusScoreLabel}>Score</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: color,
                  shadowColor: color,
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                },
              ]}
            />
          </View>

          <View style={styles.progressStats}>
            <Text style={styles.progressText}>{total} Total Items</Text>
            {weak > 0 && (
              <Text style={styles.weakText}>{weak} Need Attention</Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  securityStatus: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  securityStatusGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 16,
  },
  statusIconContainer: {
    marginTop: 2,
  },
  statusIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusHeaderText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  statusDescription: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  statusScoreContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusScore: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 2,
  },
  statusScoreLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  progressContainer: {
    gap: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "600",
  },
  weakText: {
    fontSize: 12,
    color: Colors.dark.warning,
    fontWeight: "600",
  },
});

export default SecurityStatus;