import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Password, SecureNote, UserSettings, AuthField, PasswordStrength } from '../types';
import {
  savePasswords,
  loadPasswords,
  saveSecureNotes,
  loadSecureNotes,
  saveSettings,
  loadSettings,
  verifyMasterPassword
} from '../services/storage/secureStorage';
import WidgetUpdateService from '../services/widget/WidgetUpdateService';

// Initialize MMKV
const storage = new MMKV();

// Custom MMKV storage adapter for Zustand
const mmkvStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

export interface PasswordEntry {
  id: string;
  appName: string;
  appId?: string;
  username?: string;  // Now optional - user choice
  email?: string;     // Now optional - user choice
  password: string;   // Only password is required
  url?: string;
  notes?: string;
  customFields: AuthField[];
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  strength: PasswordStrength;
  isFavorite: boolean;
  tags: string[];
}

interface PasswordStore {
  // Authentication state
  isAuthenticated: boolean;
  masterPassword: string | null;
  
  // Data
  passwords: PasswordEntry[];
  secureNotes: SecureNote[];
  settings: UserSettings;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  authenticate: (masterPassword: string) => Promise<boolean>;
  lockApp: () => void;
  
  // Password management
  addPassword: (passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePassword: (id: string, updates: Partial<PasswordEntry>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  copyToClipboard: (text: string, label?: string) => Promise<void>;
  
  // Secure notes management
  addSecureNote: (noteData: Omit<SecureNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSecureNote: (id: string, updates: Partial<SecureNote>) => Promise<void>;
  deleteSecureNote: (id: string) => Promise<void>;
  
  // Settings management
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  
  // Utility functions
  searchPasswords: (query: string) => PasswordEntry[];
  getPasswordsByApp: (appName: string) => PasswordEntry[];
  calculateSecurityScore: () => { score: number; weakPasswords: number; totalPasswords: number };
  
  // Internal state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

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

export const usePasswordStore = create<PasswordStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      masterPassword: null,
      passwords: [],
      secureNotes: [],
      settings: defaultSettings,
      loading: false,
      error: null,

      // Authentication
      authenticate: async (masterPassword: string): Promise<boolean> => {
        set({ loading: true, error: null });
        
        try {
          const isValid = await verifyMasterPassword(masterPassword);
          
          if (!isValid) {
            set({ error: 'Invalid master password', loading: false });
            return false;
          }

          // Load user data
          const [passwords, secureNotes, settings] = await Promise.all([
            loadPasswords(masterPassword),
            loadSecureNotes(masterPassword),
            loadSettings(),
          ]);

          const passwordEntries: PasswordEntry[] = passwords.map(p => ({
            ...p,
            email: (p as any).email || '', // Add email field if missing, keep original if exists
            // username is already in the original object, keep as-is (could be undefined)
          }));

          set({
            isAuthenticated: true,
            masterPassword,
            passwords: passwordEntries,
            secureNotes,
            settings: settings || defaultSettings,
            loading: false,
            error: null,
          });

          // Update widgets with loaded notes
          WidgetUpdateService.updateWidgets(secureNotes);

          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Authentication failed', 
            loading: false 
          });
          return false;
        }
      },

      lockApp: () => {
        set({
          isAuthenticated: false,
          masterPassword: null,
          passwords: [],
          secureNotes: [],
          error: null,
        });
      },

      // Password management
      addPassword: async (passwordData) => {
        const state = get();
        if (!state.isAuthenticated || !state.masterPassword) {
          throw new Error('Not authenticated');
        }

        const newPassword: PasswordEntry = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...passwordData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedPasswords = [...state.passwords, newPassword];
        
        // Convert to legacy Password format for storage
        const legacyPasswords: Password[] = updatedPasswords.map(p => ({
          ...p,
          appId: p.appId || p.appName.toLowerCase(),
          username: p.username || p.email || 'user', // Provide fallback for legacy compatibility
        }));

        await savePasswords(legacyPasswords, state.masterPassword);
        
        set({ passwords: updatedPasswords });
      },

      updatePassword: async (id, updates) => {
        const state = get();
        if (!state.isAuthenticated || !state.masterPassword) {
          throw new Error('Not authenticated');
        }

        const updatedPasswords = state.passwords.map(p => 
          p.id === id 
            ? { ...p, ...updates, updatedAt: new Date(), lastUsed: new Date() }
            : p
        );

        // Convert to legacy Password format for storage
        const legacyPasswords: Password[] = updatedPasswords.map(p => ({
          ...p,
          appId: p.appId || p.appName.toLowerCase(),
          username: p.username || p.email || 'user',
        }));

        await savePasswords(legacyPasswords, state.masterPassword);
        
        set({ passwords: updatedPasswords });
      },

      deletePassword: async (id) => {
        const state = get();
        if (!state.isAuthenticated || !state.masterPassword) {
          throw new Error('Not authenticated');
        }

        const updatedPasswords = state.passwords.filter(p => p.id !== id);
        
        // Convert to legacy Password format for storage
        const legacyPasswords: Password[] = updatedPasswords.map(p => ({
          ...p,
          appId: p.appId || p.appName.toLowerCase(),
          username: p.username || p.email || 'user',
        }));

        await savePasswords(legacyPasswords, state.masterPassword);
        
        set({ passwords: updatedPasswords });
      },

      copyToClipboard: async (text: string, label?: string): Promise<void> => {
        try {
          await Clipboard.setStringAsync(text);
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
          throw error;
        }
      },

      // Secure notes management
      addSecureNote: async (noteData) => {
        const state = get();
        if (!state.isAuthenticated || !state.masterPassword) {
          throw new Error('Not authenticated');
        }

        const newNote: SecureNote = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...noteData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedNotes = [...state.secureNotes, newNote];
        await saveSecureNotes(updatedNotes, state.masterPassword);

        set({ secureNotes: updatedNotes });

        // Update widgets with new notes
        WidgetUpdateService.onNoteAdded(updatedNotes);
      },

      updateSecureNote: async (id, updates) => {
        const state = get();
        if (!state.isAuthenticated || !state.masterPassword) {
          throw new Error('Not authenticated');
        }

        const updatedNotes = state.secureNotes.map(n =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date() }
            : n
        );

        await saveSecureNotes(updatedNotes, state.masterPassword);

        set({ secureNotes: updatedNotes });

        // Update widgets with updated notes
        WidgetUpdateService.onNoteUpdated(updatedNotes);
      },

      deleteSecureNote: async (id) => {
        const state = get();
        if (!state.isAuthenticated || !state.masterPassword) {
          throw new Error('Not authenticated');
        }

        const updatedNotes = state.secureNotes.filter(n => n.id !== id);
        await saveSecureNotes(updatedNotes, state.masterPassword);

        set({ secureNotes: updatedNotes });

        // Update widgets with remaining notes
        WidgetUpdateService.onNoteDeleted(updatedNotes);
      },

      // Settings management
      updateSettings: async (updates) => {
        const state = get();
        const updatedSettings = { ...state.settings, ...updates };
        
        await saveSettings(updatedSettings);
        set({ settings: updatedSettings });
      },

      // Utility functions
      searchPasswords: (query: string): PasswordEntry[] => {
        const state = get();
        if (!query.trim()) return state.passwords;

        const lowercaseQuery = query.toLowerCase();
        return state.passwords.filter(password => 
          password.appName.toLowerCase().includes(lowercaseQuery) ||
          password.username?.toLowerCase().includes(lowercaseQuery) ||
          password.email?.toLowerCase().includes(lowercaseQuery) ||
          password.url?.toLowerCase().includes(lowercaseQuery) ||
          password.notes?.toLowerCase().includes(lowercaseQuery) ||
          password.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      getPasswordsByApp: (appName: string): PasswordEntry[] => {
        const state = get();
        return state.passwords.filter(password => 
          password.appName.toLowerCase() === appName.toLowerCase()
        );
      },

      calculateSecurityScore: () => {
        const state = get();
        const { passwords } = state;
        
        if (passwords.length === 0) {
          return { score: 100, weakPasswords: 0, totalPasswords: 0 };
        }

        const scores = passwords.map(p => (p.strength / 4) * 100);
        const scoreSum = scores.reduce((sum, score) => sum + score, 0);
        const weakCount = passwords.filter(p => p.strength <= PasswordStrength.WEAK).length;

        return {
          score: Math.round(scoreSum / passwords.length),
          weakPasswords: weakCount,
          totalPasswords: passwords.length,
        };
      },

      // Internal state management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'passport-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);