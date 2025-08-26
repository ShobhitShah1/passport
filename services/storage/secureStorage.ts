import * as SecureStore from 'expo-secure-store';
import { Password, UserSettings, StoredData } from '../../types';
import { encrypt, decrypt, createEncryptionKey, hashPassword, verifyPassword, generateSalt } from '../encryption/crypto';

// Storage keys
const STORAGE_KEYS = {
  MASTER_PASSWORD_HASH: 'master_password_hash',
  MASTER_PASSWORD_SALT: 'master_password_salt',
  PASSWORDS: 'encrypted_passwords',
  SETTINGS: 'user_settings',
  ENCRYPTION_SALT: 'encryption_salt',
  ENCRYPTION_IV: 'encryption_iv',
} as const;

/**
 * Initialize the secure storage system
 */
export async function initializeStorage(): Promise<boolean> {
  try {
    // Check if master password is already set
    const hashedPassword = await SecureStore.getItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH);
    return hashedPassword !== null;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

/**
 * Set up the master password for the first time
 */
export async function setupMasterPassword(masterPassword: string): Promise<boolean> {
  try {
    // Check if master password is already set
    const existingHash = await SecureStore.getItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH);
    if (existingHash) {
      throw new Error('Master password already set');
    }

    // Generate salt for password hashing
    const salt = await generateSalt();
    
    // Hash the master password
    const hashedPassword = await hashPassword(masterPassword, salt);
    
    // Store the hash and salt
    await SecureStore.setItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH, hashedPassword);
    await SecureStore.setItemAsync(STORAGE_KEYS.MASTER_PASSWORD_SALT, salt);
    
    // Initialize default settings
    const defaultSettings: UserSettings = {
      autoLockTimeout: 5,
      biometricEnabled: false,
      darkModeEnabled: true,
      showPasswordPreviews: false,
      defaultPasswordLength: 16,
      backupEnabled: false,
      notifications: {
        weakPasswordAlerts: true,
        dataBreachAlerts: true,
        unusedPasswordAlerts: true,
        securityTips: true,
      },
    };
    
    await saveSettings(defaultSettings);
    
    return true;
  } catch (error) {
    console.error('Error setting up master password:', error);
    return false;
  }
}

/**
 * Verify the master password
 */
export async function verifyMasterPassword(masterPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await SecureStore.getItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH);
    const salt = await SecureStore.getItemAsync(STORAGE_KEYS.MASTER_PASSWORD_SALT);
    
    if (!hashedPassword || !salt) {
      return false;
    }
    
    return await verifyPassword(masterPassword, hashedPassword, salt);
  } catch (error) {
    console.error('Error verifying master password:', error);
    return false;
  }
}

/**
 * Change the master password
 */
export async function changeMasterPassword(
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    // Verify current password
    const isCurrentPasswordValid = await verifyMasterPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Get all encrypted data
    const encryptedPasswords = await SecureStore.getItemAsync(STORAGE_KEYS.PASSWORDS);
    let passwords: Password[] = [];
    
    if (encryptedPasswords) {
      // Decrypt with current password
      const storedData: StoredData = JSON.parse(encryptedPasswords);
      const decryptedData = await decrypt(storedData, currentPassword);
      passwords = JSON.parse(decryptedData);
    }
    
    // Generate new salt and hash for new password
    const newSalt = await generateSalt();
    const newHashedPassword = await hashPassword(newPassword, newSalt);
    
    // Re-encrypt all data with new password
    if (passwords.length > 0) {
      const encryptionKey = await createEncryptionKey(newPassword);
      const newEncryptedData = await encrypt(JSON.stringify(passwords), encryptionKey);
      await SecureStore.setItemAsync(STORAGE_KEYS.PASSWORDS, JSON.stringify(newEncryptedData));
    }
    
    // Update stored password hash and salt
    await SecureStore.setItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH, newHashedPassword);
    await SecureStore.setItemAsync(STORAGE_KEYS.MASTER_PASSWORD_SALT, newSalt);
    
    return true;
  } catch (error) {
    console.error('Error changing master password:', error);
    return false;
  }
}

/**
 * Save passwords to secure storage
 */
export async function savePasswords(
  passwords: Password[],
  masterPassword: string
): Promise<boolean> {
  try {
    const encryptionKey = await createEncryptionKey(masterPassword);
    const encryptedData = await encrypt(JSON.stringify(passwords), encryptionKey);
    
    await SecureStore.setItemAsync(STORAGE_KEYS.PASSWORDS, JSON.stringify(encryptedData));
    return true;
  } catch (error) {
    console.error('Error saving passwords:', error);
    return false;
  }
}

/**
 * Load passwords from secure storage
 */
export async function loadPasswords(masterPassword: string): Promise<Password[]> {
  try {
    const encryptedPasswords = await SecureStore.getItemAsync(STORAGE_KEYS.PASSWORDS);
    
    if (!encryptedPasswords) {
      return [];
    }
    
    const storedData: StoredData = JSON.parse(encryptedPasswords);
    const decryptedData = await decrypt(storedData, masterPassword);
    
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error loading passwords:', error);
    return [];
  }
}

/**
 * Save user settings
 */
export async function saveSettings(settings: UserSettings): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Load user settings
 */
export async function loadSettings(): Promise<UserSettings | null> {
  try {
    const settingsData = await SecureStore.getItemAsync(STORAGE_KEYS.SETTINGS);
    
    if (!settingsData) {
      return null;
    }
    
    return JSON.parse(settingsData);
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}

/**
 * Clear all stored data (for logout or data reset)
 */
export async function clearAllData(): Promise<boolean> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH),
      SecureStore.deleteItemAsync(STORAGE_KEYS.MASTER_PASSWORD_SALT),
      SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORDS),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SETTINGS),
      SecureStore.deleteItemAsync(STORAGE_KEYS.ENCRYPTION_SALT),
      SecureStore.deleteItemAsync(STORAGE_KEYS.ENCRYPTION_IV),
    ]);
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

/**
 * Check if the app has been set up (master password exists)
 */
export async function isAppSetup(): Promise<boolean> {
  try {
    const hashedPassword = await SecureStore.getItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH);
    return hashedPassword !== null;
  } catch (error) {
    console.error('Error checking app setup:', error);
    return false;
  }
}

/**
 * Export encrypted data for backup (without decryption)
 */
export async function exportEncryptedData(): Promise<string | null> {
  try {
    const encryptedPasswords = await SecureStore.getItemAsync(STORAGE_KEYS.PASSWORDS);
    const settings = await SecureStore.getItemAsync(STORAGE_KEYS.SETTINGS);
    
    const exportData = {
      passwords: encryptedPasswords ? JSON.parse(encryptedPasswords) : null,
      settings: settings ? JSON.parse(settings) : null,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    
    return JSON.stringify(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
}

/**
 * Import encrypted data from backup
 */
export async function importEncryptedData(
  encryptedData: string,
  masterPassword: string
): Promise<boolean> {
  try {
    const importData = JSON.parse(encryptedData);
    
    // Verify data can be decrypted with the provided master password
    if (importData.passwords) {
      await decrypt(importData.passwords, masterPassword);
    }
    
    // Import passwords
    if (importData.passwords) {
      await SecureStore.setItemAsync(STORAGE_KEYS.PASSWORDS, JSON.stringify(importData.passwords));
    }
    
    // Import settings
    if (importData.settings) {
      await SecureStore.setItemAsync(STORAGE_KEYS.SETTINGS, JSON.stringify(importData.settings));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}