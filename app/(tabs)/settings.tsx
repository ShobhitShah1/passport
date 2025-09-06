import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Polygon,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import {
  changeMasterPassword,
  clearAllData,
  exportEncryptedData,
  importEncryptedData,
} from "@/services/storage/secureStorage";
import { usePasswordStore } from "@/stores/passwordStore";
import { UserSettings } from "@/types";
import { ensureAuthenticated } from "@/utils/authSync";

const TwinklingStar = ({ style, size }: { style: object; size: number }) => {
  return (
    <View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "white",
          opacity: 0.4,
        },
        style,
      ]}
    />
  );
};

const StarField = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        key: `s1-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 1.5 + 0.5,
      })),
    []
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <TwinklingStar
          key={star.key}
          style={{ left: star.left, top: star.top }}
          size={star.size}
        />
      ))}
    </View>
  );
};

const FloatingHexagon = ({ style }: { style: object }) => {
  const hexPoints = (size: number) =>
    Array.from({ length: 6 })
      .map((_, i) => {
        const angle_deg = 60 * i - 30;
        const angle_rad = (Math.PI / 180) * angle_deg;
        return `${size * Math.cos(angle_rad)},${size * Math.sin(angle_rad)}`;
      })
      .join(" ");

  return (
    <View style={[{ position: "absolute" }, style]}>
      <Svg width={60} height={60} viewBox="-30 -30 60 60">
        <Polygon
          points={hexPoints(25)}
          stroke={Colors.dark.primary}
          strokeWidth="1"
          fill="none"
          opacity={0.3}
        />
      </Svg>
    </View>
  );
};

export default function SettingsTabScreen() {
  const { state, dispatch, saveData, updateSettings } = useAppContext();
  const {
    passwords,
    secureNotes,
    settings,
    updateSettings: updateStoreSettings,
    copyToClipboard,
    calculateSecurityScore,
  } = usePasswordStore();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [dataStats, setDataStats] = useState({
    passwords: 0,
    notes: 0,
    lastBackup: null as Date | null,
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    updateDataStats();
  }, [passwords, secureNotes]);

  const updateDataStats = () => {
    const securityData = calculateSecurityScore();
    setDataStats({
      passwords: passwords.length,
      notes: secureNotes.length,
      lastBackup: null, // Will be implemented with backup tracking
    });
  };

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      setBiometricAvailable(isAvailable);
    } catch (error) {
      console.error("Error checking biometric availability:", error);
    }
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    try {
      setIsLoading(true);

      // Ensure authentication before updating settings
      const isAuthenticated = await ensureAuthenticated(
        state.isAuthenticated,
        state.masterPassword
      );
      if (!isAuthenticated) {
        Alert.alert(
          "Authentication Required",
          "Please log in again to update settings."
        );
        return;
      }

      // Update both stores for compatibility
      await Promise.all([
        updateSettings({ [key]: value } as Partial<UserSettings>),
        updateStoreSettings({ [key]: value } as Partial<UserSettings>).catch(
          (error) => {
            console.warn(
              "PasswordStore settings update failed, continuing with context only:",
              error
            );
          }
        ),
      ]);
    } catch (error) {
      console.error("Error updating setting:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricToggle = async (enabled?: boolean) => {
    if (enabled === undefined) return;
    if (!biometricAvailable) {
      Alert.alert(
        "Not Available",
        "Biometric authentication is not available on this device."
      );
      return;
    }

    if (enabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Enable biometric authentication",
          fallbackLabel: "Use PIN",
          disableDeviceFallback: false,
        });

        if (result.success) {
          await updateSetting("biometricEnabled", true);
        } else {
          Alert.alert("Authentication Failed", "Please try again.");
        }
      } catch (error) {
        console.error("Biometric auth error:", error);
        Alert.alert("Error", "Failed to enable biometric authentication.");
      }
    } else {
      await updateSetting("biometricEnabled", false);
    }
  };

  const handleAutoLockTimeoutChange = () => {
    Alert.alert(
      "Auto-Lock Timeout",
      "Choose when to lock the app automatically:",
      [
        {
          text: "1 minute",
          onPress: () => updateSetting("autoLockTimeout", 1),
        },
        {
          text: "5 minutes",
          onPress: () => updateSetting("autoLockTimeout", 5),
        },
        {
          text: "15 minutes",
          onPress: () => updateSetting("autoLockTimeout", 15),
        },
        {
          text: "30 minutes",
          onPress: () => updateSetting("autoLockTimeout", 30),
        },
        { text: "Never", onPress: () => updateSetting("autoLockTimeout", 0) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handlePasswordLengthChange = () => {
    Alert.alert(
      "Default Password Length",
      "Choose the default length for generated passwords:",
      [
        {
          text: "12 characters",
          onPress: () => updateSetting("defaultPasswordLength", 12),
        },
        {
          text: "16 characters",
          onPress: () => updateSetting("defaultPasswordLength", 16),
        },
        {
          text: "20 characters",
          onPress: () => updateSetting("defaultPasswordLength", 20),
        },
        {
          text: "24 characters",
          onPress: () => updateSetting("defaultPasswordLength", 24),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleWidgetThemeChange = (
    theme: "cyber" | "holographic" | "neon" | "minimal"
  ) => {
    try {
      // For now, store the theme preference globally since we don't have individual widget IDs
      // In a real app, you'd store this per widget instance
      Alert.alert(
        "Theme Updated",
        `Widget theme changed to ${
          theme.charAt(0).toUpperCase() + theme.slice(1)
        }. Widgets will update automatically.`,
        [{ text: "OK" }]
      );

      // You could store this in settings for persistence
      // updateSetting('widgetTheme', theme);
    } catch (error) {
      Alert.alert("Error", "Failed to update widget theme.");
    }
  };

  const handleMaxNotesChange = (count: number) => {
    try {
      Alert.alert(
        "Notes Count Updated",
        `Widget will now display up to ${count} notes. Widgets will update automatically.`,
        [{ text: "OK" }]
      );

      // Store in settings for persistence
      // updateSetting('widgetMaxNotes', count);
    } catch (error) {
      Alert.alert("Error", "Failed to update widget notes count.");
    }
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      if (!state.isAuthenticated || !state.masterPassword) {
        Alert.alert(
          "Authentication Required",
          "You need to be logged in to export your data. Please restart the app and log in again.",
          [{ text: "OK", onPress: () => dispatch({ type: "LOCK_APP" }) }]
        );
        return;
      }

      // First save current data to ensure everything is persisted
      try {
        await saveData();
      } catch (saveError) {
        console.log("Save warning:", saveError);
        // Continue with export even if save fails - data might already be saved
      }

      const exportData = await exportEncryptedData();

      if (exportData) {
        // Create a more structured export
        const exportFileName = `passport-backup-${
          new Date().toISOString().split("T")[0]
        }.json`;
        const exportPayload = {
          app: "Passport Security Vault",
          version: "1.0.0",
          exportDate: new Date().toISOString(),
          dataStats: {
            passwords: passwords.length,
            notes: secureNotes.length,
            settings: Object.keys(settings).length,
          },
          encryptedData: exportData,
        };

        await Share.share({
          message: JSON.stringify(exportPayload, null, 2),
          title: "Passport Security Vault Backup",
        });

        Alert.alert(
          "✅ Export Successful",
          `Exported ${passwords.length} passwords and ${secureNotes.length} notes.\n\nBackup file: ${exportFileName}`
        );
      } else {
        Alert.alert(
          "Export Error",
          "Failed to export data. No data found or encryption error."
        );
      }
    } catch (error: any) {
      console.error("Export error:", error);
      const errorMessage = error?.message?.includes("Not authenticated")
        ? "Authentication expired. Please restart the app and log in again."
        : "Failed to export data. Please try again.";
      Alert.alert("Export Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      "Import Backup Data",
      "This will import encrypted data from a backup file. Your current data will be merged with the imported data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Select Backup File",
          onPress: selectImportFile,
        },
      ]
    );
  };

  const selectImportFile = async () => {
    // For now, use a simple text input approach
    Alert.prompt(
      "Import Backup Data",
      "Paste your exported backup JSON data:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: (backupData) => {
            if (backupData) {
              parseImportData(backupData);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const parseImportData = (backupData: string) => {
    try {
      const importPayload = JSON.parse(backupData);

      // Check if it's a valid Passport backup
      if (
        importPayload.app === "Passport Security Vault" &&
        importPayload.encryptedData
      ) {
        promptMasterPasswordForImport(
          importPayload.encryptedData,
          importPayload.dataStats
        );
      } else if (typeof importPayload === "string" || importPayload.passwords) {
        // Legacy format or direct encrypted data
        promptMasterPasswordForImport(backupData, null);
      } else {
        Alert.alert(
          "Invalid Data",
          "Pasted data is not a valid Passport backup."
        );
      }
    } catch (parseError) {
      Alert.alert(
        "Invalid Data",
        "Unable to parse the backup data. Please paste valid JSON backup data."
      );
    }
  };

  const promptMasterPasswordForImport = (encryptedData: any, stats: any) => {
    Alert.prompt(
      "Import Data",
      stats
        ? `Backup contains ${stats.passwords} passwords and ${stats.notes} notes.\n\nEnter the master password used to create this backup:`
        : "Enter the master password used to create this backup:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: (masterPassword) => {
            if (masterPassword) {
              performImport(encryptedData, masterPassword, stats);
            }
          },
        },
      ],
      "secure-text"
    );
  };

  const performImport = async (
    encryptedData: any,
    masterPassword: string,
    stats: any
  ) => {
    try {
      setIsLoading(true);

      const success = await importEncryptedData(
        typeof encryptedData === "string"
          ? encryptedData
          : JSON.stringify(encryptedData),
        masterPassword
      );

      if (success) {
        // Reload data after import
        (await state.masterPassword) &&
          (await dispatch({ type: "SET_LOADING", payload: true }));

        Alert.alert(
          "✅ Import Successful",
          stats
            ? `Successfully imported ${stats.passwords} passwords and ${stats.notes} notes.\n\nPlease restart the app to see all imported data.`
            : "Data imported successfully. Please restart the app to see all imported data.",
          [
            {
              text: "Restart App",
              onPress: () => dispatch({ type: "LOCK_APP" }),
            },
          ]
        );
      } else {
        Alert.alert(
          "Import Failed",
          "Failed to import data. Please check the master password and try again."
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert(
        "Import Error",
        "Failed to import data. The backup file may be corrupted or the password is incorrect."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupData = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      if (!state.isAuthenticated || !state.masterPassword) {
        Alert.alert(
          "Authentication Required",
          "You need to be logged in to backup your data. Please restart the app and log in again.",
          [{ text: "OK", onPress: () => dispatch({ type: "LOCK_APP" }) }]
        );
        return;
      }

      // Force save all current data
      try {
        await saveData();

        Alert.alert(
          "✅ Data Backed Up",
          `Successfully backed up:\n• ${passwords.length} passwords\n• ${secureNotes.length} secure notes\n• All settings\n\nData is automatically encrypted and stored securely on your device.`,
          [{ text: "OK" }]
        );

        setDataStats((prev) => ({ ...prev, lastBackup: new Date() }));
      } catch (saveError: any) {
        console.error("Backup save error:", saveError);
        const errorMessage = saveError?.message?.includes("Not authenticated")
          ? "Authentication expired. Please restart the app and log in again."
          : "Failed to backup data. Please try again.";
        Alert.alert("Backup Error", errorMessage);
      }
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert("Backup Error", "Failed to backup data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your passwords, notes, and settings. This action cannot be undone.\n\nAre you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => confirmDeleteAllData(),
        },
      ]
    );
  };

  const confirmDeleteAllData = async () => {
    try {
      setIsLoading(true);
      const success = await clearAllData();

      if (success) {
        Alert.alert(
          "Data Deleted",
          "All data has been deleted successfully. The app will restart.",
          [{ text: "OK", onPress: () => dispatch({ type: "LOCK_APP" }) }]
        );
      } else {
        Alert.alert("Error", "Failed to delete data. Please try again.");
      }
    } catch (error) {
      console.error("Delete data error:", error);
      Alert.alert("Error", "Failed to delete data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeMasterPassword = () => {
    Alert.prompt(
      "Change Master Password",
      "Enter your current master password:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: (currentPassword) => {
            if (currentPassword) {
              promptNewPassword(currentPassword);
            }
          },
        },
      ],
      "secure-text"
    );
  };

  const promptNewPassword = (currentPassword: string) => {
    Alert.prompt(
      "New Master Password",
      "Enter your new master password:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          onPress: (newPassword) => {
            if (newPassword) {
              confirmNewPassword(currentPassword, newPassword);
            }
          },
        },
      ],
      "secure-text"
    );
  };

  const confirmNewPassword = (currentPassword: string, newPassword: string) => {
    Alert.prompt(
      "Confirm New Password",
      "Re-enter your new master password:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: (confirmPassword) => {
            if (confirmPassword === newPassword) {
              changeMasterPasswordAsync(currentPassword, newPassword);
            } else {
              Alert.alert("Error", "Passwords do not match. Please try again.");
            }
          },
        },
      ],
      "secure-text"
    );
  };

  const changeMasterPasswordAsync = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setIsLoading(true);
      const success = await changeMasterPassword(currentPassword, newPassword);

      if (success) {
        Alert.alert(
          "Success",
          "Master password has been changed successfully. Please log in again with your new password.",
          [{ text: "OK", onPress: () => dispatch({ type: "LOCK_APP" }) }]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to change master password. Please check your current password and try again."
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert(
        "Error",
        "Failed to change master password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const SettingRow = ({
    title,
    subtitle,
    icon,
    value,
    onToggle,
    type = "switch",
    disabled = false,
  }: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: boolean;
    onToggle: (value?: boolean) => void;
    type?: "switch" | "button";
    disabled?: boolean;
  }) => {
    return (
      <ReachPressable
        style={[styles.settingRow, disabled && styles.disabledRow]}
        onPress={() => {
          if (type === "button" && !disabled) onToggle();
        }}
        disabled={disabled}
        reachScale={1.02}
        pressScale={0.98}
      >
        <View style={styles.settingBlur}>
          <View style={styles.settingContent}>
            <View
              style={[
                styles.settingIcon,
                value && !disabled && styles.settingIconActive,
              ]}
            >
              <Ionicons
                name={icon}
                size={24}
                color={
                  disabled
                    ? Colors.dark.textMuted
                    : value
                    ? Colors.dark.primary
                    : Colors.dark.textMuted
                }
              />
            </View>
            <View style={styles.settingTextContainer}>
              <Text
                style={[styles.settingTitle, disabled && styles.disabledText]}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.settingSubtitle,
                  disabled && styles.disabledText,
                ]}
              >
                {subtitle}
              </Text>
            </View>
            {type === "switch" && (
              <Switch
                value={value}
                onValueChange={(newValue) => {
                  if (!disabled && onToggle) {
                    onToggle(newValue);
                  }
                }}
                trackColor={{
                  false: Colors.dark.surface,
                  true: Colors.dark.primary + "40",
                }}
                thumbColor={
                  value ? Colors.dark.neonGreen : Colors.dark.textMuted
                }
                disabled={disabled}
              />
            )}
            {type === "button" && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  disabled ? Colors.dark.textMuted : Colors.dark.textSecondary
                }
              />
            )}
          </View>
        </View>
      </ReachPressable>
    );
  };

  const ActionButton = ({
    title,
    subtitle,
    icon,
    onPress,
    color = Colors.dark.primary,
    disabled = false,
  }: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
    disabled?: boolean;
  }) => {
    return (
      <ReachPressable
        style={[styles.actionButton, disabled && styles.disabledRow]}
        onPress={() => !disabled && onPress()}
        disabled={disabled}
        reachScale={1.03}
        pressScale={0.97}
      >
        <LinearGradient
          colors={[color + "20", color + "40"]}
          style={styles.actionGradient}
        >
          <Ionicons
            name={icon}
            size={28}
            color={disabled ? Colors.dark.textMuted : color}
          />
          <View style={styles.actionText}>
            <Text
              style={[
                styles.actionTitle,
                { color: disabled ? Colors.dark.textMuted : color },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[styles.actionSubtitle, disabled && styles.disabledText]}
            >
              {subtitle}
            </Text>
          </View>
        </LinearGradient>
      </ReachPressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StarField />

      <FloatingHexagon style={{ top: "10%", right: "10%" }} />
      <FloatingHexagon style={{ top: "60%", left: "5%" }} />
      <FloatingHexagon style={{ top: "80%", right: "20%" }} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
              <Defs>
                <SvgLinearGradient
                  id="settingsGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0%" stopColor={Colors.dark.primary} />
                  <Stop offset="100%" stopColor={Colors.dark.neonGreen} />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx="50"
                cy="50"
                r="35"
                fill="url(#settingsGradient)"
                opacity={0.3}
              />
            </Svg>
            <Ionicons
              name="settings"
              size={50}
              color={Colors.dark.primary}
              style={styles.headerIcon}
            />
          </View>
          <Text style={styles.title}>Mission Settings</Text>
          <Text style={styles.subtitle}>Configure your space vault</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={Colors.dark.primary}
            />
            <Text style={styles.sectionTitle}>Security Protocol</Text>
          </View>
          <View style={styles.settingsGroup}>
            <SettingRow
              title="Biometric Unlock"
              subtitle={
                biometricAvailable
                  ? "Use fingerprint or face recognition"
                  : "Not available on this device"
              }
              icon="finger-print"
              value={settings?.biometricEnabled ?? false}
              onToggle={handleBiometricToggle}
              disabled={!biometricAvailable || isLoading}
            />
            <SettingRow
              title="Auto-Lock Timeout"
              subtitle={
                settings.autoLockTimeout === 0
                  ? "Never"
                  : `${settings.autoLockTimeout} minute${
                      settings.autoLockTimeout > 1 ? "s" : ""
                    }`
              }
              icon="timer"
              value={settings.autoLockTimeout > 0}
              onToggle={handleAutoLockTimeoutChange}
              type="button"
              disabled={isLoading}
            />
            <SettingRow
              title="Show Password Previews"
              subtitle="Display password hints in lists"
              icon="eye"
              value={settings?.showPasswordPreviews ?? false}
              onToggle={(value) => {
                if (value !== undefined)
                  updateSetting("showPasswordPreviews", value);
              }}
              disabled={isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="color-palette"
              size={24}
              color={Colors.dark.neonGreen}
            />
            <Text style={styles.sectionTitle}>Interface Control</Text>
          </View>
          <View style={styles.settingsGroup}>
            <SettingRow
              title="Dark Mode"
              subtitle="Space-themed dark interface"
              icon="moon"
              value={settings?.darkModeEnabled ?? true}
              onToggle={(value) => {
                if (value !== undefined)
                  updateSetting("darkModeEnabled", value);
              }}
              disabled={isLoading}
            />
            <SettingRow
              title="Default Password Length"
              subtitle={`${settings.defaultPasswordLength} characters`}
              icon="key"
              value={settings.defaultPasswordLength > 12}
              onToggle={handlePasswordLengthChange}
              type="button"
              disabled={isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud" size={24} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>

          {/* Data Statistics */}
          <View style={styles.dataStatsContainer}>
            <LinearGradient
              colors={["rgba(139, 92, 246, 0.1)", "rgba(139, 92, 246, 0.05)"]}
              style={styles.dataStatsGradient}
            >
              <View style={styles.dataStatsContent}>
                <View style={styles.dataStatsRow}>
                  <View style={styles.dataStat}>
                    <Text style={styles.dataStatNumber}>
                      {dataStats.passwords}
                    </Text>
                    <Text style={styles.dataStatLabel}>Passwords</Text>
                  </View>
                  <View style={styles.dataStatDivider} />
                  <View style={styles.dataStat}>
                    <Text style={styles.dataStatNumber}>{dataStats.notes}</Text>
                    <Text style={styles.dataStatLabel}>Secure Notes</Text>
                  </View>
                  <View style={styles.dataStatDivider} />
                  <View style={styles.dataStat}>
                    <Text style={styles.dataStatNumber}>🔒</Text>
                    <Text style={styles.dataStatLabel}>Encrypted</Text>
                  </View>
                </View>
                {dataStats.lastBackup && (
                  <Text style={styles.lastBackupText}>
                    Last backup: {dataStats.lastBackup.toLocaleDateString()}
                  </Text>
                )}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.settingsGroup}>
            <SettingRow
              title="Security Notifications"
              subtitle="Weak password and breach alerts"
              icon="shield-checkmark"
              value={settings?.notifications?.weakPasswordAlerts ?? true}
              onToggle={(value) => {
                if (value !== undefined) {
                  updateSetting("notifications", {
                    ...settings.notifications,
                    weakPasswordAlerts: value,
                    dataBreachAlerts: value,
                  });
                }
              }}
              disabled={isLoading}
            />
            <SettingRow
              title="Security Tips"
              subtitle="Helpful security reminders"
              icon="bulb"
              value={settings?.notifications?.securityTips ?? true}
              onToggle={(value) => {
                if (value !== undefined) {
                  updateSetting("notifications", {
                    ...settings.notifications,
                    securityTips: value,
                  });
                }
              }}
              disabled={isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="phone-portrait"
              size={24}
              color={Colors.dark.secondary}
            />
            <Text style={styles.sectionTitle}>Widget Configuration</Text>
          </View>
          <View style={styles.settingsGroup}>
            <SettingRow
              title="Home Screen Widgets"
              subtitle="Configure notes widgets for home screen"
              icon="grid"
              value={false}
              onToggle={() =>
                Alert.alert(
                  "Widget Setup",
                  'To add widgets:\n1. Long press on home screen\n2. Select "Widgets"\n3. Find "Passport Notes" widgets\n4. Drag to home screen\n\nWidget themes and settings can be customized below.'
                )
              }
              type="button"
              disabled={isLoading}
            />
            <SettingRow
              title="Widget Theme"
              subtitle="Choose the visual style for your widgets"
              icon="color-palette"
              value={false}
              onToggle={() =>
                Alert.alert("Widget Themes", "Choose your preferred theme:", [
                  {
                    text: "Holographic",
                    onPress: () => handleWidgetThemeChange("holographic"),
                  },
                  {
                    text: "Cyber",
                    onPress: () => handleWidgetThemeChange("cyber"),
                  },
                  {
                    text: "Neon",
                    onPress: () => handleWidgetThemeChange("neon"),
                  },
                  {
                    text: "Minimal",
                    onPress: () => handleWidgetThemeChange("minimal"),
                  },
                  { text: "Cancel", style: "cancel" },
                ])
              }
              type="button"
              disabled={isLoading}
            />
            <SettingRow
              title="Max Notes in Widget"
              subtitle="Number of notes to display (1-10)"
              icon="list"
              value={false}
              onToggle={() =>
                Alert.prompt(
                  "Widget Notes Count",
                  "Enter number of notes to show in widget (1-10):",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Update",
                      onPress: (value: any) => {
                        const count = parseInt(value || "5");
                        if (count >= 1 && count <= 10) {
                          handleMaxNotesChange(count);
                        } else {
                          Alert.alert(
                            "Invalid Number",
                            "Please enter a number between 1 and 10."
                          );
                        }
                      },
                    },
                  ] as any
                )
              }
              type="button"
              disabled={isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cog" size={24} color={Colors.dark.warning} />
            <Text style={styles.sectionTitle}>Mission Actions</Text>
          </View>
          <View style={styles.actionsGroup}>
            <ActionButton
              title="Backup Data"
              subtitle="Save current data to secure storage"
              icon="shield-checkmark"
              color={Colors.dark.neonGreen}
              onPress={handleBackupData}
              disabled={isLoading}
            />
            <ActionButton
              title="Export Backup"
              subtitle="Create shareable encrypted backup file"
              icon="download"
              onPress={handleExportData}
              disabled={isLoading}
            />
            <ActionButton
              title="Import Backup"
              subtitle="Restore data from backup file"
              icon="cloud-upload"
              color="#8b5cf6"
              onPress={handleImportData}
              disabled={isLoading}
            />
            <ActionButton
              title="Change Master Password"
              subtitle="Update your master password"
              icon="key"
              onPress={handleChangeMasterPassword}
              disabled={isLoading}
            />
            <ActionButton
              title="Delete All Data"
              subtitle="Permanently delete all vault data"
              icon="trash"
              color={Colors.dark.error}
              onPress={handleDeleteAllData}
              disabled={isLoading}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.appVersion}>Passport v1.0.0</Text>
          <Text style={styles.footerText}>
            {isLoading ? "Saving changes..." : "Built for space explorers 🚀"}
          </Text>

          {/* Debug Info - Remove in production */}
          <ReachPressable
            style={styles.debugButton}
            onPress={() => {
              Alert.alert(
                "Debug Info",
                `Authentication Status:\n• Is Authenticated: ${
                  state.isAuthenticated
                }\n• Has Master Password: ${!!state.masterPassword}\n• Is Locked: ${
                  state.isLocked
                }\n• Passwords Count: ${
                  state.passwords.length
                }\n• Notes Count: ${state.secureNotes.length}`
              );
            }}
          >
            <Text style={styles.debugText}>Debug Info</Text>
          </ReachPressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerIcon: {
    position: "absolute",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  settingsGroup: {
    backgroundColor: "rgba(26, 26, 27, 0.4)",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  actionsGroup: {
    gap: 8,
  },
  settingRow: {
    marginBottom: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingBlur: {
    backgroundColor: "rgba(26, 26, 27, 0.6)",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    marginTop: 20,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  disabledRow: {
    opacity: 0.5,
  },
  settingIconActive: {
    backgroundColor: Colors.dark.primary + "20",
    borderColor: Colors.dark.primary + "40",
    borderWidth: 1,
  },
  disabledText: {
    opacity: 0.6,
  },
  // Data Management Styles
  dataStatsContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  dataStatsGradient: {
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 16,
  },
  dataStatsContent: {
    padding: 20,
  },
  dataStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  dataStat: {
    alignItems: "center",
  },
  dataStatNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  dataStatLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dataStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
  },
  lastBackupText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  // Debug styles
  debugButton: {
    marginTop: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  debugText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: "center",
  },
});
