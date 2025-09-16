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

interface ChangePinModalProps {
  visible: boolean;
  onClose: () => void;
  onChangePinComplete: (currentPin: string, newPin: string) => Promise<void>;
  isLoading: boolean;
}


export default function ChangePinModal({
  visible,
  onClose,
  onChangePinComplete,
  isLoading,
}: ChangePinModalProps) {
  const [step, setStep] = useState(1);
  const insets = useSafeAreaInsets();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Reset all PINs when modal closes
  useEffect(() => {
    if (!visible) {
      setStep(1);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    }
  }, [visible]);

  const getCurrentPin = () => {
    switch (step) {
      case 1: return currentPin;
      case 2: return newPin;
      case 3: return confirmPin;
      default: return "";
    }
  };

  const handlePinDigit = (digit: string) => {
    const pin = getCurrentPin();
    if (pin.length < 4) {
      const newPin = pin + digit;
      switch (step) {
        case 1:
          setCurrentPin(newPin);
          if (newPin.length === 4) {
            setTimeout(() => {
              handleNext();
            }, 150);
          }
          break;
        case 2:
          setNewPin(newPin);
          if (newPin.length === 4) {
            setTimeout(() => {
              handleNext();
            }, 150);
          }
          break;
        case 3:
          setConfirmPin(newPin);
          if (newPin.length === 4) {
            setTimeout(() => {
              handleNext();
            }, 150);
          }
          break;
      }
    }
  };

  const handlePinBackspace = () => {
    const pin = getCurrentPin();
    const newPinValue = pin.slice(0, -1);
    switch (step) {
      case 1: setCurrentPin(newPinValue); break;
      case 2: setNewPin(newPinValue); break;
      case 3: setConfirmPin(newPinValue); break;
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1: return currentPin.length === 4;
      case 2: return newPin.length === 4;
      case 3: return confirmPin === newPin && confirmPin.length === 4;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        await onChangePinComplete(currentPin, newPin);
        handleClose();
      } catch (error) {
        // Error handling is done in parent component
      }
    }
  };

  const handleClose = () => {
    setStep(1);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    onClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "CURRENT PIN";
      case 2: return "NEW PIN";
      case 3: return "CONFIRM PIN";
      default: return "";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return "Verify your current PIN";
      case 2: return "Create a new secure PIN";
      case 3: return "Confirm your new PIN";
      default: return "";
    }
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
                  <Ionicons name="key" size={32} color="#000" />
                </LinearGradient>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.modalTitle}>Change Master PIN</Text>
                <Text style={styles.modalSubtitle}>
                  {getStepSubtitle()}
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
            {/* Progress Steps */}
            <View style={styles.holoInputContainer}>
              <View style={styles.holoInputBg}>
                <View style={styles.holoInputHeader}>
                  <Ionicons name="trending-up" size={24} color={Colors.dark.neonGreen} />
                  <Text style={styles.holoInputTitle}>SECURITY PROTOCOL</Text>
                  <View style={styles.holoLine} />
                </View>
                <View style={styles.holoInputContent}>
                  <View style={styles.stepProgressContainer}>
                    {[
                      { step: 1, label: "VERIFY", icon: "shield-checkmark" },
                      { step: 2, label: "CREATE", icon: "key" },
                      { step: 3, label: "CONFIRM", icon: "checkmark-circle" },
                    ].map(({ step: stepNum, label, icon }) => (
                      <View key={stepNum} style={styles.stepProgressItem}>
                        <View
                          style={[
                            styles.stepProgressCircle,
                            stepNum <= step && styles.stepProgressCircleActive,
                            stepNum < step && styles.stepProgressCircleCompleted,
                          ]}
                        >
                          {stepNum < step ? (
                            <Ionicons name="checkmark" size={16} color="#000" />
                          ) : (
                            <Ionicons
                              name={icon as any}
                              size={16}
                              color={stepNum <= step ? "#000" : Colors.dark.textMuted}
                            />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.stepProgressLabel,
                            stepNum <= step && styles.stepProgressLabelActive,
                          ]}
                        >
                          {label}
                        </Text>
                        {stepNum < 3 && (
                          <View
                            style={[
                              styles.stepProgressConnector,
                              stepNum < step && styles.stepProgressConnectorActive,
                            ]}
                          />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* PIN Input Section */}
            <View style={styles.holoInputContainer}>
              <View style={styles.holoInputBg}>
                <View style={styles.holoInputHeader}>
                  <Ionicons name="lock-closed" size={24} color={Colors.dark.neonGreen} />
                  <Text style={styles.holoInputTitle}>{getStepTitle()}</Text>
                  <View style={styles.holoLine} />
                </View>
                <View style={styles.holoInputContent}>
                  {/* PIN Match Status */}
                  {step === 3 && confirmPin.length > 0 && (
                    <View style={styles.pinMatchContainer}>
                      <Ionicons
                        name={confirmPin === newPin ? "checkmark-circle" : "close-circle"}
                        size={20}
                        color={confirmPin === newPin ? Colors.dark.neonGreen : Colors.dark.error}
                      />
                      <Text
                        style={[
                          styles.pinMatchText,
                          {
                            color:
                              confirmPin === newPin ? Colors.dark.neonGreen : Colors.dark.error,
                          },
                        ]}
                      >
                        {confirmPin === newPin ? "PINs match perfectly" : "PINs don't match"}
                      </Text>
                    </View>
                  )}

                  {/* Keypad with PIN Display */}
                  <PinKeypad
                    pin={getCurrentPin()}
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
                  (!canContinue() || isLoading) && styles.actionButtonDisabled,
                ]}
                onPress={handleNext}
                reachScale={1.02}
                pressScale={0.98}
                disabled={!canContinue() || isLoading}
              >
                <LinearGradient
                  colors={
                    !canContinue() || isLoading
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
                          !canContinue() || isLoading ? Colors.dark.textMuted : "#000",
                      },
                    ]}
                  >
                    {isLoading
                      ? "⚡ PROCESSING..."
                      : step === 3
                      ? "⚡ UPDATE PIN"
                      : getCurrentPin().length === 4
                      ? "⚡ CONTINUE"
                      : "⚡ ENTER PIN"}
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

  // Step Progress Styles
  stepProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  stepProgressItem: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  stepProgressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepProgressCircleActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  stepProgressCircleCompleted: {
    backgroundColor: Colors.dark.neonGreen,
    borderColor: Colors.dark.neonGreen,
  },
  stepProgressLabel: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  stepProgressLabelActive: {
    color: Colors.dark.text,
    fontWeight: "700",
  },
  stepProgressConnector: {
    position: "absolute",
    top: 20,
    right: -50,
    width: 100,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  stepProgressConnectorActive: {
    backgroundColor: Colors.dark.neonGreen,
  },


  // PIN Match Status
  pinMatchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },
  pinMatchText: {
    fontSize: 14,
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