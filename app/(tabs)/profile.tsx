
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';

export default function ProfileScreen() {
  const { isDark, colors, toggleTheme } = useAppTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* User Profile */}
        {user ? (
          <Animated.View entering={FadeInDown.delay(100)} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>{user.name?.[0] || user.email[0].toUpperCase()}</Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{user.name || 'User'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
            {user.isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={14} color={colors.accent} />
                <Text style={[styles.premiumText, { color: colors.accent }]}>Premium</Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100)}>
            <Pressable
              style={({ pressed }) => [
                styles.signInButton,
                { backgroundColor: colors.accent },
                pressed && { opacity: 0.9 },
              ]}
              onPress={handleSignIn}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                  <IconSymbol 
                    ios_icon_name={isDark ? 'moon.fill' : 'sun.max.fill'} 
                    android_material_icon_name={isDark ? 'nightlight' : 'wb-sunny'} 
                    size={20} 
                    color={colors.accent} 
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                    {isDark ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.accent + '40' }}
                thumbColor={isDark ? colors.accent : colors.surface}
              />
            </View>
          </View>
        </Animated.View>

        {/* Account */}
        {user && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
            <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {}}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                    <IconSymbol ios_icon_name="bell.fill" android_material_icon_name="notifications" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                      Manage reminders
                    </Text>
                  </View>
                </View>
                <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.textTertiary} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Pressable
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {}}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                    <IconSymbol ios_icon_name="arrow.down.doc.fill" android_material_icon_name="download" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Export Data</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                      Download your data
                    </Text>
                  </View>
                </View>
                <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.textTertiary} />
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Sign Out */}
        {user && (
          <Animated.View entering={FadeInDown.delay(250)}>
            <Pressable
              style={({ pressed }) => [
                styles.signOutButton,
                { backgroundColor: colors.error + '15', borderColor: colors.error },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleSignOut}
            >
              <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="logout" size={20} color={colors.error} />
              <Text style={[styles.signOutButtonText, { color: colors.error }]}>Sign Out</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  
  // Header
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
  },
  
  // User Card
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.display,
    fontSize: 32,
    color: '#FFFFFF',
  },
  userName: {
    ...typography.section,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  premiumText: {
    ...typography.caption,
    fontWeight: '600',
  },
  
  // Sign In Button
  signInButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  signInButtonText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Section
  sectionTitle: {
    ...typography.section,
    marginBottom: spacing.md,
  },
  
  // Setting Card
  settingCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    ...typography.caption,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  
  // Sign Out Button
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  signOutButtonText: {
    ...typography.label,
    fontWeight: '600',
  },
});
