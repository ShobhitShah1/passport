// Core types for the password manager application

export interface Password {
  id: string;
  appName: string;
  appId: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  strength: PasswordStrength;
  isFavorite: boolean;
  tags: string[];
}

export interface InstalledApp {
  id: string;
  name: string;
  packageName: string;
  icon?: string;
  category?: AppCategory;
  isSupported: boolean;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customCharacters?: string;
}

export interface GeneratedPassword {
  password: string;
  strength: PasswordStrength;
  entropy: number;
}

export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  MODERATE = 2,
  STRONG = 3,
  VERY_STRONG = 4,
}

export enum AppCategory {
  SOCIAL = 'social',
  PRODUCTIVITY = 'productivity',
  ENTERTAINMENT = 'entertainment',
  FINANCE = 'finance',
  SHOPPING = 'shopping',
  GAMES = 'games',
  UTILITIES = 'utilities',
  OTHER = 'other',
}

export interface UserSettings {
  autoLockTimeout: number; // minutes
  biometricEnabled: boolean;
  darkModeEnabled: boolean;
  showPasswordPreviews: boolean;
  defaultPasswordLength: number;
  backupEnabled: boolean;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  weakPasswordAlerts: boolean;
  dataBreachAlerts: boolean;
  unusedPasswordAlerts: boolean;
  securityTips: boolean;
}

export interface SecurityAnalysis {
  weakPasswords: Password[];
  reusedPasswords: Password[];
  oldPasswords: Password[];
  breachedPasswords: Password[];
  overallScore: number;
}

export interface AppState {
  isAuthenticated: boolean;
  isLocked: boolean;
  passwords: Password[];
  installedApps: InstalledApp[];
  settings: UserSettings;
  searchQuery: string;
  selectedCategory: AppCategory | null;
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'AUTHENTICATE'; payload: boolean }
  | { type: 'LOCK_APP' }
  | { type: 'SET_PASSWORDS'; payload: Password[] }
  | { type: 'ADD_PASSWORD'; payload: Password }
  | { type: 'UPDATE_PASSWORD'; payload: Password }
  | { type: 'DELETE_PASSWORD'; payload: string }
  | { type: 'SET_INSTALLED_APPS'; payload: InstalledApp[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: AppCategory | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

export interface EncryptionKey {
  key: string;
  salt: string;
  iv: string;
}

export interface StoredData {
  encrypted: string;
  salt: string;
  iv: string;
}