import * as SecureStore from 'expo-secure-store';
import { Password, SecureNote, UserSettings, StoredData } from '../../types';
import { encrypt, decrypt, createEncryptionKey, hashPassword, verifyPassword, generateSalt } from '../encryption/crypto';

// Storage keys
const STORAGE_KEYS = {
  MASTER_PASSWORD_HASH: 'master_password_hash',
  MASTER_PASSWORD_SALT: 'master_password_salt',
  PASSWORDS: 'encrypted_passwords',
  SECURE_NOTES: 'encrypted_secure_notes',
  SETTINGS: 'user_settings',
  ENCRYPTION_SALT: 'encryption_salt',
  ENCRYPTION_IV: 'encryption_iv',
  SESSION_TOKEN: 'session_token',
  SESSION_EXPIRY: 'session_expiry',
} as const;

/**
 * Initialize the secure storage system
 */
export async function initializeStorage(): Promise<boolean> {
  try {
    // Check if master password is already set
    const hashedPassword = await SecureStore.getItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH);
    const salt = await SecureStore.getItemAsync(STORAGE_KEYS.MASTER_PASSWORD_SALT);

    if (!hashedPassword) {
      return false;
    }

    // Validate stored data integrity
    if (!salt || typeof hashedPassword !== 'string' || typeof salt !== 'string') {
      console.error('Corrupted master password data detected, clearing storage');
      await clearAllStorageData();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

/**
 * Clear all storage data (for corruption recovery)
 */
async function clearAllStorageData(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key).catch(() => {})));
    console.log('All storage data cleared due to corruption');
  } catch (error) {
    console.error('Error clearing storage data:', error);
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
      console.log('Master password hash or salt not found');
      return false;
    }

    // Validate the stored hash and salt format
    if (typeof hashedPassword !== 'string' || typeof salt !== 'string') {
      console.error('Invalid master password hash or salt format');
      return false;
    }

    // Check for corrupted hash/salt data
    if (hashedPassword.length < 32 || salt.length < 16) {
      console.error('Corrupted master password hash or salt detected');
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
    const encryptedNotes = await SecureStore.getItemAsync(STORAGE_KEYS.SECURE_NOTES);
    let passwords: Password[] = [];
    let secureNotes: SecureNote[] = [];
    
    if (encryptedPasswords) {
      // Decrypt with current password
      const storedData: StoredData = JSON.parse(encryptedPasswords);
      const decryptedData = await decrypt(storedData, currentPassword);
      passwords = JSON.parse(decryptedData);
    }
    
    if (encryptedNotes) {
      // Decrypt with current password
      const storedData: StoredData = JSON.parse(encryptedNotes);
      const decryptedData = await decrypt(storedData, currentPassword);
      secureNotes = JSON.parse(decryptedData);
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
    
    if (secureNotes.length > 0) {
      const encryptionKey = await createEncryptionKey(newPassword);
      const newEncryptedData = await encrypt(JSON.stringify(secureNotes), encryptionKey);
      await SecureStore.setItemAsync(STORAGE_KEYS.SECURE_NOTES, JSON.stringify(newEncryptedData));
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

    // Validate the stored data before parsing
    if (!encryptedPasswords.startsWith('{') && !encryptedPasswords.startsWith('[')) {
      console.error('Invalid password data format, clearing corrupted data');
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORDS);
      return [];
    }

    const storedData: StoredData = JSON.parse(encryptedPasswords);

    // Debug logging
    console.log('Loaded password data structure:', {
      hasEncrypted: !!storedData.encrypted,
      hasIV: !!storedData.iv,
      hasSalt: !!storedData.salt,
      encryptedLength: storedData.encrypted?.length || 0
    });

    // Validate required properties
    if (!storedData.encrypted || !storedData.iv || !storedData.salt) {
      console.error('Invalid stored data structure, clearing corrupted data');
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORDS);
      return [];
    }

    const decryptedData = await decrypt(storedData, masterPassword);

    // Validate decrypted data before parsing
    if (!decryptedData || (!decryptedData.startsWith('[') && !decryptedData.startsWith('{'))) {
      console.error('Invalid decrypted password data format');
      return [];
    }

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error loading passwords:', error);
    // Clear corrupted data on JSON parse error
    if (error instanceof SyntaxError && error.message.includes('JSON Parse error')) {
      console.log('Clearing corrupted password data');
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORDS);
      } catch (clearError) {
        console.error('Error clearing corrupted password data:', clearError);
      }
    }
    return [];
  }
}

/**
 * Save secure notes to secure storage
 */
export async function saveSecureNotes(
  secureNotes: SecureNote[],
  masterPassword: string
): Promise<boolean> {
  try {
    const encryptionKey = await createEncryptionKey(masterPassword);
    const encryptedData = await encrypt(JSON.stringify(secureNotes), encryptionKey);
    
    await SecureStore.setItemAsync(STORAGE_KEYS.SECURE_NOTES, JSON.stringify(encryptedData));
    return true;
  } catch (error) {
    console.error('Error saving secure notes:', error);
    return false;
  }
}

/**
 * Load secure notes from secure storage
 */
export async function loadSecureNotes(masterPassword: string): Promise<SecureNote[]> {
  try {
    const encryptedNotes = await SecureStore.getItemAsync(STORAGE_KEYS.SECURE_NOTES);

    if (!encryptedNotes) {
      return [];
    }

    // Validate the stored data before parsing
    if (!encryptedNotes.startsWith('{') && !encryptedNotes.startsWith('[')) {
      console.error('Invalid secure notes data format, clearing corrupted data');
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SECURE_NOTES);
      return [];
    }

    const storedData: StoredData = JSON.parse(encryptedNotes);

    // Debug logging
    console.log('Loaded notes data structure:', {
      hasEncrypted: !!storedData.encrypted,
      hasIV: !!storedData.iv,
      hasSalt: !!storedData.salt,
      encryptedLength: storedData.encrypted?.length || 0
    });

    // Validate required properties
    if (!storedData.encrypted || !storedData.iv || !storedData.salt) {
      console.error('Invalid stored notes data structure, clearing corrupted data');
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SECURE_NOTES);
      return [];
    }

    const decryptedData = await decrypt(storedData, masterPassword);

    // Validate decrypted data before parsing
    if (!decryptedData || (!decryptedData.startsWith('[') && !decryptedData.startsWith('{'))) {
      console.error('Invalid decrypted secure notes data format');
      return [];
    }

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error loading secure notes:', error);
    // Clear corrupted data on JSON parse error
    if (error instanceof SyntaxError && error.message.includes('JSON Parse error')) {
      console.log('Clearing corrupted secure notes data');
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.SECURE_NOTES);
      } catch (clearError) {
        console.error('Error clearing corrupted secure notes data:', clearError);
      }
    }
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
    // Clear all stored data including session tokens
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.MASTER_PASSWORD_HASH),
      SecureStore.deleteItemAsync(STORAGE_KEYS.MASTER_PASSWORD_SALT),
      SecureStore.deleteItemAsync(STORAGE_KEYS.PASSWORDS),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SECURE_NOTES),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SETTINGS),
      SecureStore.deleteItemAsync(STORAGE_KEYS.ENCRYPTION_SALT),
      SecureStore.deleteItemAsync(STORAGE_KEYS.ENCRYPTION_IV),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_EXPIRY),
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
    const encryptedNotes = await SecureStore.getItemAsync(STORAGE_KEYS.SECURE_NOTES);
    const settings = await SecureStore.getItemAsync(STORAGE_KEYS.SETTINGS);
    
    const exportData = {
      passwords: encryptedPasswords ? JSON.parse(encryptedPasswords) : null,
      secureNotes: encryptedNotes ? JSON.parse(encryptedNotes) : null,
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
    
    if (importData.secureNotes) {
      await decrypt(importData.secureNotes, masterPassword);
    }
    
    // Import passwords
    if (importData.passwords) {
      await SecureStore.setItemAsync(STORAGE_KEYS.PASSWORDS, JSON.stringify(importData.passwords));
    }
    
    // Import secure notes
    if (importData.secureNotes) {
      await SecureStore.setItemAsync(STORAGE_KEYS.SECURE_NOTES, JSON.stringify(importData.secureNotes));
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

/**
 * Create a session token for auto-authentication
 */
export async function createSessionToken(masterPassword: string): Promise<boolean> {
  try {
    const settings = await loadSettings();
    const autoLockTimeout = settings?.autoLockTimeout || 5; // minutes
    
    // Only create session if auto-lock timeout is greater than 0
    if (autoLockTimeout <= 0) {
      return false;
    }
    
    // Simple approach: just store session validity flag
    const expiryTime = Date.now() + (autoLockTimeout * 60 * 1000);
    
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.SESSION_TOKEN, 'valid'),
      SecureStore.setItemAsync(STORAGE_KEYS.SESSION_EXPIRY, expiryTime.toString()),
    ]);
    
    return true;
  } catch (error) {
    console.error('Error creating session token:', error);
    return false;
  }
}

/**
 * Check if there's a valid session token
 */
export async function hasValidSession(): Promise<boolean> {
  try {
    const [sessionToken, expiryTimeStr] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.SESSION_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.SESSION_EXPIRY),
    ]);
    
    if (!sessionToken || !expiryTimeStr) {
      return false;
    }
    
    const expiryTime = parseInt(expiryTimeStr);
    const currentTime = Date.now();
    
    if (currentTime > expiryTime) {
      // Session expired, clean up
      await clearSession();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}

/**
 * Clear session token
 */
export async function clearSession(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_EXPIRY),
    ]);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Extend current session
 */
export async function extendSession(): Promise<boolean> {
  try {
    const settings = await loadSettings();
    const autoLockTimeout = settings?.autoLockTimeout || 5;
    
    if (autoLockTimeout <= 0) {
      return false;
    }
    
    const hasSession = await hasValidSession();
    if (!hasSession) {
      return false;
    }
    
    const newExpiryTime = Date.now() + (autoLockTimeout * 60 * 1000);
    await SecureStore.setItemAsync(STORAGE_KEYS.SESSION_EXPIRY, newExpiryTime.toString());
    
    return true;
  } catch (error) {
    console.error('Error extending session:', error);
    return false;
  }
}