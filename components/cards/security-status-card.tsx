import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SecurityStatusCardProps {
  score: number;
  total: number;
  weak: number;
}

const SecurityStatusCard: React.FC<SecurityStatusCardProps> = ({
  score,
  total,
  weak,
}) => {
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
    <View style={styles.container}>
      <LinearGradient
        colors={[bgColor, "rgba(255, 255, 255, 0.02)"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[color + "20", color + "10"]}
              style={styles.iconGradient}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={color}
              />
            </LinearGradient>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>Security Score</Text>
            <Text style={[styles.statusText, { color }]}>{text}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color }]}>{score}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
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
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 16,
  },
  iconContainer: {
    marginTop: 2,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerText: {
    flex: 1,
  },
  title: {
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
  description: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  score: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 2,
  },
  scoreLabel: {
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

export default SecurityStatusCard;