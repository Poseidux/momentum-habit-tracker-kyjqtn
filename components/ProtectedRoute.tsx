
/**
 * Protected Route Component - Now Optional for Freemium
 * Only redirects if explicitly required (for premium features)
 */

import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@react-navigation/native";

interface ProtectedRouteProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  optional?: boolean; // If true, allows access without auth
}

export function ProtectedRoute({
  children,
  loadingComponent,
  optional = true, // Default to optional for freemium
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const theme = useTheme();

  console.log('[ProtectedRoute] Rendering - loading:', loading, 'user:', user?.email || 'none', 'optional:', optional);

  // Show loading state while checking authentication
  if (loading) {
    return loadingComponent || (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // If optional, render children regardless of auth state
  if (optional) {
    console.log('[ProtectedRoute] Optional route - rendering children');
    return <>{children}</>;
  }

  // For non-optional routes, only render if authenticated
  if (!user) {
    console.log('[ProtectedRoute] Non-optional route without user - blocking');
    return null;
  }

  console.log('[ProtectedRoute] Authenticated - rendering children');
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
});
