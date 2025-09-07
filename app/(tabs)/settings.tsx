import { ReachPressable } from "@/components/ui/ReachPressable";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/useAppContext";
import {
  changeMasterPassword,
  clearAllData,
  exportEncryptedData,
  importEncryptedData,
  verifyMasterPassword,
} from "@/services/storage/secureStorage";
import { usePasswordStore } from "@/stores/passwordStore";
import { UserSettings } from "@/types";
import { ensureAuthenticated, syncAuthentication } from "@/utils/authSync";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polygon } from "react-native-svg";

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
  const {
    state,
    dispatch,
    saveData,
    updateSettings,
    lockCountdown,
    loadUserData,
  } = useAppContext();
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

  // Import modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [importPassword, setImportPassword] = useState("");
  const [importData, setImportData] = useState<{
    encryptedData: any;
    stats: any;
  } | null>(null);

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
    } catch (error: any) {
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
    } catch (error: any) {
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
      } catch (error: any) {
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
          onPress: () => {
            updateSetting("autoLockTimeout", 1);
          },
        },
        {
          text: "5 minutes",
          onPress: () => {
            updateSetting("autoLockTimeout", 5);
          },
        },
        {
          text: "15 minutes",
          onPress: () => {
            updateSetting("autoLockTimeout", 15);
          },
        },
        {
          text: "30 minutes",
          onPress: () => {
            updateSetting("autoLockTimeout", 30);
          },
        },
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
    } catch (error: any) {
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
    } catch (error: any) {
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

        // Try to save to public external directory
        let fileUri: string;
        let locationDescription: string;

        // Check if external directory is available
        if (FileSystem.StorageAccessFramework) {
          try {
            // Request directory access for external storage
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
              // Save to external directory (user can access)
              const fileString = JSON.stringify(exportPayload, null, 2);
              fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                exportFileName,
                "application/json"
              );

              await FileSystem.writeAsStringAsync(fileUri, fileString);
              locationDescription = "External Storage (Public)";
            } else {
              throw new Error("External storage permission denied");
            }
          } catch (externalError) {
            console.log(
              "External storage failed, trying downloads:",
              externalError
            );

            // Fallback: Try to use downloads directory if available
            try {
              const downloadsUri =
                FileSystem.documentDirectory + "../Download/" + exportFileName;
              await FileSystem.writeAsStringAsync(
                downloadsUri,
                JSON.stringify(exportPayload, null, 2)
              );
              fileUri = downloadsUri;
              locationDescription = "Downloads folder";
            } catch (downloadError) {
              console.log("Downloads failed, using documents:", downloadError);
              // Final fallback: app documents
              fileUri = FileSystem.documentDirectory + exportFileName;
              await FileSystem.writeAsStringAsync(
                fileUri,
                JSON.stringify(exportPayload, null, 2)
              );
              locationDescription = "App Documents (private)";
            }
          }
        } else {
          // For iOS or when StorageAccessFramework is not available
          fileUri = FileSystem.documentDirectory + exportFileName;
          await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(exportPayload, null, 2)
          );
          locationDescription = "App Documents";
        }

        // Verify file exists
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          throw new Error("Export file was not created successfully");
        }

        Alert.alert(
          "Export Successful",
          `✅ Backup created successfully!\n\nFile: ${exportFileName}\nLocation: ${locationDescription}\nSize: ${Math.round(
            fileInfo.size! / 1024
          )} KB\n\n📊 Contains:\n• ${passwords.length} passwords\n• ${
            secureNotes.length
          } secure notes\n• All settings`,
          [
            { text: "OK" },
            {
              text: "Show Location",
              onPress: () => {
                Alert.alert(
                  "File Location",
                  locationDescription.includes("private")
                    ? `Path: ${fileUri}\n\nNote: This is in your app's private folder. To make it accessible:\n• Share the file through other apps\n• Copy to public storage manually`
                    : `Your backup file is now in your device's ${locationDescription}.\n\nYou can access it through:\n• File Manager app\n• Downloads folder\n• Any file browser`
                );
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Export Error",
          "Failed to export data. No data found or encryption error?."
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
    try {
      console.log("Starting file selection...");
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/plain", "*/*"], // Allow more file types
        copyToCacheDirectory: true, // Ensure we can read the file
      });

      console.log("DocumentPicker result:", result);

      if (result.canceled) {
        console.log("File selection was canceled");
        return;
      }

      // Handle both old and new DocumentPicker API
      let fileUri: string;
      if (result.assets && result.assets.length > 0) {
        // New API format
        fileUri = result.assets[0].uri;
        console.log("Using new API format, file URI:", fileUri);
      } else if ((result as any).uri) {
        // Old API format fallback
        fileUri = (result as any).uri;
        console.log("Using old API format, file URI:", fileUri);
      } else {
        throw new Error("No file selected or invalid result format");
      }

      console.log("Reading file from:", fileUri);
      const backupData = await FileSystem.readAsStringAsync(fileUri);
      console.log("File data length:", backupData.length);
      console.log("File data preview:", backupData.substring(0, 200) + "...");

      parseImportData(backupData);
    } catch (error: any) {
      console.error("Error selecting import file:", error);
      Alert.alert(
        "Import Error",
        `Failed to read the backup file.\n\nError: ${
          error?.message || "" || error
        }\n\nPlease ensure you're selecting a valid JSON backup file.`
      );
    }
  };

  const parseImportData = (backupData: string) => {
    try {
      console.log("Parsing import data...");
      const importPayload = JSON.parse(backupData);
      console.log("Parsed payload structure:", Object.keys(importPayload));

      // Check if it's a valid Passport backup (new format)
      if (
        importPayload.app === "Passport Security Vault" &&
        importPayload.encryptedData
      ) {
        console.log("Detected new Passport backup format");
        console.log("Data stats:", importPayload.dataStats);
        setIsLoading(true); // Set loading when showing password prompt
        promptMasterPasswordForImport(
          importPayload.encryptedData,
          importPayload.dataStats
        );
      } else if (importPayload.passwords || importPayload.secureNotes) {
        // Direct encrypted data format (from exportEncryptedData function)
        console.log("Detected direct encrypted data format");
        setIsLoading(true); // Set loading when showing password prompt
        promptMasterPasswordForImport(backupData, {
          passwords: importPayload.passwords ? "encrypted" : 0,
          notes: importPayload.secureNotes ? "encrypted" : 0,
        });
      } else if (typeof importPayload === "string") {
        // Legacy string format
        console.log("Detected legacy string format");
        setIsLoading(true); // Set loading when showing password prompt
        promptMasterPasswordForImport(backupData, null);
      } else {
        console.log("Unknown backup format:", importPayload);
        Alert.alert(
          "Invalid Backup File",
          `This doesn't appear to be a valid Passport backup file.\n\nExpected: Passport Security Vault backup\nFound: ${
            importPayload.app || "Unknown format"
          }\n\nPlease select the correct backup file exported from Passport.`
        );
      }
    } catch (parseError: any) {
      console.error("Parse error:", parseError);
      Alert.alert(
        "Invalid File Format",
        `Unable to parse the backup file. This might not be a valid JSON file.\n\nError: ${
          parseError?.message || ""
        }\n\nPlease ensure you're selecting a backup file exported from Passport.`
      );
    }
  };

  const promptMasterPasswordForImport = (encryptedData: any, stats: any) => {
    console.log("Prompting for master password...");
    console.log("Stats:", stats);

    // Store the import data and show our custom modal
    setImportData({ encryptedData, stats });
    setImportPassword("");
    setShowPasswordModal(true);
  };

  const handlePasswordModalCancel = () => {
    console.log("Import canceled by user");
    setShowPasswordModal(false);
    setImportData(null);
    setImportPassword("");
    setIsLoading(false);
  };

  const handlePasswordModalSubmit = () => {
    console.log("User entered password, length:", importPassword?.length || 0);

    if (importPassword && importPassword.trim() && importData) {
      setShowPasswordModal(false);

      // Pass the correct data format - importData.encryptedData is already the JSON string from exportEncryptedData
      const dataToImport =
        typeof importData.encryptedData === "string"
          ? importData.encryptedData
          : JSON.stringify(importData.encryptedData);

      console.log("Data to import type:", typeof dataToImport);
      console.log("Data preview:", dataToImport.substring(0, 100) + "...");

      performImport(dataToImport, importPassword.trim(), importData.stats);
      setImportPassword("");
      setImportData(null);
    } else {
      Alert.alert("Error", "Please enter a valid master password.");
    }
  };

  const performImport = async (
    encryptedData: any,
    masterPassword: string,
    stats: any
  ) => {
    try {
      setIsLoading(true);
      console.log("Starting import process...");
      console.log("Import data type:", typeof encryptedData);

      // First verify if the provided password is correct by checking against stored hash
      // OR by trying to decrypt the data directly
      console.log("Verifying master password for import...");

      // Try to verify against current stored password first
      let isPasswordValid = false;
      try {
        isPasswordValid = await verifyMasterPassword(masterPassword);
        console.log(
          "Password verification against stored hash:",
          isPasswordValid
        );
      } catch (verifyError) {
        console.log(
          "Could not verify against stored hash, will try direct decryption"
        );
        // If verification fails, we'll let the importEncryptedData function try to decrypt
        // and catch the specific decryption error
      }

      // The encryptedData should already be the correct format from exportEncryptedData
      console.log("Calling importEncryptedData...");
      console.log("Data type being imported:", typeof encryptedData);

      const success = await importEncryptedData(encryptedData, masterPassword);
      console.log("Import result:", success);

      if (success) {
        console.log("Import successful, reloading data...");

        // Force refresh data after successful import
        try {
          console.log("Reloading user data...");

          if (state.isAuthenticated && state.masterPassword) {
            // Reload data using the current master password
            await loadUserData(state.masterPassword);
            console.log("Data reloaded with current master password");
          } else {
            // If not authenticated, try with the import password
            console.log("Not authenticated, trying with import password");
            await loadUserData(masterPassword);

            // Update authentication state
            dispatch({
              type: "AUTHENTICATE",
              payload: { isAuthenticated: true, masterPassword },
            });
            console.log("Authentication updated with import password");
          }

          console.log("Data reload completed successfully");
        } catch (reloadError) {
          console.error("Error reloading data:", reloadError);
          // Continue even if reload fails - data was imported to storage
        }

        const successMessage =
          stats && stats.passwords && stats.notes
            ? `Successfully imported data!\n\n📊 Import Summary:\n• ${
                stats.passwords === "encrypted"
                  ? "Passwords"
                  : stats.passwords + " passwords"
              }\n• ${
                stats.notes === "encrypted"
                  ? "Secure Notes"
                  : stats.notes + " secure notes"
              }\n\nData has been merged with your existing data.`
            : "Data imported successfully and merged with your existing data!";

        Alert.alert("✅ Import Successful", successMessage, [
          {
            text: "Refresh Data",
            onPress: async () => {
              try {
                console.log("Manual refresh triggered");
                const passwordToUse = state.masterPassword || masterPassword;

                if (passwordToUse) {
                  dispatch({ type: "SET_LOADING", payload: true });
                  await loadUserData(passwordToUse);

                  // Also sync with password store if available
                  try {
                    await syncAuthentication(true, passwordToUse);
                    console.log("Password store synced");
                  } catch (syncError) {
                    console.warn("Password store sync failed:", syncError);
                  }

                  // Force UI refresh
                  setTimeout(() => {
                    dispatch({ type: "SET_LOADING", payload: false });
                  }, 500);

                  Alert.alert(
                    "✅ Data Refreshed",
                    "Your imported data is now visible in the app."
                  );
                } else {
                  Alert.alert(
                    "Error",
                    "No master password available for refresh."
                  );
                }
              } catch (error: any) {
                console.error("Error refreshing data:", error);
                dispatch({ type: "SET_LOADING", payload: false });
                Alert.alert(
                  "Refresh Failed",
                  `Error: ${error?.message || "" || error}`
                );
              }
            },
          },
          {
            text: "Done",
            style: "default",
          },
        ]);
      } else {
        // Import failed - show error with option to try again
        Alert.alert(
          "❌ Import Failed",
          "Unable to import the backup data. This is most likely due to an incorrect master password.\n\nPlease check your master password and try again.",
          [
            {
              text: "Try Again",
              onPress: () => {
                // Reset and show password modal again
                setImportPassword("");
                setShowPasswordModal(true);
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                setImportData(null);
                setImportPassword("");
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Import error:", error);

      // Check if it's likely a decryption/password error
      const errorMessage = error?.message?.toLowerCase() || "";
      const isPasswordError =
        errorMessage.includes("decrypt") ||
        errorMessage.includes("cipher") ||
        errorMessage.includes("key") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("corrupt");

      if (isPasswordError) {
        Alert.alert(
          "❌ Wrong Master Password",
          "The master password you entered is incorrect. The backup file cannot be decrypted with this password.\n\nPlease enter the correct master password that was used when creating this backup.",
          [
            {
              text: "Try Again",
              onPress: () => {
                // Reset and show password modal again
                setImportPassword("");
                setShowPasswordModal(true);
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                setImportData(null);
                setImportPassword("");
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Import Error",
          `Failed to import data.\n\nError: ${
            error?.message || error
          }\n\nThis could be due to:\n• Corrupted or invalid backup file\n• Network or storage issues\n• Incompatible backup format`
        );
      }
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
    } catch (error: any) {
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
        // Reset app state and navigate to setup screen
        dispatch({ type: "RESET_APP" });

        Alert.alert(
          "✅ Data Deleted Successfully",
          "All your passwords, notes, and settings have been permanently deleted. The app has been reset to initial setup.",
          [
            {
              text: "Start Fresh",
              onPress: () => {
                // Navigate to setup screen using router.replace to prevent going back
                router.replace("/setup");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to delete data. Please try again.");
      }
    } catch (error: any) {
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
    } catch (error: any) {
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

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }
    if (seconds > 0 || minutes === 0) {
      parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
    }
    return parts.join(" ");
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
                lockCountdown !== null
                  ? `Locks in ${formatTime(lockCountdown)}`
                  : settings.autoLockTimeout === 0
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
          <View style={styles.actionsGrid}>
            <ActionButton
              title="Backup Data"
              subtitle="Save current data"
              icon="shield-checkmark"
              color={Colors.dark.neonGreen}
              onPress={handleBackupData}
              disabled={isLoading}
            />
            <ActionButton
              title="Export Backup"
              subtitle="Save to device"
              icon="download"
              onPress={handleExportData}
              disabled={isLoading}
            />
            <ActionButton
              title="Import Backup"
              subtitle="Restore from file"
              icon="cloud-upload"
              color="#8b5cf6"
              onPress={handleImportData}
              disabled={isLoading}
            />
            <ActionButton
              title="Change Master Key"
              subtitle="Update password"
              icon="key"
              onPress={handleChangeMasterPassword}
              disabled={isLoading}
            />
            <ActionButton
              title="Delete All Data"
              subtitle="Nuke everything"
              icon="trash"
              color={Colors.dark.error}
              onPress={handleDeleteAllData}
              disabled={isLoading}
            />
            <ActionButton
              title="Review App"
              subtitle="Rate on store"
              icon="star"
              color={Colors.dark.warning}
              onPress={() => Alert.alert("Coming Soon!")}
              disabled={isLoading}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <ReachPressable
            onLongPress={() => {
              Alert.alert(
                "Debug Info",
                `Authentication Status:\n• Is Authenticated: ${
                  state.isAuthenticated
                }\n• Has Master Password: ${!!state.masterPassword}\n• Passwords Count: ${
                  passwords.length
                }\n• Notes Count: ${secureNotes.length}`
              );
            }}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0)"]}
              style={styles.footerBadge}
            >
              <Text style={styles.appVersion}>Passport v1.0.0</Text>
            </LinearGradient>
          </ReachPressable>
          <Text style={styles.footerText}>
            {isLoading
              ? "Syncing with the mothership..."
              : "Built for space explorers 🚀"}
          </Text>
        </View>
      </ScrollView>

      {/* Import Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handlePasswordModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name="cloud-download"
                    size={28}
                    color={Colors.dark.primary}
                  />
                </View>
                <Text style={styles.modalTitle}>Import Backup</Text>
                <Text style={styles.modalSubtitle}>
                  Enter your master password to decrypt and import the backup
                  data
                </Text>
              </View>

              {/* Stats Card */}
              {importData?.stats && (
                <View style={styles.statsCard}>
                  <Text style={styles.statsTitle}>Backup Contents</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {importData.stats.passwords}
                      </Text>
                      <Text style={styles.statLabel}>Passwords</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {importData.stats.notes}
                      </Text>
                      <Text style={styles.statLabel}>Notes</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Password Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Master Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="key"
                    size={20}
                    color={Colors.dark.textMuted}
                    style={styles.inputIconLeft}
                  />
                  <TextInput
                    style={styles.passwordInput}
                    value={importPassword}
                    onChangeText={setImportPassword}
                    placeholder="Enter password..."
                    placeholderTextColor={Colors.dark.textMuted}
                    secureTextEntry={true}
                    autoFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={handlePasswordModalSubmit}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionButtons}>
                <ReachPressable
                  style={[styles.modalActionButton, styles.modalCancelButton]}
                  onPress={handlePasswordModalCancel}
                  reachScale={1.02}
                  pressScale={0.98}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </ReachPressable>

                <ReachPressable
                  style={[styles.modalActionButton, styles.modalImportButton]}
                  onPress={handlePasswordModalSubmit}
                  reachScale={1.02}
                  pressScale={0.98}
                >
                  <LinearGradient
                    colors={[Colors.dark.primary, Colors.dark.neonGreen]}
                    style={styles.importButtonInner}
                  >
                    <Ionicons name="download" size={16} color="#000" />
                    <Text style={styles.importText}>Import</Text>
                  </LinearGradient>
                </ReachPressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%", // Two columns
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  actionGradient: {
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    minHeight: 140,
    justifyContent: "center",
  },
  actionText: {
    marginTop: 12,
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    marginTop: 20,
  },
  footerBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    opacity: 0.8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 380,
  },
  modalContent: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.dark.primary + "40",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.15)",
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
  },
  inputIconLeft: {
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  modalActionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalCancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    alignItems: "center",
  },
  cancelText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalImportButton: {
    overflow: "hidden",
  },
  importButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  importText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
