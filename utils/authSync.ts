/**
 * Global Authentication Synchronization Utility
 * Ensures consistency between useAppContext and passwordStore authentication
 */

import { usePasswordStore } from "@/stores/passwordStore";

export interface AuthSyncResult {
  isAuthenticated: boolean;
  masterPassword?: string;
  passwordStoreReady: boolean;
}

/**
 * Synchronize authentication between systems
 * @param contextAuth - Authentication state from useAppContext
 * @param masterPassword - Master password from useAppContext
 * @returns Promise<AuthSyncResult> - Synchronized authentication status
 */
export async function syncAuthentication(
  contextAuth: boolean,
  masterPassword?: string
): Promise<AuthSyncResult> {
  try {
    // If context is not authenticated, nothing to sync
    if (!contextAuth || !masterPassword) {
      return {
        isAuthenticated: false,
        passwordStoreReady: false,
      };
    }

    // Get passwordStore instance
    const passwordStore = usePasswordStore.getState();

    // If passwordStore is already authenticated, we're good
    if (passwordStore.isAuthenticated) {
      return {
        isAuthenticated: true,
        masterPassword,
        passwordStoreReady: true,
      };
    }

    // Try to authenticate passwordStore
    try {
      const authResult = await passwordStore.authenticate(masterPassword);
      return {
        isAuthenticated: true,
        masterPassword,
        passwordStoreReady: authResult,
      };
    } catch (error) {
      console.warn("PasswordStore authentication failed:", error);
      return {
        isAuthenticated: true,
        masterPassword,
        passwordStoreReady: false,
      };
    }
  } catch (error) {
    console.error("Auth sync error:", error);
    return {
      isAuthenticated: false,
      passwordStoreReady: false,
    };
  }
}

/**
 * Ensure authentication before performing secure operations
 * @param contextAuth - Authentication state from useAppContext
 * @param masterPassword - Master password from useAppContext
 * @returns Promise<boolean> - True if operation can proceed
 */
export async function ensureAuthenticated(
  contextAuth: boolean,
  masterPassword?: string
): Promise<boolean> {
  const syncResult = await syncAuthentication(contextAuth, masterPassword);
  return syncResult.isAuthenticated;
}

/**
 * Get synchronized authentication state
 * @param contextAuth - Authentication state from useAppContext
 * @param masterPassword - Master password from useAppContext
 * @returns AuthSyncResult - Current synchronized state
 */
export async function getAuthState(
  contextAuth: boolean,
  masterPassword?: string
): Promise<AuthSyncResult> {
  return await syncAuthentication(contextAuth, masterPassword);
}

/**
 * Hook for easy authentication sync in components
 */
export function useAuthSync() {
  return {
    syncAuthentication,
    ensureAuthenticated,
    getAuthState,
  };
}
