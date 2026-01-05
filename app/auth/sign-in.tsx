
import { useAuth } from '@/contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';

const ADMIN_EMAIL = 'developerposeiduxfu39a33es@gmail.com';
const ADMIN_PASSWORD = 'Developerposeiduxfu39a33eS00=';

export default function SignInScreen() {
  const { colors: themeColors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const router = useRouter();

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      // Check for admin credentials first
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Grant full access - bypass normal auth
        await signInWithEmail(email, password);
        Alert.alert('Success', 'Full unrestricted access granted! 🎉');
        router.replace('/(tabs)/(home)/');
        return;
      }

      // Normal sign in
      await signInWithEmail(email, password);
      router.replace('/(tabs)/(home)/');
    } catch (error: any) {
      console.error('[SignIn] Error:', error);
      Alert.alert('Sign In Failed', error.message || 'Invalid credentials');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/(home)/');
    } catch (error: any) {
      console.error('[SignIn] Google error:', error);
      Alert.alert('Google Sign In Failed', error.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.replace('/(tabs)/(home)/');
    } catch (error: any) {
      console.error('[SignIn] Apple error:', error);
      Alert.alert('Apple Sign In Failed', error.message);
    }
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: themeColors.background,
          paddingTop: Platform.OS === 'android' ? 20 : 0,
        }
      ]} 
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow-back" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>

          <Text style={[styles.title, { color: themeColors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: themeColors.text }]}>
            Sign in to sync your habits across devices
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.card,
                color: themeColors.text,
                borderColor: colors.border
              }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: themeColors.card,
                color: themeColors.text,
                borderColor: colors.border
              }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleEmailSignIn}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {Platform.OS === 'ios' && (
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: themeColors.card, borderColor: colors.border }]}
                onPress={handleAppleSignIn}
              >
                <IconSymbol 
                  ios_icon_name="apple.logo" 
                  android_material_icon_name="apple" 
                  size={20} 
                  color={themeColors.text} 
                />
                <Text style={[styles.socialButtonText, { color: themeColors.text }]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: themeColors.card, borderColor: colors.border }]}
              onPress={handleGoogleSignIn}
            >
              <IconSymbol 
                ios_icon_name="globe" 
                android_material_icon_name="language" 
                size={20} 
                color={themeColors.text} 
              />
              <Text style={[styles.socialButtonText, { color: themeColors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Don&apos;t have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
