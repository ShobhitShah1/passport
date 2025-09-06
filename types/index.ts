// Core types for the password manager application

export interface AuthField {
  id: string;
  label: string;
  value: string;
  type: AuthFieldType;
  isRequired: boolean;
  isEncrypted: boolean;
}

export interface Password {
  id: string;
  appName: string;
  appId: string;
  username?: string;
  email?: string;
  password: string;
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

export interface SecureNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export enum AuthFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  URL = 'url',
  PHONE = 'phone',
  PIN = 'pin',
  SECRET_QUESTION = 'secret_question',
  TWO_FA_CODE = 'two_fa_code',
  API_KEY = 'api_key',
  NOTES = 'notes',
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
  masterPassword?: string;
  passwords: Password[];
  secureNotes: SecureNote[];
  installedApps: InstalledApp[];
  settings: UserSettings;
  searchQuery: string;
  selectedCategory: AppCategory | null;
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'AUTHENTICATE'; payload: { isAuthenticated: boolean; masterPassword?: string } }
  | { type: 'LOCK_APP' }
  | { type: 'RESET_APP' }
  | { type: 'SET_PASSWORDS'; payload: Password[] }
  | { type: 'ADD_PASSWORD'; payload: Password }
  | { type: 'UPDATE_PASSWORD'; payload: Password }
  | { type: 'DELETE_PASSWORD'; payload: string }
  | { type: 'SET_SECURE_NOTES'; payload: SecureNote[] }
  | { type: 'ADD_SECURE_NOTE'; payload: SecureNote }
  | { type: 'UPDATE_SECURE_NOTE'; payload: SecureNote }
  | { type: 'DELETE_SECURE_NOTE'; payload: string }
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