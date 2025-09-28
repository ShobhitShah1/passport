import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReachPressable } from "@/components/ui";
import Colors from "@/constants/Colors";

interface SpaceWelcomeProps {
  onAddNote: () => void;
}

const SpaceWelcome: React.FC<SpaceWelcomeProps> = React.memo(({ onAddNote }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateBackground}>
        <View style={styles.emptyFloatingOrb1} />
        <View style={styles.emptyFloatingOrb2} />
        <View style={styles.emptyFloatingOrb3} />
      </View>

      <View style={styles.emptyStateContent}>
        <View style={styles.emptyHeroSection}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.purpleGlow]}
              style={styles.emptyMainIcon}
            >
              <Ionicons
                name="shield"
                size={32}
                color={Colors.dark.background}
              />
            </LinearGradient>
            <View style={styles.emptyIconGlow} />
          </View>

          <Text style={styles.emptyTitle}>Welcome to Your Vault</Text>
          <Text style={styles.emptySubtitle}>
            Your secure digital fortress awaits. Start by adding your first
            password or secure note.
          </Text>
        </View>

        <View style={styles.emptyQuickStartGrid}>
          <ReachPressable
            style={styles.emptyQuickStartCard}
            onPress={() => router.push("/(tabs)/apps")}
            reachScale={1.02}
            pressScale={0.98}
          >
            <LinearGradient
              colors={["rgba(0, 212, 255, 0.15)", "rgba(0, 212, 255, 0.08)"]}
              style={styles.emptyQuickStartGradient}
            >
              <View style={styles.emptyQuickStartIcon}>
                <Ionicons name="key" size={24} color={Colors.dark.primary} />
              </View>
              <Text style={styles.emptyQuickStartTitle}>Add Password</Text>
              <Text style={styles.emptyQuickStartDesc}>
                Store your first login credentials
              </Text>
            </LinearGradient>
          </ReachPressable>

          <ReachPressable
            style={styles.emptyQuickStartCard}
            onPress={onAddNote}
            reachScale={1.02}
            pressScale={0.98}
          >
            <LinearGradient
              colors={["rgba(0, 255, 127, 0.15)", "rgba(0, 255, 127, 0.08)"]}
              style={styles.emptyQuickStartGradient}
            >
              <View style={styles.emptyQuickStartIcon}>
                <Ionicons
                  name="document-text"
                  size={24}
                  color={Colors.dark.neonGreen}
                />
              </View>
              <Text style={styles.emptyQuickStartTitle}>Create Note</Text>
              <Text style={styles.emptyQuickStartDesc}>
                Save important information securely
              </Text>
            </LinearGradient>
          </ReachPressable>
        </View>

        <View style={styles.emptyFeaturesSection}>
          <Text style={styles.emptyFeaturesTitle}>Why Choose Our Vault?</Text>
          <View style={styles.emptyFeaturesList}>
            <View style={styles.emptyFeatureItem}>
              <View style={styles.emptyFeatureBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={Colors.dark.neonGreen}
                />
              </View>
              <View style={styles.emptyFeatureContent}>
                <Text style={styles.emptyFeatureTitle}>
                  Bank-Level Security
                </Text>
                <Text style={styles.emptyFeatureDesc}>
                  256-bit encryption keeps your data safe
                </Text>
              </View>
            </View>

            <View style={styles.emptyFeatureItem}>
              <View style={styles.emptyFeatureBadge}>
                <Ionicons name="flash" size={16} color={Colors.dark.primary} />
              </View>
              <View style={styles.emptyFeatureContent}>
                <Text style={styles.emptyFeatureTitle}>Lightning Fast</Text>
                <Text style={styles.emptyFeatureDesc}>
                  Access your passwords instantly
                </Text>
              </View>
            </View>

            <View style={styles.emptyFeatureItem}>
              <View style={styles.emptyFeatureBadge}>
                <Ionicons
                  name="eye-off"
                  size={16}
                  color={Colors.dark.purpleGlow}
                />
              </View>
              <View style={styles.emptyFeatureContent}>
                <Text style={styles.emptyFeatureTitle}>Zero Knowledge</Text>
                <Text style={styles.emptyFeatureDesc}>
                  Only you can access your data
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    paddingVertical: 20,
    position: "relative",
  },
  emptyStateBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emptyFloatingOrb1: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0, 212, 255, 0.05)",
    top: "10%",
    right: "10%",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  emptyFloatingOrb2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 255, 127, 0.04)",
    bottom: "15%",
    left: "5%",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  emptyFloatingOrb3: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(139, 92, 246, 0.06)",
    top: "50%",
    right: "20%",
    shadowColor: Colors.dark.purpleGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  emptyStateContent: {
    paddingHorizontal: 0,
    paddingVertical: 20,
    gap: 32,
    zIndex: 1,
  },
  emptyHeroSection: {
    alignItems: "center",
    gap: 16,
  },
  emptyIconContainer: {
    position: "relative",
    marginBottom: 8,
  },
  emptyMainIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyIconGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    opacity: 0.1,
    top: -8,
    left: -8,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 32,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: "500",
  },
  emptyQuickStartGrid: {
    flexDirection: "row",
    gap: 16,
  },
  emptyQuickStartCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyQuickStartGradient: {
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    minHeight: 120,
  },
  emptyQuickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  emptyQuickStartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  emptyQuickStartDesc: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },
  emptyFeaturesSection: {
    gap: 20,
  },
  emptyFeaturesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  emptyFeaturesList: {
    gap: 16,
  },
  emptyFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  emptyFeatureBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  emptyFeatureContent: {
    flex: 1,
    gap: 4,
  },
  emptyFeatureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    letterSpacing: 0.2,
  },
  emptyFeatureDesc: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    lineHeight: 18,
  },
});

export default SpaceWelcome;