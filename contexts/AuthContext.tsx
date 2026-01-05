
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import { authClient, storeWebBearerToken, storeBearerTokenFromSession } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function openOAuthPopup(provider: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const popupUrl = `${window.location.origin}/auth-popup?provider=${provider}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      popupUrl,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error("Failed to open popup. Please allow popups."));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth-success" && event.data?.token) {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        resolve(event.data.token);
      } else if (event.data?.type === "oauth-error") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        reject(new Error(event.data.error || "OAuth failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("Authentication cancelled"));
      }
    }, 500);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to ensure loading doesn't hang forever
    const timeoutId = setTimeout(() => {
      console.log('[AuthContext] Loading timeout - setting loading to false');
      setLoading(false);
    }, 3000);

    fetchUser().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, []);

  const fetchUser = async () => {
    try {
      console.log('[AuthContext] Fetching user session...');
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session fetch timeout')), 2000)
      );
      
      const sessionPromise = authClient.getSession();
      
      const session = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      if (session?.data?.user) {
        console.log('[AuthContext] User session found:', session.data.user.email);
        
        // Store bearer token for API calls
        await storeBearerTokenFromSession();
        
        setUser({
          ...session.data.user,
          isPremium: session.data.user.isPremium || false,
        } as User);
      } else {
        console.log('[AuthContext] No user session found');
        setUser(null);
      }
    } catch (error) {
      console.log('[AuthContext] Failed to fetch user (this is OK for freemium):', error);
      setUser(null);
    } finally {
      console.log('[AuthContext] Setting loading to false');
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Signing in with email:', email);
      const result = await authClient.signIn.email({ email, password });
      console.log('[AuthContext] Sign in result:', result);
      
      // Store the bearer token
      if (result?.data?.session?.token) {
        await storeWebBearerToken(result.data.session.token);
      } else {
        await storeBearerTokenFromSession();
      }
      
      await fetchUser();
    } catch (error) {
      console.error('[AuthContext] Email sign in failed:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      console.log('[AuthContext] Signing up with email:', email);
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      console.log('[AuthContext] Sign up result:', result);
      
      // Store the bearer token
      if (result?.data?.session?.token) {
        await storeWebBearerToken(result.data.session.token);
      } else {
        await storeBearerTokenFromSession();
      }
      
      await fetchUser();
    } catch (error) {
      console.error('[AuthContext] Email sign up failed:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[AuthContext] Signing in with Google');
      if (Platform.OS === "web") {
        const token = await openOAuthPopup("google");
        await storeWebBearerToken(token);
        await fetchUser();
      } else {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/(tabs)/(home)/",
        });
        await storeBearerTokenFromSession();
        await fetchUser();
      }
    } catch (error) {
      console.error('[AuthContext] Google sign in failed:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('[AuthContext] Signing in with Apple');
      if (Platform.OS === "web") {
        const token = await openOAuthPopup("apple");
        await storeWebBearerToken(token);
        await fetchUser();
      } else {
        await authClient.signIn.social({
          provider: "apple",
          callbackURL: "/(tabs)/(home)/",
        });
        await storeBearerTokenFromSession();
        await fetchUser();
      }
    } catch (error) {
      console.error('[AuthContext] Apple sign in failed:', error);
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    try {
      console.log('[AuthContext] Signing in with GitHub');
      if (Platform.OS === "web") {
        const token = await openOAuthPopup("github");
        await storeWebBearerToken(token);
        await fetchUser();
      } else {
        await authClient.signIn.social({
          provider: "github",
          callbackURL: "/(tabs)/(home)/",
        });
        await storeBearerTokenFromSession();
        await fetchUser();
      }
    } catch (error) {
      console.error('[AuthContext] GitHub sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out');
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Sign out failed:', error);
      throw error;
    }
  };

  console.log('[AuthContext] Rendering with loading:', loading, 'user:', user?.email || 'none');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithGitHub,
        signOut,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
