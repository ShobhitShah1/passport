import { useCallback } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { usePasswordStore } from "../stores/passwordStore";
import { useAppContext } from "./use-app-context";
import { Password, SecureNote, PasswordStrength } from "../types";
import { PasswordEntry } from "../stores/passwordStore";

/**
 * Unified hook that combines both the old Context API and new Zustand store
 * for seamless migration and backward compatibility
 */
export const usePasswordManager = () => {
  const {
    // Zustand store
    passwords,
    secureNotes,
    settings,
    isAuthenticated,
    loading,
    error,
    addPassword,
    updatePassword,
    deletePassword,
    copyToClipboard,
    addSecureNote,
    updateSecureNote,
    deleteSecureNote,
    updateSettings,
    searchPasswords,
    getPasswordsByApp,
    calculateSecurityScore,
    authenticate,
    lockApp,
  } = usePasswordStore();

  const {
    // Context API for backward compatibility
    state,
    dispatch,
  } = useAppContext();

  // Enhanced copy function with haptic feedback and user-friendly messages
  const copyWithFeedback = useCallback(
    async (text: string, label: string = "Text") => {
      try {
        await copyToClipboard(text, label);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Alert.alert("Copied!", `${label} copied to clipboard`, [
          { text: "OK" },
        ]);
        return true;
      } catch (error) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Failed to copy to clipboard");
        return false;
      }
    },
    [copyToClipboard]
  );

  // Enhanced password management functions
  const savePasswordEntry = useCallback(
    async (passwordData: {
      appName: string;
      appId?: string;
      username: string;
      email: string;
      password: string;
      url?: string;
      notes?: string;
      customFields?: any[];
      isFavorite?: boolean;
      tags?: string[];
    }) => {
      try {
        await addPassword({
          ...passwordData,
          appId: passwordData.appId || passwordData.appName.toLowerCase(),
          customFields: passwordData.customFields || [],
          isFavorite: passwordData.isFavorite || false,
          tags: passwordData.tags || [],
          strength: calculatePasswordStrength(passwordData.password),
        });

        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        return true;
      } catch (error) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error("Failed to save password:", error);
        return false;
      }
    },
    [addPassword]
  );

  // Password strength calculator
  const calculatePasswordStrength = useCallback((password: string): number => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, []);

  // Enhanced search with multiple criteria
  const searchPasswordsAdvanced = useCallback(
    (
      query: string,
      filters?: {
        includeUsernames?: boolean;
        includeEmails?: boolean;
        includeUrls?: boolean;
        includeNotes?: boolean;
        includeTags?: boolean;
      }
    ) => {
      if (!query.trim()) return passwords;

      const {
        includeUsernames = true,
        includeEmails = true,
        includeUrls = true,
        includeNotes = true,
        includeTags = true,
      } = filters || {};

      const lowercaseQuery = query.toLowerCase();

      return passwords.filter((password) => {
        const matches = [
          password.appName.toLowerCase().includes(lowercaseQuery),
          includeUsernames &&
            password.username?.toLowerCase().includes(lowercaseQuery),
          includeEmails &&
            password.email?.toLowerCase().includes(lowercaseQuery),
          includeUrls && password.url?.toLowerCase().includes(lowercaseQuery),
          includeNotes &&
            password.notes?.toLowerCase().includes(lowercaseQuery),
          includeTags &&
            password.tags.some((tag) =>
              tag.toLowerCase().includes(lowercaseQuery)
            ),
        ];

        return matches.some((match) => match);
      });
    },
    [passwords]
  );

  // Get recent passwords (last used)
  const getRecentPasswords = useCallback(
    (limit: number = 6) => {
      return passwords
        .sort(
          (a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
        )
        .slice(0, limit);
    },
    [passwords]
  );

  // Get favorite passwords
  const getFavoritePasswords = useCallback(() => {
    return passwords.filter((password) => password.isFavorite);
  }, [passwords]);

  // Get weak passwords
  const getWeakPasswords = useCallback(() => {
    return passwords.filter((password) => password.strength <= 2);
  }, [passwords]);

  // Update password with usage tracking
  const updatePasswordWithUsage = useCallback(
    async (id: string, updates: Partial<PasswordEntry>) => {
      try {
        await updatePassword(id, {
          ...updates,
          lastUsed: new Date(),
        });
        return true;
      } catch (error) {
        console.error("Failed to update password:", error);
        return false;
      }
    },
    [updatePassword]
  );

  // Quick copy functions for common fields
  const copyUsername = useCallback(
    async (password: PasswordEntry) => {
      if (password.username && password.username.trim()) {
        await updatePasswordWithUsage(password.id, {});
        return copyWithFeedback(password.username, "Username");
      }
      return false;
    },
    [copyWithFeedback, updatePasswordWithUsage]
  );

  const copyEmail = useCallback(
    async (password: PasswordEntry) => {
      if (password.email && password.email.trim()) {
        await updatePasswordWithUsage(password.id, {});
        return copyWithFeedback(password.email, "Email");
      }
      return false;
    },
    [copyWithFeedback, updatePasswordWithUsage]
  );

  const copyPasswordField = useCallback(
    async (password: PasswordEntry) => {
      if (password.password) {
        await updatePasswordWithUsage(password.id, {});
        return copyWithFeedback(password.password, "Password");
      }
      return false;
    },
    [copyWithFeedback, updatePasswordWithUsage]
  );

  const copyUrl = useCallback(
    async (password: PasswordEntry) => {
      if (password.url) {
        await updatePasswordWithUsage(password.id, {});
        return copyWithFeedback(password.url, "URL");
      }
      return false;
    },
    [copyWithFeedback, updatePasswordWithUsage]
  );

  // Export consolidated data for backward compatibility
  return {
    // State
    passwords,
    secureNotes,
    settings,
    isAuthenticated,
    loading,
    error,

    // Legacy state for backward compatibility
    state,
    dispatch,

    // Authentication
    authenticate,
    lockApp,

    // Password management
    addPassword,
    updatePassword,
    deletePassword,
    savePasswordEntry,
    updatePasswordWithUsage,

    // Secure notes management
    addSecureNote,
    updateSecureNote,
    deleteSecureNote,

    // Settings management
    updateSettings,

    // Copy functions
    copyToClipboard,
    copyWithFeedback,
    copyUsername,
    copyEmail,
    copyPasswordField,
    copyUrl,

    // Search and filtering
    searchPasswords,
    searchPasswordsAdvanced,
    getPasswordsByApp,
    getRecentPasswords,
    getFavoritePasswords,
    getWeakPasswords,

    // Utility functions
    calculateSecurityScore,
    calculatePasswordStrength,
  };
};
