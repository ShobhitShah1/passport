import { router } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import SessionExpiredModal from "../components/SessionExpiredModal";
import {
  clearSession,
  createSessionToken,
  extendSession,
  hasValidSession,
  isAppSetup,
  loadPasswords,
  loadSecureNotes,
  loadSettings,
  savePasswords,
  saveSecureNotes,
  saveSettings,
  verifyMasterPassword,
} from "../services/storage/secureStorage";
import WidgetUpdateService from "../services/widget/WidgetUpdateService";
import { AppAction, AppState, UserSettings } from "../types";
import { syncAuthentication } from "../utils/authSync";

const initialState: AppState = {
  isAuthenticated: false,
  isLocked: true,
  masterPassword: undefined,
  passwords: [],
  secureNotes: [],
  installedApps: [],
  settings: {
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
  },
  searchQuery: "",
  selectedCategory: null,
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "AUTHENTICATE":
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        isLocked: !action.payload.isAuthenticated,
        masterPassword: action.payload.masterPassword,
        error: null,
      };

    case "LOCK_APP":
      return {
        ...state,
        isAuthenticated: false,
        isLocked: true,
        masterPassword: undefined,
        passwords: [], // Clear sensitive data when locked
        secureNotes: [], // Clear sensitive data when locked
      };

    case "RESET_APP":
      return {
        ...initialState, // Reset to initial state completely
      };

    case "SET_PASSWORDS":
      return {
        ...state,
        passwords: action.payload,
      };

    case "ADD_PASSWORD":
      return {
        ...state,
        passwords: [...state.passwords, action.payload],
      };

    case "UPDATE_PASSWORD":
      return {
        ...state,
        passwords: state.passwords.map((password) =>
          password.id === action.payload.id ? action.payload : password
        ),
      };

    case "DELETE_PASSWORD":
      return {
        ...state,
        passwords: state.passwords.filter(
          (password) => password.id !== action.payload
        ),
      };

    case "SET_SECURE_NOTES":
      return {
        ...state,
        secureNotes: action.payload,
      };

    case "ADD_SECURE_NOTE":
      const newNotesAfterAdd = [...state.secureNotes, action.payload];
      // Trigger widget update
      WidgetUpdateService.onNoteAdded(newNotesAfterAdd);
      return {
        ...state,
        secureNotes: newNotesAfterAdd,
      };

    case "UPDATE_SECURE_NOTE":
      const newNotesAfterUpdate = state.secureNotes.map((note) =>
        note.id === action.payload.id ? action.payload : note
      );
      // Trigger widget update
      WidgetUpdateService.onNoteUpdated(newNotesAfterUpdate);
      return {
        ...state,
        secureNotes: newNotesAfterUpdate,
      };

    case "DELETE_SECURE_NOTE":
      const newNotesAfterDelete = state.secureNotes.filter(
        (note) => note.id !== action.payload
      );
      // Trigger widget update
      WidgetUpdateService.onNoteDeleted(newNotesAfterDelete);
      return {
        ...state,
        secureNotes: newNotesAfterDelete,
      };

    case "SET_INSTALLED_APPS":
      return {
        ...state,
        installedApps: action.payload,
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      };

    case "SET_SELECTED_CATEGORY":
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  authenticate: (masterPassword: string) => Promise<boolean>;
  lockApp: () => void;
  loadUserData: (masterPassword: string) => Promise<void>;
  isSetupComplete: () => Promise<boolean>;
  tryAutoAuthenticate: () => Promise<boolean>;
  // Data persistence functions
  saveData: () => Promise<void>;
  addPassword: (password: any) => Promise<void>;
  updatePassword: (password: any) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  addSecureNote: (note: any) => Promise<void>;
  updateSecureNote: (note: any) => Promise<void>;
  deleteSecureNote: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  lockCountdown: number | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  useEffect(() => {
    if (!state.isAuthenticated || state.settings.autoLockTimeout === 0) {
      setLockCountdown(null);
      return;
    }

    let remainingTime = state.settings.autoLockTimeout * 60;
    setLockCountdown(remainingTime);

    const intervalId = setInterval(() => {
      remainingTime -= 1;
      setLockCountdown(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(intervalId);
        setShowSessionExpiredModal(true);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, state.settings.autoLockTimeout]);

  // Auto-detection for auth state - only log, don't navigate
  // Let the splash screen handle all initial navigation
  useEffect(() => {
    if (!state.isAuthenticated && !state.loading) {
      console.log('🔒 Auth state lost - user needs to re-authenticate');
      // Don't navigate here - let session expiry modal handle this
    }
  }, [state.isAuthenticated, state.loading]);

  const authenticate = async (masterPassword: string): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // First, verify the master password against stored hash
      const isPasswordValid = await verifyMasterPassword(masterPassword);
      if (!isPasswordValid) {
        console.log("Master password verification failed");
        dispatch({ type: "SET_ERROR", payload: "Invalid PIN or password" });
        return false;
      }

      // Load user data with the verified password
      await loadUserData(masterPassword);

      dispatch({
        type: "AUTHENTICATE",
        payload: { isAuthenticated: true, masterPassword },
      });

      // Sync authentication with passwordStore using utility
      try {
        await syncAuthentication(true, masterPassword);
      } catch (error) {
        console.warn("Failed to sync passwordStore authentication:", error);
      }

      // Create session token for persistent authentication
      try {
        await createSessionToken(masterPassword);
      } catch (error) {
        console.warn("Failed to create session token:", error);
      }

      return true;
    } catch (error) {
      console.error("Authentication error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to authenticate" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const lockApp = () => {
    dispatch({ type: "LOCK_APP" });
    // Clear session token when manually locking
    clearSession().catch(error => 
      console.warn("Failed to clear session:", error)
    );
  };

  const loadUserData = async (masterPassword: string) => {
    try {
      // Load passwords
      const passwords = await loadPasswords(masterPassword);
      dispatch({ type: "SET_PASSWORDS", payload: passwords });

      // Load secure notes
      const secureNotes = await loadSecureNotes(masterPassword);
      dispatch({ type: "SET_SECURE_NOTES", payload: secureNotes });

      // Load settings
      const settings = await loadSettings();
      if (settings) {
        dispatch({ type: "UPDATE_SETTINGS", payload: settings });
      }
    } catch (error) {
      throw new Error("Failed to load user data");
    }
  };

  const isSetupComplete = async (): Promise<boolean> => {
    return await isAppSetup();
  };

  const tryAutoAuthenticate = async (): Promise<boolean> => {
    try {
      // Check if there's a valid session token
      const hasSession = await hasValidSession();
      if (!hasSession) {
        return false;
      }

      // Session exists and is valid - try to restore auth state
      // Load settings to check biometric preference
      const settings = await loadSettings();
      if (settings?.biometricEnabled) {
        // With biometric enabled, let the auth screen handle the auto-trigger
        // but indicate that a valid session exists
        return true;
      }

      // Without biometric, user still needs to enter PIN
      return false;
    } catch (error) {
      console.error("Auto-authentication error:", error);
      return false;
    }
  };

  // Data persistence functions
  const saveData = async () => {
    if (!state.isAuthenticated || !state.masterPassword) {
      throw new Error("Not authenticated - please log in again");
    }

    try {
      await Promise.all([
        savePasswords(state.passwords, state.masterPassword),
        saveSecureNotes(state.secureNotes, state.masterPassword),
        saveSettings(state.settings),
      ]);
    } catch (error) {
      console.error("Failed to save data:", error);
      throw error;
    }
  };

  const addPassword = async (password: any) => {
    dispatch({ type: "ADD_PASSWORD", payload: password });
    if (state.masterPassword) {
      const newPasswords = [...state.passwords, password];
      await savePasswords(newPasswords, state.masterPassword);
    }
  };

  const updatePassword = async (password: any) => {
    dispatch({ type: "UPDATE_PASSWORD", payload: password });
    if (state.masterPassword) {
      const updatedPasswords = state.passwords.map((p) =>
        p.id === password.id ? password : p
      );
      await savePasswords(updatedPasswords, state.masterPassword);
    }
  };

  const deletePassword = async (id: string) => {
    dispatch({ type: "DELETE_PASSWORD", payload: id });
    if (state.masterPassword) {
      const filteredPasswords = state.passwords.filter((p) => p.id !== id);
      await savePasswords(filteredPasswords, state.masterPassword);
    }
  };

  const addSecureNote = async (note: any) => {
    dispatch({ type: "ADD_SECURE_NOTE", payload: note });
    if (state.masterPassword) {
      const newNotes = [...state.secureNotes, note];
      await saveSecureNotes(newNotes, state.masterPassword);
    }
  };

  const updateSecureNote = async (note: any) => {
    dispatch({ type: "UPDATE_SECURE_NOTE", payload: note });
    if (state.masterPassword) {
      const updatedNotes = state.secureNotes.map((n) =>
        n.id === note.id ? note : n
      );
      await saveSecureNotes(updatedNotes, state.masterPassword);
    }
  };

  const deleteSecureNote = async (id: string) => {
    dispatch({ type: "DELETE_SECURE_NOTE", payload: id });
    if (state.masterPassword) {
      const filteredNotes = state.secureNotes.filter((n) => n.id !== id);
      await saveSecureNotes(filteredNotes, state.masterPassword);
    }
  };

  const updateAppSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    dispatch({ type: "UPDATE_SETTINGS", payload: newSettings });
    await saveSettings(updatedSettings);
  };

  const handleSessionExpiredClose = () => {
    setShowSessionExpiredModal(false);
    dispatch({ type: "LOCK_APP" });
    router.replace("/auth");
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    authenticate,
    lockApp,
    loadUserData,
    isSetupComplete,
    tryAutoAuthenticate,
    saveData,
    addPassword,
    updatePassword,
    deletePassword,
    addSecureNote,
    updateSecureNote,
    deleteSecureNote,
    updateSettings: updateAppSettings,
    lockCountdown,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <SessionExpiredModal
        visible={showSessionExpiredModal}
        onClose={handleSessionExpiredClose}
      />
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
