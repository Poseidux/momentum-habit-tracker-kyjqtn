
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';

// Fallback theme colors
const FALLBACK_COLORS = {
  primary: '#6366F1',
  background: '#0A0A0F',
  surface: '#1A1A2E',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: FALLBACK_COLORS.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: FALLBACK_COLORS.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* User Info */}
        <View style={[styles.card, { backgroundColor: FALLBACK_COLORS.surface }]}>
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor: FALLBACK_COLORS.primary }]}>
              <IconSymbol ios_icon_name="person.fill" android_material_icon_name="person" size={40} color="#FFFFFF" />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: FALLBACK_COLORS.text }]}>
                {user?.name || user?.email || 'Guest'}
              </Text>
              <Text style={[styles.userEmail, { color: FALLBACK_COLORS.textSecondary }]}>
                {user?.email || 'Not signed in'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={[styles.card, { backgroundColor: FALLBACK_COLORS.surface }]}>
          {user ? (
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="logout" size={24} color={FALLBACK_COLORS.primary} />
              <Text style={[styles.menuText, { color: FALLBACK_COLORS.text }]}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuItem} onPress={handleSignIn}>
              <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="login" size={24} color={FALLBACK_COLORS.primary} />
              <Text style={[styles.menuText, { color: FALLBACK_COLORS.text }]}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
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
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
