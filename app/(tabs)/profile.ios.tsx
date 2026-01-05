
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, THEMES } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { currentTheme, setTheme } = useAppTheme();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Success', 'You have been signed out. You can continue using the app with freemium features.');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    Alert.alert('Theme Changed', 'Your new theme has been applied!');
  };

  const menuItems = [
    {
      icon: 'notifications',
      label: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notifications settings will be available soon!'),
    },
    {
      icon: 'calendar-today',
      label: 'Reminders',
      onPress: () => Alert.alert('Coming Soon', 'Reminder settings will be available soon!'),
    },
    {
      icon: 'group',
      label: 'Habit Groups',
      onPress: () => router.push('/habit-groups' as any),
    },
    {
      icon: 'download',
      label: 'Export Data',
      onPress: () => Alert.alert('Coming Soon', 'Data export will be available soon!'),
    },
    {
      icon: 'lock',
      label: 'Privacy',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon!'),
    },
    {
      icon: 'help',
      label: 'Help & Support',
      onPress: () => Alert.alert('Help & Support', 'Need help? Contact us at support@momentum.app'),
    },
  ];

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.dark ? currentTheme.backgroundDark : currentTheme.background,
        }
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
          <Text style={[styles.title, { color: theme.dark ? currentTheme.textDark : currentTheme.text }]}>
            Profile
          </Text>
        </View>

        {/* User Info Card or Sign In Prompt */}
        {user ? (
          <View
            style={[
              styles.userCard,
              { 
                backgroundColor: theme.dark ? currentTheme.cardDark : currentTheme.card,
                borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.dark ? currentTheme.textDark : currentTheme.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.dark ? currentTheme.textSecondaryDark : currentTheme.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signInPrompt}
            onPress={handleSignIn}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[currentTheme.primary, currentTheme.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signInGradient}
            >
              <IconSymbol
                ios_icon_name="person.circle"
                android_material_icon_name="account-circle"
                size={48}
                color="#FFFFFF"
              />
              <Text style={styles.signInTitle}>Sign In for Full Access</Text>
              <Text style={styles.signInSubtitle}>
                Sync your habits across devices and unlock premium features
              </Text>
              <View style={styles.signInButton}>
                <Text style={styles.signInButtonText}>Sign In</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Freemium Info Banner */}
        {!user && (
          <View
            style={[
              styles.infoBanner,
              { 
                backgroundColor: currentTheme.success + '15',
                borderColor: currentTheme.success + '30',
              }
            ]}
          >
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check-circle"
              size={24}
              color={currentTheme.success}
            />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: currentTheme.success }]}>
                Free Features Active
              </Text>
              <Text style={[styles.infoSubtitle, { color: currentTheme.success }]}>
                Track up to 3 habits with basic stats
              </Text>
            </View>
          </View>
        )}

        {/* Premium Banner */}
        <TouchableOpacity
          style={[
            styles.premiumBanner,
            { 
              backgroundColor: currentTheme.accent + '15',
              borderColor: currentTheme.accent + '30',
            }
          ]}
          onPress={() => Alert.alert('Premium', 'Premium features coming soon!')}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={28}
            color={currentTheme.accent}
          />
          <View style={styles.premiumText}>
            <Text style={[styles.premiumTitle, { color: currentTheme.accent }]}>
              Upgrade to Premium
            </Text>
            <Text style={[styles.premiumSubtitle, { color: currentTheme.accent }]}>
              Unlimited habits, advanced insights & more
            </Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="arrow-forward"
            size={20}
            color={currentTheme.accent}
          />
        </TouchableOpacity>

        {/* Theme Section */}
        <View style={styles.themeSection}>
          <Text style={[styles.sectionTitle, { color: theme.dark ? currentTheme.textDark : currentTheme.text }]}>
            Themes
          </Text>
          <View style={styles.themesGrid}>
            {THEMES.map((themeOption, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.themeCard,
                    { 
                      backgroundColor: theme.dark ? currentTheme.cardDark : currentTheme.card,
                      borderColor: currentTheme.id === themeOption.id ? currentTheme.primary : 'transparent',
                      borderWidth: 2,
                    }
                  ]}
                  onPress={() => handleThemeSelect(themeOption.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[themeOption.primary, themeOption.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themePreview}
                  />
                  <Text style={[styles.themeName, { color: theme.dark ? currentTheme.textDark : currentTheme.text }]}>
                    {themeOption.name}
                  </Text>
                  {currentTheme.id === themeOption.id && (
                    <View style={[styles.activeIndicator, { backgroundColor: currentTheme.primary }]}>
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  { 
                    backgroundColor: theme.dark ? currentTheme.cardDark : currentTheme.card,
                    borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: currentTheme.primary + '15' }]}>
                    <IconSymbol
                      ios_icon_name={item.icon}
                      android_material_icon_name={item.icon}
                      size={20}
                      color={currentTheme.primary}
                    />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.dark ? currentTheme.textDark : currentTheme.text }]}>
                    {item.label}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={theme.dark ? currentTheme.textSecondaryDark : currentTheme.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Sign Out Button - Only show if user is signed in */}
        {user && (
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: colors.danger }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="arrow.right.square"
              android_material_icon_name="logout"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  signInPrompt: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  signInGradient: {
    padding: 24,
    alignItems: 'center',
  },
  signInTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  premiumText: {
    flex: 1,
    marginLeft: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  themeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  themePreview: {
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
