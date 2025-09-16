import HolographicBackground from "@/components/HolographicBackground";
import { ReachPressable } from "@/components/ui/ReachPressable";
import PinKeypad from "@/components/ui/PinKeypad";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ImportData {
  stats: {
    passwords: string | number;
    notes: string | number;
  };
}

interface ImportBackupModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (pin: string) => Promise<void>;
  importData: ImportData | null;
  isLoading: boolean;
}


export default function ImportBackupModal({
  visible,
  onClose,
  onImport,
  importData,
  isLoading,
}: ImportBackupModalProps) {
  const [pin, setPin] = useState("");
  const insets = useSafeAreaInsets();

  // Reset PIN when modal visibility changes
  useEffect(() => {
    if (!visible) {
      setPin("");
    }
  }, [visible]);

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      // Auto-submit when PIN is complete
      if (newPin.length === 4) {
        // Auto-submit immediately when PIN is complete
        setTimeout(async () => {
          try {
            await onImport(newPin);
            setPin("");
          } catch (error) {
            console.error("Auto-submit import error:", error);
            setPin("");
          }
        }, 100);
      }
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };


  const handleClose = () => {
    setPin("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <HolographicBackground />

        <View style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <LinearGradient
                  colors={[Colors.dark.primary, Colors.dark.neonGreen]}
                  style={styles.headerIconGradient}
                >
                  <Ionicons name="cloud-download" size={32} color="#000" />
                </LinearGradient>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.modalTitle}>Import Backup</Text>
                <Text style={styles.modalSubtitle}>
                  Decrypt and restore your secure data
                </Text>
              </View>
            </View>

            <ReachPressable
              style={styles.closeButton}
              onPress={handleClose}
              reachScale={1.1}
              pressScale={0.9}
            >
              <Ionicons name="close-circle" size={32} color={Colors.dark.error} />
            </ReachPressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Stats Preview */}
            {importData?.stats && (
              <View style={styles.holoInputContainer}>
                <View style={styles.holoInputBg}>
                  <View style={styles.holoInputHeader}>
                    <Ionicons name="cloud-download" size={24} color={Colors.dark.neonGreen} />
                    <Text style={styles.holoInputTitle}>BACKUP PREVIEW</Text>
                    <View style={styles.holoLine} />
                  </View>
                  <View style={styles.holoInputContent}>
                    <View style={styles.backupPreview}>
                      <View style={styles.backupInfo}>
                        <View style={styles.backupTypeContainer}>
                          <View style={styles.encryptionBadge}>
                            <Ionicons name="shield-checkmark" size={16} color={Colors.dark.neonGreen} />
                            <Text style={styles.encryptionText}>ENCRYPTED</Text>
                          </View>
                        </View>
                        <View style={styles.statsRow}>
                          <View style={styles.statCard}>
                            <View style={styles.statIconBg}>
                              <Ionicons name="key" size={20} color={Colors.dark.primary} />
                            </View>
                            <Text style={styles.statNumber}>
                              {importData.stats.passwords === "encrypted" ? "●●●" : importData.stats.passwords}
                            </Text>
                            <Text style={styles.statType}>Passwords</Text>
                          </View>
                          <View style={styles.statCard}>
                            <View style={styles.statIconBg}>
                              <Ionicons name="document-text" size={20} color={Colors.dark.neonGreen} />
                            </View>
                            <Text style={styles.statNumber}>
                              {importData.stats.notes === "encrypted" ? "●●●" : importData.stats.notes}
                            </Text>
                            <Text style={styles.statType}>Notes</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* PIN Input Section */}
            <View style={styles.holoInputContainer}>
              <View style={styles.holoInputBg}>
                <View style={styles.holoInputHeader}>
                  <Ionicons name="lock-closed" size={24} color={Colors.dark.neonGreen} />
                  <Text style={styles.holoInputTitle}>MASTER PIN</Text>
                  <View style={styles.holoLine} />
                </View>
                <View style={styles.holoInputContent}>
                  {/* Keypad with PIN Display */}
                  <PinKeypad
                    pin={pin}
                    onDigitPress={handlePinDigit}
                    onBackspace={handlePinBackspace}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Panel */}
          <View style={styles.actionPanel}>
            <LinearGradient
              colors={[
                "rgba(0, 212, 255, 0.15)",
                "rgba(0, 255, 136, 0.1)",
                "rgba(139, 92, 246, 0.15)",
              ]}
              style={styles.actionGradient}
            >
              <ReachPressable
                style={[
                  styles.actionButton,
                  pin.length !== 4 && styles.actionButtonDisabled,
                ]}
                onPress={async () => {
                  if (pin.length === 4) {
                    try {
                      await onImport(pin);
                      setPin("");
                    } catch (error) {
                      console.error("Manual import error:", error);
                      setPin("");
                    }
                  }
                }}
                reachScale={1.02}
                pressScale={0.98}
                disabled={pin.length !== 4}
              >
                <LinearGradient
                  colors={
                    pin.length !== 4
                      ? ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
                      : [Colors.dark.primary, Colors.dark.neonGreen]
                  }
                  style={styles.actionButtonGradient}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      {
                        color:
                          pin.length !== 4 ? Colors.dark.textMuted : "#000",
                      },
                    ]}
                  >
                    {pin.length === 4 ? "⚡ IMPORT BACKUP" : "⚡ ENTER PIN"}
                  </Text>
                </LinearGradient>
              </ReachPressable>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  modalContainer: {
    flex: 1,
    marginHorizontal: 0,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
    backgroundColor: Colors.dark.surface,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    gap: 16,
    paddingRight: 60,
  },
  headerIconContainer: {
    marginRight: 0,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    color: Colors.dark.text,
    fontWeight: "700",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 50,
    transform: [{ translateY: -24 }],
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
    minHeight: 48,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
    gap: 24,
  },

  // Holographic Input Styles
  holoInputContainer: {
    marginBottom: 0,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  holoInputBg: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.surface,
    position: "relative",
    overflow: "hidden",
  },
  holoInputHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  holoInputTitle: {
    fontSize: 16,
    color: Colors.dark.neonGreen,
    fontWeight: "800",
    letterSpacing: 1,
  },
  holoLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.dark.primary,
    marginLeft: 12,
    marginRight: 8,
    maxWidth: "60%",
  },
  holoInputContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 15,
  },

  // Backup Preview Styles
  backupPreview: {
    gap: 16,
  },
  backupInfo: {
    gap: 16,
  },
  backupTypeContainer: {
    alignItems: "center",
  },
  encryptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0, 255, 136, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.3)",
  },
  encryptionText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.dark.neonGreen,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  statType: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },


  // Action Panel
  actionPanel: {
    borderTopWidth: 2,
    borderTopColor: Colors.dark.primary,
  },
  actionGradient: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  actionButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});