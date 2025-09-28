import HolographicBackground from "@/components/HolographicBackground";
import { SecureNotesSection } from "@/components/notes/secure-notes-section";
import { ReachPressable } from "@/components/ui";
import { SpaceHeader, SecurityStatus, PasswordPreviewSection, SpaceWelcome } from "@/components/vault";
import Colors from "@/constants/Colors";
import { useNavigationOptimization } from "@/hooks/use-navigation-optimization";
import { usePasswordStore } from "@/stores/passwordStore";
import { PasswordStrength, SecureNote } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddNoteModal from "../../components/add-note-modal";





export default function VaultScreen() {
  const { passwords, secureNotes, copyToClipboard, deleteSecureNote } =
    usePasswordStore();
  const insets = useSafeAreaInsets();
  const { shouldRenderAnimations } = useNavigationOptimization();
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<SecureNote | null>(null);

  const allPasswords = passwords;

  const recentPasswords: any = allPasswords
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 6);

  const passwordsData = useMemo(() => {
    return {
      passwords: allPasswords,
      total: allPasswords.length,
    };
  }, [allPasswords]);

  const { securityScore, weakPasswords, totalPasswords } = useMemo(() => {
    const { passwords, total } = passwordsData;
    if (total === 0) {
      return { securityScore: 100, weakPasswords: 0, totalPasswords: 0 };
    }

    const scores = passwords.map((p) => (p.strength / 4) * 100);
    const scoreSum = scores.reduce((sum, score) => sum + score, 0);
    const weakCount = passwords.filter(
      (p) => p.strength <= PasswordStrength.WEAK
    ).length;

    return {
      securityScore: Math.round(scoreSum / total),
      weakPasswords: weakCount,
      totalPasswords: total,
    };
  }, [passwordsData]);

  const handleEditNote = (note: SecureNote) => {
    setEditingNote(note);
    setNoteModalVisible(true);
  };

  const handleDeleteNote = async (note: SecureNote) => {
    try {
      await deleteSecureNote(note.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Note deleted successfully");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to delete note");
    }
  };

  const handleCloseNoteModal = () => {
    setNoteModalVisible(false);
    setEditingNote(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {shouldRenderAnimations && <HolographicBackground />}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SpaceHeader userName={undefined} />

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(0, 212, 255, 0.12)", "rgba(0, 212, 255, 0.06)"]}
              style={styles.statCardGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="key" size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{totalPasswords}</Text>
                <Text style={styles.statLabel}>Passwords</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(0, 255, 127, 0.12)", "rgba(0, 255, 127, 0.06)"]}
              style={styles.statCardGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="document-lock"
                  size={20}
                  color={Colors.dark.neonGreen}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{secureNotes.length}</Text>
                <Text style={styles.statLabel}>Secure Notes</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {(totalPasswords !== 0 || secureNotes.length !== 0) && (
          <SecurityStatus
            score={securityScore}
            total={totalPasswords}
            weak={weakPasswords}
          />
        )}

        {recentPasswords.length > 0 && (
          <PasswordPreviewSection
            passwords={recentPasswords || []}
            copyToClipboard={copyToClipboard}
          />
        )}

        {secureNotes.length > 0 && (
          <SecureNotesSection
            notes={secureNotes}
            onAddNote={() => setNoteModalVisible(true)}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {totalPasswords === 0 && secureNotes.length > 0 && (
          <View style={styles.emptyPasswordsSection}>
            <LinearGradient
              colors={[
                "rgba(0, 212, 255, 0.05)",
                "rgba(0, 255, 136, 0.03)",
                "rgba(139, 92, 246, 0.05)",
              ]}
              style={styles.emptyPasswordsCard}
            >
              <View style={styles.emptyPasswordsContent}>
                <Text style={styles.emptyPasswordsIcon}>🔐</Text>
                <Text style={styles.emptyPasswordsTitle}>
                  NO NEURAL KEYS DETECTED
                </Text>
                <Text style={styles.emptyPasswordsSubtitle}>
                  Your quantum vault is ready for password storage
                </Text>
                <ReachPressable
                  style={styles.emptyPasswordsButton}
                  onPress={() => router.push("/(tabs)/apps")}
                  reachScale={1.05}
                  pressScale={0.95}
                >
                  <LinearGradient
                    colors={[Colors.dark.primary, Colors.dark.secondary]}
                    style={styles.emptyPasswordsButtonGradient}
                  >
                    <Text style={styles.emptyPasswordsButtonText}>
                      ⚡ ADD FIRST PASSWORD
                    </Text>
                  </LinearGradient>
                </ReachPressable>
              </View>
            </LinearGradient>
          </View>
        )}

        {totalPasswords > 6 && (
          <View style={styles.spaceAccessButton}>
            <ReachPressable
              style={styles.viewAllPasswordsButton}
              onPress={() => {
                router.push("/(tabs)/apps");
              }}
              reachScale={1.01}
              pressScale={0.99}
            >
              <LinearGradient
                colors={[
                  "rgba(0, 212, 255, 0.1)",
                  "rgba(0, 255, 136, 0.05)",
                  "rgba(139, 92, 246, 0.1)",
                ]}
                style={styles.viewAllPasswordsGradient}
              >
                <Text style={styles.viewAllPasswordsText}>
                  ⚡ ACCESS ALL {totalPasswords} NEURAL KEYS
                </Text>
                <Ionicons
                  name="arrow-forward-circle"
                  size={24}
                  color={Colors.dark.primary}
                />
              </LinearGradient>
            </ReachPressable>
          </View>
        )}

        {totalPasswords === 0 && secureNotes.length === 0 && (
          <SpaceWelcome onAddNote={() => setNoteModalVisible(true)} />
        )}
      </ScrollView>

      <AddNoteModal
        visible={noteModalVisible}
        onClose={handleCloseNoteModal}
        existingNote={editingNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0b",
  },
  particle: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    gap: 24,
  },
  viewAllPasswordsGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.2)",
  },
  statusInfo: {
    flex: 1,
  },
  statusStats: {
    alignItems: "flex-end",
  },
  statusTotal: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  viewAllPasswordsButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  // Space Access Button
  spaceAccessButton: {
    marginBottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  spaceEmptyContainer: {
    marginBottom: 32,
  },
  viewAllPasswordsText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.primary,
    letterSpacing: 0.5,
  },
  welcomeIconContainer: {
    marginBottom: 32,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeTextContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.neonGreen,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  welcomeActions: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  primaryWelcomeButton: {
    borderRadius: 20,
    overflow: "visible",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a0a0b",
    letterSpacing: 0.5,
  },
  secondaryWelcomeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.primary,
  },
  welcomeStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  welcomeStatItem: {
    alignItems: "center",
  },
  welcomeStatNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  welcomeStatLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  welcomeStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  emptyPasswordsSection: {
    // paddingVertical: 8,
  },
  emptyPasswordsCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
    overflow: "hidden",
  },
  emptyPasswordsContent: {
    padding: 32,
    alignItems: "center",
  },
  emptyPasswordsIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyPasswordsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.primary,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyPasswordsSubtitle: {
    fontSize: 14,
    color: Colors.dark.text,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyPasswordsButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyPasswordsButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPasswordsButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.dark.background,
    letterSpacing: 1,
  },

  statsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
  },
  statCardGradient: {
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },


  // Floating Decoration Elements
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingOrb: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.4,
  },
  floatingOrb1: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    top: "15%",
    right: "10%",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  floatingOrb2: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 255, 127, 0.08)",
    top: "40%",
    left: "5%",
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  floatingOrb3: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    top: "70%",
    right: "15%",
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  floatingHex: {
    position: "absolute",
    width: 30,
    height: 30,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
    transform: [{ rotate: "30deg" }],
  },
  floatingHex1: {
    top: "25%",
    left: "20%",
  },
  floatingHex2: {
    top: "60%",
    right: "25%",
    borderColor: "rgba(0, 255, 127, 0.2)",
  },
});
