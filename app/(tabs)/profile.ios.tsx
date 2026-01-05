
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'You have been signed out');
    } catch (error) {
      console.error('[ProfileScreen] Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: theme.dark ? colors.backgroundDark : colors.background }
      ]}
      edges={['top']}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.dark ? colors.textDark : colors.text }]}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={theme.dark 
            ? ['#1a1a1a', '#2a2a2a'] 
            : ['#ffffff', '#f8f8f8']
          }
          style={styles.profileCard}
        >
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={48}
                color={colors.primary}
              />
            </View>
          </View>
          
          {user ? (
            <>
              <Text style={[styles.name, { color: theme.dark ? colors.textDark : colors.text }]}>
                {user.name || 'User'}
              </Text>
              <Text style={[styles.email, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                {user.email}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.name, { color: theme.dark ? colors.textDark : colors.text }]}>
                Guest User
              </Text>
              <Text style={[styles.email, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Sign in to sync your data
              </Text>
            </>
          )}
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={[
              styles.menuItem,
              { 
                backgroundColor: theme.dark ? '#1a1a1a' : '#ffffff',
                borderBottomColor: theme.dark ? '#2a2a2a' : '#f0f0f0',
              }
            ]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: theme.dark ? colors.textDark : colors.text }]}>
                Notifications
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.menuItem,
              { 
                backgroundColor: theme.dark ? '#1a1a1a' : '#ffffff',
                borderBottomColor: theme.dark ? '#2a2a2a' : '#f0f0f0',
              }
            ]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: theme.dark ? colors.textDark : colors.text }]}>
                Premium
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.menuItem,
              { 
                backgroundColor: theme.dark ? '#1a1a1a' : '#ffffff',
                borderBottomColor: theme.dark ? '#2a2a2a' : '#f0f0f0',
              }
            ]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol
                ios_icon_name="gear"
                android_material_icon_name="settings"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: theme.dark ? colors.textDark : colors.text }]}>
                Settings
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.menuItem,
              { 
                backgroundColor: theme.dark ? '#1a1a1a' : '#ffffff',
              }
            ]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol
                ios_icon_name="questionmark.circle.fill"
                android_material_icon_name="help"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: theme.dark ? colors.textDark : colors.text }]}>
                Help & Support
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sign In/Out Button */}
        <TouchableOpacity
          style={[
            styles.signOutButton,
            { 
              backgroundColor: user ? colors.error + '15' : colors.primary,
            }
          ]}
          onPress={user ? handleSignOut : handleSignIn}
        >
          <IconSymbol
            ios_icon_name={user ? "arrow.right.square.fill" : "arrow.right.square.fill"}
            android_material_icon_name={user ? "logout" : "login"}
            size={20}
            color={user ? colors.error : '#FFFFFF'}
          />
          <Text style={[
            styles.signOutButtonText,
            { color: user ? colors.error : '#FFFFFF' }
          ]}>
            {user ? 'Sign Out' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.version, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
          Version 1.0.0
        </Text>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  profileCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuSection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
});
