
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

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
              router.replace('/auth');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'notifications',
      label: 'Notifications',
      onPress: () => console.log('Notifications'),
    },
    {
      icon: 'calendar-today',
      label: 'Reminders',
      onPress: () => console.log('Reminders'),
    },
    {
      icon: 'palette',
      label: 'Themes',
      onPress: () => console.log('Themes'),
    },
    {
      icon: 'download',
      label: 'Export Data',
      onPress: () => console.log('Export Data'),
    },
    {
      icon: 'lock',
      label: 'Privacy',
      onPress: () => console.log('Privacy'),
    },
    {
      icon: 'help',
      label: 'Help & Support',
      onPress: () => console.log('Help'),
    },
  ];

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.dark ? colors.backgroundDark : colors.background }]}
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

        {/* User Info Card */}
        <View
          style={[
            styles.userCard,
            { 
              backgroundColor: theme.dark ? colors.cardDark : colors.card,
              borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
            }
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.dark ? colors.textDark : colors.text }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>

        {/* Premium Banner */}
        <View
          style={[
            styles.premiumBanner,
            { 
              backgroundColor: colors.accent + '15',
              borderColor: colors.accent + '30',
            }
          ]}
        >
          <IconSymbol
            ios_icon_name="star"
            android_material_icon_name="star"
            size={28}
            color={colors.accent}
          />
          <View style={styles.premiumText}>
            <Text style={[styles.premiumTitle, { color: colors.accent }]}>
              Upgrade to Premium
            </Text>
            <Text style={[styles.premiumSubtitle, { color: colors.accent }]}>
              Unlimited habits, advanced insights & more
            </Text>
          </View>
          <IconSymbol
            ios_icon_name="arrow-forward"
            android_material_icon_name="arrow-forward"
            size={20}
            color={colors.accent}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  { 
                    backgroundColor: theme.dark ? colors.cardDark : colors.card,
                    borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
                  }
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
                    <IconSymbol
                      ios_icon_name={item.icon}
                      android_material_icon_name={item.icon}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.dark ? colors.textDark : colors.text }]}>
                    {item.label}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="arrow-forward"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.danger }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="logout"
            android_material_icon_name="logout"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
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
