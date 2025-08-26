import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import { verifyMasterPassword } from "@/services/storage/secureStorage";

export default function AuthScreen() {
  const [masterPassword, setMasterPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const insets = useSafeAreaInsets();

  const { authenticate, state } = useAppContext();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      console.error("Error checking biometric availability:", error);
    }
  };

  const handlePasswordAuth = async () => {
    if (masterPassword.length === 0) {
      Alert.alert("Error", "Please enter your master password");
      return;
    }

    try {
      setIsLoading(true);
      const isValid = await verifyMasterPassword(masterPassword);

      if (isValid) {
        const success = await authenticate(masterPassword);
        if (success) {
          setFailedAttempts(0);
          router.replace("/(tabs)");
        }
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        if (newFailedAttempts >= 5) {
          Alert.alert(
            "Too Many Failed Attempts",
            "Please wait before trying again.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Invalid Password",
            `Incorrect master password. ${
              5 - newFailedAttempts
            } attempts remaining.`
          );
        }
        setMasterPassword("");
      }
    } catch (error) {
      Alert.alert("Error", "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Passport",
        cancelLabel: "Use Password",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // For biometric auth, we'd need to store the master password securely
        // For now, we'll just show that biometric was successful but still need password
        Alert.alert(
          "Biometric Authentication",
          "Biometric authentication successful! This feature will be fully implemented in the next update.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication failed");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBackground,
                { backgroundColor: Colors.dark.primary + "20" },
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={40}
                color={Colors.dark.primary}
              />
            </View>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your master password to unlock your password vault
          </Text>
        </View>

        {/* Auth Form */}
        <Card style={styles.formCard} variant="elevated">
          <View style={styles.formContent}>
            <Input
              label="Master Password"
              placeholder="Enter your master password"
              value={masterPassword}
              onChangeText={setMasterPassword}
              variant="password"
              showPasswordToggle
              leftIcon="key"
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={handlePasswordAuth}
              returnKeyType="done"
            />

            <Button
              title="Unlock Vault"
              onPress={handlePasswordAuth}
              disabled={masterPassword.length === 0 || failedAttempts >= 5}
              loading={isLoading}
              variant="primary"
              gradient
              fullWidth
              size="large"
            />

            {/* Biometric Authentication */}
            {biometricAvailable && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  onPress={handleBiometricAuth}
                  style={styles.biometricButton}
                  disabled={failedAttempts >= 5}
                >
                  <LinearGradient
                    colors={[
                      Colors.dark.neonGreen + "20",
                      Colors.dark.electricBlue + "20",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.biometricGradient}
                  >
                    <Ionicons
                      name="finger-print"
                      size={24}
                      color={Colors.dark.neonGreen}
                      style={styles.biometricIcon}
                    />
                    <Text style={styles.biometricText}>
                      Use Biometric Authentication
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Card>

        {/* Security Notice */}
        {failedAttempts > 0 && (
          <Card variant="gradient" style={styles.warningCard}>
            <View style={styles.warningContent}>
              <Ionicons
                name="warning"
                size={24}
                color={Colors.dark.warning}
                style={styles.warningIcon}
              />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>Security Notice</Text>
                <Text style={styles.warningDescription}>
                  {failedAttempts} failed attempt
                  {failedAttempts === 1 ? "" : "s"}.
                  {failedAttempts >= 5
                    ? " Account temporarily locked for security."
                    : ` ${5 - failedAttempts} attempts remaining.`}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: 24 }]}>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>
            Forgot your master password?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 24,
  },
  formContent: {
    gap: 20,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  biometricButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  biometricGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.dark.neonGreen + "40",
    borderRadius: 12,
  },
  biometricIcon: {
    marginRight: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.neonGreen,
  },
  warningCard: {
    marginBottom: 24,
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.warning,
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  footerLink: {
    paddingVertical: 12,
  },
  footerLinkText: {
    fontSize: 14,
    color: Colors.dark.primary,
    textDecorationLine: "underline",
  },
});
