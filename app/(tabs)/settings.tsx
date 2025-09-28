import ChangePinModal from "@/components/modals/change-pin-modal";
import ImportBackupModal from "@/components/modals/import-backup-modal";
import { ReachPressable } from "@/components/ui";
import Colors from "@/constants/Colors";
import { useAppContext } from "@/hooks/use-app-context";
import {
  changeMasterPassword,
  clearAllData,
  exportEncryptedData,
  importEncryptedData,
  verifyMasterPassword,
} from "@/services/storage/secureStorage";
import { usePasswordStore } from "@/stores/passwordStore";
import { UserSettings } from "@/types";
import { ensureAuthenticated } from "@/utils/authSync";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    authenticate,
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
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [importData, setImportData] = useState<{
    encryptedData: any;
    stats: any;
  } | null>(null);

  // Change Master Password states
  const [showChangeMasterModal, setShowChangeMasterModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState(1); // 1, 2, or 3

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
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setBiometricAvailable(false);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setBiometricAvailable(false);
        return;
      }

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      setBiometricAvailable(types.length > 0);
    } catch (error: any) {
      console.error("Error checking biometric availability:", error);
      setBiometricAvailable(false);
    }
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    try {
      setIsLoading(true);

      // Ensure authentication before updating settings
      if (!state.isAuthenticated || !state.masterPassword) {
        Alert.alert(
          "Authentication Required",
          "Please log in again to update settings.",
          [{ text: "OK", onPress: () => router.replace("/auth") }]
        );
        return;
      }

      const isAuthenticated = await ensureAuthenticated(
        state.isAuthenticated,
        state.masterPassword
      );
      if (!isAuthenticated) {
        Alert.alert(
          "Authentication Required",
          "Please log in again to update settings.",
          [{ text: "OK", onPress: () => router.replace("/auth") }]
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
          "You need to be logged in to export your data. Please log in again.",
          [{ text: "OK", onPress: () => router.replace("/auth") }]
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

  const handlePasswordModalSubmit = async (pin: string) => {
    console.log("User entered password, length:", pin?.length || 0);

    if (pin && pin.trim() && importData) {
      try {
        // Pass the correct data format - importData.encryptedData is already the JSON string from exportEncryptedData
        const dataToImport =
          typeof importData.encryptedData === "string"
            ? importData.encryptedData
            : JSON.stringify(importData.encryptedData);

        console.log("Data to import type:", typeof dataToImport);
        console.log("Data preview:", dataToImport.substring(0, 100) + "...");

        await performImport(dataToImport, pin.trim(), importData.stats);
        // Close modal immediately on success
        setShowPasswordModal(false);
        setImportPassword("");
        setImportData(null);
      } catch (error: any) {
        console.error("Import submission error:", error);

        // Show appropriate error message
        const errorMessage = error?.message?.toLowerCase() || "";
        const isPasswordError =
          errorMessage.includes("decrypt") ||
          errorMessage.includes("cipher") ||
          errorMessage.includes("key") ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("password");

        if (isPasswordError) {
          Alert.alert(
            "❌ Wrong Master PIN",
            "The master PIN you entered is incorrect. Please try again with the correct PIN used when creating this backup.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Import Error",
            `Failed to import data.\n\nError: ${error?.message || error}`,
            [{ text: "OK" }]
          );
        }
        // Don't close modal on error, let user try again
      }
    } else if (!pin || !pin.trim()) {
      Alert.alert("Error", "Please enter a valid master password.");
    }
  };

  const performImport = async (
    encryptedData: any,
    masterPassword: string,
    stats: any
  ) => {
    try {
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
          console.log("Refreshing data stores...");

          const passwordToRefresh = state.masterPassword || masterPassword;

          // Refresh both stores
          await Promise.all([
            loadUserData(passwordToRefresh),
            authenticate(passwordToRefresh),
          ]);

          // Update authentication state if needed
          if (!state.isAuthenticated) {
            dispatch({
              type: "AUTHENTICATE",
              payload: { isAuthenticated: true, masterPassword },
            });
          }

          // Force update local stats to trigger UI refresh
          setTimeout(() => {
            updateDataStats();
          }, 100);

          console.log("Data refresh completed successfully");
        } catch (reloadError) {
          console.error("Error refreshing data:", reloadError);
          // Continue even if reload fails - data was imported to storage
        }

        // Show success message after data refresh
        setTimeout(() => {
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

          Alert.alert("✅ Import Successful", successMessage, [{ text: "OK" }]);
        }, 200);

        return true; // Success
      } else {
        // Import failed - throw error to let modal handle retry
        throw new Error(
          "Import failed: Unable to decrypt backup data. Please check your master password."
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

      // Let the modal handle the error by throwing it
      throw error;
    }
  };

  const handleBackupData = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      if (!state.isAuthenticated || !state.masterPassword) {
        Alert.alert(
          "Authentication Required",
          "You need to be logged in to backup your data. Please log in again.",
          [{ text: "OK", onPress: () => router.replace("/auth") }]
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
    setChangePasswordStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowChangeMasterModal(true);
  };

  const handleChangeMasterModalCancel = () => {
    setShowChangeMasterModal(false);
    setChangePasswordStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsLoading(false);
  };

  // PIN input handlers for modals
  const handleImportPinDigit = (digit: string) => {
    if (importPassword.length < 4) {
      setImportPassword(importPassword + digit);
    }
  };

  const handleImportPinBackspace = () => {
    setImportPassword(importPassword.slice(0, -1));
  };

  const handleCurrentPinDigit = (digit: string) => {
    if (currentPassword.length < 4) {
      const newPin = currentPassword + digit;
      setCurrentPassword(newPin);
    }
  };

  const handleCurrentPinBackspace = () => {
    setCurrentPassword(currentPassword.slice(0, -1));
  };

  const handleNewPinDigit = (digit: string) => {
    if (newPassword.length < 4) {
      const newPin = newPassword + digit;
      setNewPassword(newPin);
    }
  };

  const handleNewPinBackspace = () => {
    setNewPassword(newPassword.slice(0, -1));
  };

  const handleConfirmPinDigit = (digit: string) => {
    if (confirmPassword.length < 4) {
      const newPin = confirmPassword + digit;
      setConfirmPassword(newPin);
    }
  };

  const handleConfirmPinBackspace = () => {
    setConfirmPassword(confirmPassword.slice(0, -1));
  };

  const handleChangeMasterNext = async () => {
    if (changePasswordStep === 1) {
      // Verify current password
      if (!currentPassword.trim()) {
        Alert.alert("Error", "Please enter your current master PIN.");
        return;
      }

      setIsLoading(true);
      try {
        const isValid = await verifyMasterPassword(currentPassword);
        if (isValid) {
          setChangePasswordStep(2);
        } else {
          Alert.alert("Error", "Current PIN is incorrect. Please try again.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to verify current PIN. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else if (changePasswordStep === 2) {
      // Validate new password
      if (!newPassword.trim()) {
        Alert.alert("Error", "Please enter a new master PIN.");
        return;
      }
      if (newPassword.length !== 4) {
        Alert.alert("Error", "PIN must be exactly 4 digits long.");
        return;
      }
      if (!/^\d{4}$/.test(newPassword)) {
        Alert.alert("Error", "PIN must contain only numbers.");
        return;
      }
      if (newPassword === currentPassword) {
        Alert.alert("Error", "New PIN must be different from current PIN.");
        return;
      }
      setChangePasswordStep(3);
    } else if (changePasswordStep === 3) {
      // Confirm password and change
      if (confirmPassword !== newPassword) {
        Alert.alert("Error", "PINs do not match. Please try again.");
        return;
      }
      await changeMasterPasswordAsync(currentPassword, newPassword);
    }
  };

  const changeMasterPasswordAsync = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setIsLoading(true);
      const success = await changeMasterPassword(currentPassword, newPassword);

      if (success) {
        setShowChangeMasterModal(false);
        setChangePasswordStep(1);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Update auth state with new password instead of locking app
        dispatch({
          type: "AUTHENTICATE",
          payload: { isAuthenticated: true, masterPassword: newPassword },
        });

        // Refresh data with new password
        try {
          await Promise.all([
            loadUserData(newPassword),
            authenticate(newPassword),
          ]);
        } catch (error) {
          console.error("Error refreshing data with new password:", error);
        }

        Alert.alert(
          "✅ Success",
          "Master PIN has been changed successfully. You remain logged in with your new PIN.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to change master PIN. Please check your current PIN and try again."
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
        </View>
      </ScrollView>

      <ImportBackupModal
        visible={showPasswordModal}
        onClose={handlePasswordModalCancel}
        onImport={handlePasswordModalSubmit}
        importData={importData}
        isLoading={false}
      />

      <ChangePinModal
        visible={showChangeMasterModal}
        onClose={handleChangeMasterModalCancel}
        onChangePinComplete={async (currentPin, newPin) =>
          await changeMasterPasswordAsync(currentPin, newPin)
        }
        isLoading={isLoading}
      />
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
  },
  footerBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    opacity: 1,
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

  // PIN Input Styles
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  pinCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  pinEmpty: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
  },
  pinFilled: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  pinFilledCorrect: {
    borderColor: Colors.dark.neonGreen,
    backgroundColor: Colors.dark.neonGreen,
    shadowColor: Colors.dark.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  pinFilledError: {
    borderColor: Colors.dark.error,
    backgroundColor: Colors.dark.error,
    shadowColor: Colors.dark.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },

  // Progress Steps
  progressSteps: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  progressStepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  progressStepActive: {
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  progressStepInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textMuted,
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.dark.primary,
  },
  progressLineInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
