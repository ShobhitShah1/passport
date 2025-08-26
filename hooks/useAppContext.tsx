import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, UserSettings } from '../types';
import { loadPasswords, loadSettings, isAppSetup } from '../services/storage/secureStorage';

const initialState: AppState = {
  isAuthenticated: false,
  isLocked: true,
  passwords: [],
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
  searchQuery: '',
  selectedCategory: null,
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'AUTHENTICATE':
      return {
        ...state,
        isAuthenticated: action.payload,
        isLocked: !action.payload,
        error: null,
      };
    
    case 'LOCK_APP':
      return {
        ...state,
        isAuthenticated: false,
        isLocked: true,
        passwords: [], // Clear sensitive data when locked
      };
    
    case 'SET_PASSWORDS':
      return {
        ...state,
        passwords: action.payload,
      };
    
    case 'ADD_PASSWORD':
      return {
        ...state,
        passwords: [...state.passwords, action.payload],
      };
    
    case 'UPDATE_PASSWORD':
      return {
        ...state,
        passwords: state.passwords.map(password =>
          password.id === action.payload.id ? action.payload : password
        ),
      };
    
    case 'DELETE_PASSWORD':
      return {
        ...state,
        passwords: state.passwords.filter(password => password.id !== action.payload),
      };
    
    case 'SET_INSTALLED_APPS':
      return {
        ...state,
        installedApps: action.payload,
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    
    case 'SET_SELECTED_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-lock timer
  useEffect(() => {
    if (!state.isAuthenticated || state.settings.autoLockTimeout === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      dispatch({ type: 'LOCK_APP' });
    }, state.settings.autoLockTimeout * 60 * 1000);

    return () => clearTimeout(timeoutId);
  }, [state.isAuthenticated, state.settings.autoLockTimeout]);

  const authenticate = async (masterPassword: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load user data with the master password
      await loadUserData(masterPassword);
      
      dispatch({ type: 'AUTHENTICATE', payload: true });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to authenticate' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const lockApp = () => {
    dispatch({ type: 'LOCK_APP' });
  };

  const loadUserData = async (masterPassword: string) => {
    try {
      // Load passwords
      const passwords = await loadPasswords(masterPassword);
      dispatch({ type: 'SET_PASSWORDS', payload: passwords });

      // Load settings
      const settings = await loadSettings();
      if (settings) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }
    } catch (error) {
      throw new Error('Failed to load user data');
    }
  };

  const isSetupComplete = async (): Promise<boolean> => {
    return await isAppSetup();
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    authenticate,
    lockApp,
    loadUserData,
    isSetupComplete,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}