import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PasswordStrength } from "../../types";
import {
  getPasswordStrengthText,
  getPasswordStrengthColor,
} from "../../services/password/generator";
import Colors from "../../constants/Colors";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  entropy?: number;
  showDetails?: boolean;
}

export default function PasswordStrengthIndicator({
  strength,
  entropy,
  showDetails = false,
}: PasswordStrengthIndicatorProps) {
  const strengthText = getPasswordStrengthText(strength);
  const strengthColor = getPasswordStrengthColor(strength);
  const strengthPercentage = ((strength + 1) / 5) * 100;

  const getStrengthGradient = () => {
    switch (strength) {
      case PasswordStrength.VERY_WEAK:
        return ["#ff4757", "#ff3742"];
      case PasswordStrength.WEAK:
        return ["#ff6b9d", "#ff4757"];
      case PasswordStrength.MODERATE:
        return ["#ffab00", "#ff6b9d"];
      case PasswordStrength.STRONG:
        return ["#00d4ff", "#8b5cf6"];
      case PasswordStrength.VERY_STRONG:
        return ["#00ff88", "#00d4ff"];
      default:
        return [Colors.dark.textMuted, Colors.dark.textMuted];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.strengthBarContainer}>
        <View style={styles.strengthBarBackground}>
          <LinearGradient
            colors={
              getStrengthGradient() as unknown as readonly [
                string,
                string,
                ...string[]
              ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.strengthBar, { width: `${strengthPercentage}%` }]}
          />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.strengthText, { color: strengthColor }]}>
          {strengthText}
        </Text>
        {showDetails && entropy && (
          <Text style={styles.entropyText}>
            {Math.round(entropy)} bits of entropy
          </Text>
        )}
      </View>

      <View style={styles.indicatorsContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index <= strength
                ? { backgroundColor: strengthColor }
                : styles.inactiveIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  strengthBarContainer: {
    marginBottom: 8,
  },
  strengthBarBackground: {
    height: 6,
    backgroundColor: Colors.dark.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 3,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: "600",
  },
  entropyText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  indicatorsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  indicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  inactiveIndicator: {
    backgroundColor: Colors.dark.surface,
  },
});
