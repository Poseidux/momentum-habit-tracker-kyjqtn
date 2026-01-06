
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';

export default function CheckInScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { habits, checkInHabit } = useHabits();
  const [note, setNote] = useState('');
  const [mood, setMood] = useState(3);
  const [effort, setEffort] = useState(3);
  const [value, setValue] = useState('');

  const habit = habits.find(h => h.id === id);

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Check In',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Habit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCheckIn = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Save journal entry
      const journalEntry = {
        id: Date.now().toString(),
        habitId: habit.id,
        habitName: habit.name,
        date: new Date().toISOString().split('T')[0],
        note,
        mood,
        effort,
        createdAt: new Date().toISOString(),
      };

      const stored = await AsyncStorage.getItem('momentum_journal');
      const entries = stored ? JSON.parse(stored) : [];
      entries.push(journalEntry);
      await AsyncStorage.setItem('momentum_journal', JSON.stringify(entries));

      // Check in habit
      const numValue = habit.type === 'count' || habit.type === 'duration' ? parseInt(value, 10) : undefined;
      await checkInHabit(habit.id, numValue, note);

      // Award XP
      const xpGained = 10 + (effort * 2);
      const storedXP = await AsyncStorage.getItem('user_xp');
      const currentXP = storedXP ? parseInt(storedXP, 10) : 0;
      await AsyncStorage.setItem('user_xp', (currentXP + xpGained).toString());

      Alert.alert(
        'Great Job! 🎉',
        `You earned ${xpGained} XP!`,
        [{ text: 'Awesome!', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
    }
  };

  const getMoodEmoji = (moodValue: number) => {
    const moods = ['😢', '😕', '😐', '🙂', '😄'];
    return moods[moodValue - 1] || '😐';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Check In',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Habit Header */}
          <Animated.View entering={FadeIn.duration(400)}>
            <View style={[styles.habitHeader, { backgroundColor: colors.surface }]}>
              <View style={[styles.habitIcon, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol
                  ios_icon_name={habit.icon}
                  android_material_icon_name={habit.icon}
                  size={32}
                  color={colors.accent}
                />
              </View>
              <Text style={[styles.habitName, { color: colors.text }]}>
                {habit.name}
              </Text>
            </View>
          </Animated.View>

          {/* Value Input for Count/Duration */}
          {(habit.type === 'count' || habit.type === 'duration') && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {habit.type === 'count' ? 'How many?' : 'How long? (minutes)'}
                </Text>
                <TextInput
                  style={[
                    styles.valueInput, 
                    { 
                      backgroundColor: colors.background, 
                      color: colors.text,
                      borderColor: colors.border,
                    }
                  ]}
                  placeholder={habit.type === 'count' ? 'Enter count' : 'Enter minutes'}
                  placeholderTextColor={colors.textTertiary}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="numeric"
                />
              </View>
            </Animated.View>
          )}

          {/* Mood Selector */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                How do you feel?
              </Text>
              <View style={styles.moodContainer}>
                {[1, 2, 3, 4, 5].map((moodValue) => (
                  <Pressable
                    key={`mood-${moodValue}`}
                    style={({ pressed }) => [
                      styles.moodButton,
                      mood === moodValue && { backgroundColor: colors.accent + '20' },
                      pressed && { transform: [{ scale: 0.95 }] },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMood(moodValue);
                    }}
                  >
                    <Text style={styles.moodEmoji}>{getMoodEmoji(moodValue)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Effort Selector */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                How much effort?
              </Text>
              <View style={styles.sliderContainer}>
                <View style={styles.effortDots}>
                  {[1, 2, 3, 4, 5].map((effortValue) => (
                    <Pressable
                      key={`effort-${effortValue}`}
                      style={({ pressed }) => [
                        styles.effortDot,
                        {
                          backgroundColor: effortValue <= effort
                            ? colors.accent
                            : colors.progressBg
                        },
                        pressed && { transform: [{ scale: 0.9 }] },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setEffort(effortValue);
                      }}
                    />
                  ))}
                </View>
                <Text style={[styles.effortLabel, { color: colors.textSecondary }]}>
                  {effort === 1 && 'Very Easy'}
                  {effort === 2 && 'Easy'}
                  {effort === 3 && 'Moderate'}
                  {effort === 4 && 'Hard'}
                  {effort === 5 && 'Very Hard'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Note Input */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Add a note (optional)
              </Text>
              <TextInput
                style={[
                  styles.noteInput, 
                  { 
                    backgroundColor: colors.background, 
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="How did it go? Any thoughts?"
                placeholderTextColor={colors.textTertiary}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>

          {/* Bottom padding */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Check-in Button */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <Pressable
            style={({ pressed }) => [
              styles.checkInButton,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleCheckIn}
          >
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.checkInButtonText}>Complete Check-In</Text>
          </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
  },
  
  // Habit Header
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  habitIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  habitName: {
    ...typography.section,
    flex: 1,
  },
  
  // Card
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  
  // Value Input
  valueInput: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  
  // Mood
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 32,
  },
  
  // Effort
  sliderContainer: {
    gap: spacing.md,
  },
  effortDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  effortDot: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
  },
  effortLabel: {
    ...typography.body,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Note Input
  noteInput: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 100,
    borderWidth: 1,
  },
  
  // Footer
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  checkInButtonText: {
    ...typography.label,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
