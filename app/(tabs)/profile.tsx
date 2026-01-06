
import React from 'react';
import { useAppTheme } from '@/contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.sizes.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    marginBottom: spacing.md,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    marginTop: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: typography.sizes.md,
  },
  signOutButton: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  signOutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
});

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { currentTheme, setTheme, themes } = useAppTheme();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: currentTheme.colors.primary }]}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={40}
              color="#FFFFFF"
            />
          </View>
          <Text style={[styles.name, { color: currentTheme.colors.text }]}>
            {user?.email?.split('@')[0] || 'Guest'}
          </Text>
          <Text style={[styles.email, { color: currentTheme.colors.textSecondary }]}>
            {user?.email || 'Not signed in'}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Theme
          </Text>
          <View style={styles.themeGrid}>
            {themes.map((theme, index) => (
              <Pressable
                key={theme.id}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor:
                      currentTheme.id === theme.id
                        ? currentTheme.colors.primary
                        : currentTheme.colors.border,
                  },
                ]}
                onPress={() => setTheme(theme.id)}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.colors.primary,
                  }}
                />
                <Text style={[styles.themeName, { color: theme.colors.text }]}>
                  {theme.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300)}
          style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}
        >
          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: currentTheme.colors.border },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={20}
                color={currentTheme.colors.textSecondary}
              />
              <Text style={[styles.menuItemText, { color: currentTheme.colors.text }]}>
                Notifications
              </Text>
            </View>
            <Switch value={true} />
          </Pressable>

          <Pressable
            style={[
              styles.menuItem,
              { borderBottomColor: currentTheme.colors.border },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={currentTheme.colors.textSecondary}
              />
              <Text style={[styles.menuItemText, { color: currentTheme.colors.text }]}>
                Privacy
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={currentTheme.colors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={[
              styles.menuItem,
              { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol
                ios_icon_name="square.and.arrow.up"
                android_material_icon_name="upload"
                size={20}
                color={currentTheme.colors.textSecondary}
              />
              <Text style={[styles.menuItemText, { color: currentTheme.colors.text }]}>
                Export Data
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={currentTheme.colors.textSecondary}
            />
          </Pressable>
        </Animated.View>

        {user ? (
          <Pressable
            style={[styles.signOutButton, { backgroundColor: currentTheme.colors.error }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.signOutText, { color: '#FFFFFF' }]}>Sign Out</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.signOutButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleSignIn}
          >
            <Text style={[styles.signOutText, { color: '#FFFFFF' }]}>Sign In</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
