
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme, THEMES } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const { currentTheme, setTheme } = useAppTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/sign-in');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>Profile</Text>
        </View>

        {user ? (
          <View style={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: currentTheme.colors.primary + '20' }]}>
                <IconSymbol 
                  ios_icon_name="person.fill" 
                  android_material_icon_name="person"
                  size={32}
                  color={currentTheme.colors.primary}
                />
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: currentTheme.colors.text }]}>
                  {user.name || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: currentTheme.colors.textSecondary }]}>
                  {user.email}
                </Text>
                {user.isPremium && (
                  <View style={[styles.premiumBadge, { backgroundColor: currentTheme.colors.primary }]}>
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.signInButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleSignIn}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Themes</Text>
          <View style={styles.themesGrid}>
            {THEMES.map((theme, index) => (
              <React.Fragment key={theme.id}>
                <TouchableOpacity
                  style={[
                    styles.themeCard,
                    { backgroundColor: theme.colors.card },
                    currentTheme.id === theme.id && styles.selectedTheme
                  ]}
                  onPress={() => handleThemeSelect(theme.id)}
                >
                  <LinearGradient
                    colors={theme.colors.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themePreview}
                  />
                  <Text style={[styles.themeName, { color: theme.colors.text }]}>
                    {theme.name}
                  </Text>
                  {currentTheme.id === theme.id && (
                    <View style={[styles.checkmark, { backgroundColor: currentTheme.colors.primary }]}>
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

        {user && (
          <TouchableOpacity 
            style={[styles.signOutButton, { backgroundColor: currentTheme.colors.card }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.signOutButtonText, { color: currentTheme.colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        )}
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
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  signInButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    position: 'relative',
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  themePreview: {
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
