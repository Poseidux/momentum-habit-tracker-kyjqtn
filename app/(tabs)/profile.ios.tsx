
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const { currentTheme, setTheme, themes } = useAppTheme();
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

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.colors?.background || '#0F172A' }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentTheme?.colors?.text || '#F1F5F9' }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {user ? (
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={[styles.card, { backgroundColor: currentTheme?.colors?.surface || '#1E293B' }]}>
              <View style={[styles.avatar, { backgroundColor: currentTheme?.colors?.primary || '#6366F1' }]}>
                <Text style={styles.avatarText}>{user.name?.[0] || user.email[0].toUpperCase()}</Text>
              </View>
              <Text style={[styles.userName, { color: currentTheme?.colors?.text || '#F1F5F9' }]}>{user.name || 'User'}</Text>
              <Text style={[styles.userEmail, { color: currentTheme?.colors?.textSecondary || '#94A3B8' }]}>{user.email}</Text>
              {user.isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: currentTheme?.colors?.primary || '#6366F1' }]}>
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100)}>
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: currentTheme?.colors?.primary || '#6366F1' }]}
              onPress={handleSignIn}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.sectionTitle, { color: currentTheme?.colors?.text || '#F1F5F9' }]}>Themes</Text>
          {themes.map((theme, index) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                { backgroundColor: currentTheme?.colors?.surface || '#1E293B' },
                currentTheme?.id === theme.id && { borderColor: currentTheme?.colors?.primary || '#6366F1', borderWidth: 2 }
              ]}
              onPress={() => handleThemeChange(theme.id)}
            >
              <LinearGradient
                colors={theme.colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.themePreview}
              />
              <Text style={[styles.themeName, { color: currentTheme?.colors?.text || '#F1F5F9' }]}>{theme.name}</Text>
              {currentTheme?.id === theme.id && (
                <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={24} color={currentTheme?.colors?.primary || '#6366F1'} />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {user && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <TouchableOpacity
              style={[styles.signOutButton, { backgroundColor: currentTheme?.colors?.error || '#EF4444' }]}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 16 },
  headerTitle: { fontSize: 32, fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  card: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 16 },
  premiumBadge: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  premiumText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  signInButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  signInButtonText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  themeCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  themePreview: { width: 40, height: 40, borderRadius: 20, marginRight: 16 },
  themeName: { flex: 1, fontSize: 16, fontWeight: '600' },
  signOutButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  signOutButtonText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
});
