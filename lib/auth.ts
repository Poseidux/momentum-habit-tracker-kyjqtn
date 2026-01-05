
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_URL = "https://jy665p438dcnvnzyntn7agddkp3cdrt9.app.specular.dev";

// CRITICAL: This must match the key in utils/api.ts
const BEARER_TOKEN_KEY = "natively_bearer_token";

// Platform-specific storage: localStorage for web, SecureStore for native
const storage = Platform.OS === "web"
  ? {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        console.log('[Auth] Stored token in localStorage:', key);
      },
      deleteItem: (key: string) => localStorage.removeItem(key),
    }
  : {
      getItem: async (key: string) => {
        const value = await SecureStore.getItemAsync(key);
        console.log('[Auth] Retrieved token from SecureStore:', key, value ? 'exists' : 'null');
        return value;
      },
      setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
        console.log('[Auth] Stored token in SecureStore:', key);
      },
      deleteItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key);
      },
    };

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "natively",
      storagePrefix: "natively",
      storage,
    }),
  ],
});

// Store bearer token explicitly after successful authentication
export async function storeWebBearerToken(token: string) {
  console.log('[Auth] Storing bearer token...');
  if (Platform.OS === "web") {
    localStorage.setItem(BEARER_TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(BEARER_TOKEN_KEY, token);
  }
}

// Store bearer token from session
export async function storeBearerTokenFromSession() {
  try {
    const session = await authClient.getSession();
    if (session?.data?.session?.token) {
      const token = session.data.session.token;
      console.log('[Auth] Storing token from session');
      await storeWebBearerToken(token);
      return token;
    }
  } catch (error) {
    console.error('[Auth] Failed to store token from session:', error);
  }
  return null;
}

export function clearAuthTokens() {
  console.log('[Auth] Clearing auth tokens');
  if (Platform.OS === "web") {
    localStorage.removeItem(BEARER_TOKEN_KEY);
  } else {
    SecureStore.deleteItemAsync(BEARER_TOKEN_KEY);
  }
}

export { API_URL, BEARER_TOKEN_KEY };
