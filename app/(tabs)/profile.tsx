
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { currentTheme, setTheme, themes } = useAppTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleThemeChange = async (themeId: string) => {
    try {
      await setTheme(themeId);
    } catch (error) {
      console.error('Theme change error:', error);
      Alert.alert('Error', 'Failed to change theme');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme.colors.gradient || [currentTheme.colors.primary, currentTheme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Profile</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* User Info */}
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <View style={styles.profileSection}>
            <LinearGradient
              colors={currentTheme.colors.gradient || [currentTheme.colors.primary, currentTheme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <IconSymbol ios_icon_name="person.fill" android_material_icon_name="person" size={40} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: currentTheme.colors.text }]}>
                {user?.name || user?.email || 'Guest'}
              </Text>
              <Text style={[styles.userEmail, { color: currentTheme.colors.textSecondary }]}>
                {user?.email || 'Not signed in'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Theme Selection */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>Theme</Text>
          <View style={styles.themesGrid}>
            {themes.map((theme, index) => (
              <React.Fragment key={`theme-${index}`}>
                <TouchableOpacity
                  style={[
                    styles.themeCard,
                    { backgroundColor: currentTheme.colors.surface },
                    currentTheme.id === theme.id && { borderColor: currentTheme.colors.primary, borderWidth: 3 }
                  ]}
                  onPress={() => handleThemeChange(theme.id)}
                >
                  <LinearGradient
                    colors={theme.colors.gradient || [theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themePreview}
                  />
                  <Text style={[styles.themeName, { color: currentTheme.colors.text }]}>{theme.name}</Text>
                  {currentTheme.id === theme.id && (
                    <View style={[styles.checkBadge, { backgroundColor: currentTheme.colors.primary }]}>
                      <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        {/* Account Actions */}
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          {user ? (
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <View style={[styles.menuIconContainer, { backgroundColor: currentTheme.colors.error + '20' }]}>
                <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="logout" size={24} color={currentTheme.colors.error} />
              </View>
              <Text style={[styles.menuText, { color: currentTheme.colors.text }]}>Sign Out</Text>
              <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={currentTheme.colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuItem} onPress={handleSignIn}>
              <View style={[styles.menuIconContainer, { backgroundColor: currentTheme.colors.primary + '20' }]}>
                <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="login" size={24} color={currentTheme.colors.primary} />
              </View>
              <Text style={[styles.menuText, { color: currentTheme.colors.text }]}>Sign In</Text>
              <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={currentTheme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
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
    borderRadius: 12,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
