import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/Colors";

interface SpaceHeaderProps {
  userName?: string;
}

const SpaceHeader: React.FC<SpaceHeaderProps> = React.memo(({ userName }) => {
  const currentHour = new Date().getHours();

  const getGreeting = () => {
    if (currentHour < 12) return "MORNING";
    if (currentHour < 17) return "AFTERNOON";
    return "EVENING";
  };

  const getUserGreeting = () => {
    if (userName) return `Welcome back, ${userName}`;
    return "Welcome, Commander";
  };

  return (
    <View style={styles.spaceHeader}>
      <View style={styles.greetingSection}>
        <Text style={styles.greetingTime}>GOOD {getGreeting()}</Text>
        <Text style={styles.welcomeMessage}>{getUserGreeting()}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  spaceHeader: {
    paddingTop: 16,
  },
  greetingSection: {
    gap: 4,
    paddingHorizontal: 10,
  },
  greetingTime: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  welcomeMessage: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    letterSpacing: 0.2,
    lineHeight: 32,
  },
});

export default SpaceHeader;