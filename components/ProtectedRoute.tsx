
/**
 * Protected Route Component - Now Optional for Freemium
 * Only redirects if explicitly required (for premium features)
 */

import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

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

  // Show loading state while checking authentication
  if (loading) {
    return loadingComponent || (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If optional, render children regardless of auth state
  if (optional) {
    return <>{children}</>;
  }

  // For non-optional routes, only render if authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
