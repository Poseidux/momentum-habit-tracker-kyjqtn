
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme, THEMES } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { currentTheme, setTheme } = useAppTheme();
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
    Alert.alert(
      'Premium Required',
      'Creating an account requires a Premium subscription. Upgrade now to unlock unlimited habits, advanced analytics, and more!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade to Premium', onPress: () => router.push('/auth/sign-in' as any) }
      ]
    );
  };

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    Alert.alert('Theme Applied', 'Your new theme has been applied!');
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: currentTheme.colors.background }]} 
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* User Info Card */}
        <View style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          {user ? (
            <>
              <View style={[styles.avatarContainer, { backgroundColor: currentTheme.colors.primary + '20' }]}>
                <IconSymbol 
                  ios_icon_name="person.fill" 
                  android_material_icon_name="person" 
                  size={40} 
                  color={currentTheme.colors.primary} 
                />
              </View>
              <Text style={[styles.userName, { color: currentTheme.colors.text }]}>
                {user.name || user.email}
              </Text>
              <Text style={[styles.userEmail, { color: currentTheme.colors.textSecondary }]}>
                {user.email}
              </Text>
              {user.isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: currentTheme.colors.warning + '20' }]}>
                  <IconSymbol 
                    ios_icon_name="star.fill" 
                    android_material_icon_name="star" 
                    size={16} 
                    color={currentTheme.colors.warning} 
                  />
                  <Text style={[styles.premiumText, { color: currentTheme.colors.warning }]}>
                    Premium
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={[styles.avatarContainer, { backgroundColor: currentTheme.colors.primary + '20' }]}>
                <IconSymbol 
                  ios_icon_name="person" 
                  android_material_icon_name="person" 
                  size={40} 
                  color={currentTheme.colors.primary} 
                />
              </View>
              <Text style={[styles.userName, { color: currentTheme.colors.text }]}>
                Free User
              </Text>
              <Text style={[styles.userEmail, { color: currentTheme.colors.textSecondary }]}>
                Limited to 3 habits
              </Text>
            </>
          )}
        </View>

        {/* Themes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Themes</Text>
          <Text style={[styles.sectionSubtitle, { color: currentTheme.colors.textSecondary }]}>
            Choose your preferred color scheme
          </Text>
          
          <View style={styles.themesGrid}>
            {THEMES.map((theme) => (
              <React.Fragment key={theme.id}>
                <TouchableOpacity
                  style={[
                    styles.themeCard,
                    { backgroundColor: currentTheme.colors.surface },
                    currentTheme.id === theme.id && { 
                      borderWidth: 2, 
                      borderColor: currentTheme.colors.primary 
                    }
                  ]}
                  onPress={() => handleThemeSelect(theme.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themePreview}
                  />
                  <Text style={[styles.themeName, { color: currentTheme.colors.text }]}>
                    {theme.name}
                  </Text>
                  {currentTheme.id === theme.id && (
                    <View style={[styles.activeIndicator, { backgroundColor: currentTheme.colors.primary }]}>
                      <IconSymbol 
                        ios_icon_name="checkmark" 
                        android_material_icon_name="check" 
                        size={12} 
                        color="#FFFFFF" 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Settings</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: currentTheme.colors.surface }]}
            onPress={() => router.push('/habit-groups' as any)}
          >
            <View style={styles.settingLeft}>
              <IconSymbol 
                ios_icon_name="person.3.fill" 
                android_material_icon_name="group" 
                size={24} 
                color={currentTheme.colors.primary} 
              />
              <Text style={[styles.settingText, { color: currentTheme.colors.text }]}>
                Habit Groups
              </Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={currentTheme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Account</Text>
          
          {user ? (
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: currentTheme.colors.surface }]}
              onPress={handleSignOut}
            >
              <View style={styles.settingLeft}>
                <IconSymbol 
                  ios_icon_name="rectangle.portrait.and.arrow.right" 
                  android_material_icon_name="exit-to-app" 
                  size={24} 
                  color={currentTheme.colors.warning} 
                />
                <Text style={[styles.settingText, { color: currentTheme.colors.text }]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: currentTheme.colors.surface }]}
              onPress={handleSignIn}
            >
              <View style={styles.settingLeft}>
                <IconSymbol 
                  ios_icon_name="arrow.right.circle.fill" 
                  android_material_icon_name="login" 
                  size={24} 
                  color={currentTheme.colors.primary} 
                />
                <Text style={[styles.settingText, { color: currentTheme.colors.text }]}>
                  Upgrade to Premium
                </Text>
              </View>
              <View style={[styles.premiumBadge, { backgroundColor: currentTheme.colors.warning + '20' }]}>
                <IconSymbol 
                  ios_icon_name="star.fill" 
                  android_material_icon_name="star" 
                  size={14} 
                  color={currentTheme.colors.warning} 
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themePreview: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
