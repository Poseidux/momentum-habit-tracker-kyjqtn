
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function CheckInScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentTheme } = useAppTheme();
  const { habits, checkInHabit } = useHabits();
  const [note, setNote] = useState('');
  const [mood, setMood] = useState(3);
  const [effort, setEffort] = useState(3);
  const [value, setValue] = useState('');

  const habit = habits.find(h => h.id === id);

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={[styles.errorText, { color: currentTheme.colors.text }]}>Habit not found</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Check In',
          headerStyle: { backgroundColor: currentTheme.colors.background },
          headerTintColor: currentTheme.colors.text,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={[styles.habitHeader, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
              <IconSymbol
                ios_icon_name={habit.icon}
                android_material_icon_name={habit.icon}
                size={32}
                color="#FFF"
              />
            </View>
            <Text style={[styles.habitName, { color: currentTheme.colors.text }]}>
              {habit.name}
            </Text>
          </View>
        </Animated.View>

        {(habit.type === 'count' || habit.type === 'duration') && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <View style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>
                {habit.type === 'count' ? 'How many?' : 'How long? (minutes)'}
              </Text>
              <TextInput
                style={[styles.valueInput, { backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }]}
                placeholder={habit.type === 'count' ? 'Enter count' : 'Enter minutes'}
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
              />
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300)}>
          <View style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>
              How do you feel?
            </Text>
            <View style={styles.moodContainer}>
              {[1, 2, 3, 4, 5].map((moodValue) => (
                <TouchableOpacity
                  key={moodValue}
                  style={[
                    styles.moodButton,
                    mood === moodValue && { backgroundColor: currentTheme.colors.primary + '30' }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMood(moodValue);
                  }}
                >
                  <Text style={styles.moodEmoji}>{getMoodEmoji(moodValue)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <View style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>
              How much effort?
            </Text>
            <View style={styles.sliderContainer}>
              <View style={styles.effortDots}>
                {[1, 2, 3, 4, 5].map((effortValue) => (
                  <TouchableOpacity
                    key={effortValue}
                    style={[
                      styles.effortDot,
                      {
                        backgroundColor: effortValue <= effort
                          ? currentTheme.colors.primary
                          : currentTheme.colors.background
                      }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setEffort(effortValue);
                    }}
                  />
                ))}
              </View>
              <Text style={[styles.effortLabel, { color: currentTheme.colors.textSecondary }]}>
                {effort === 1 && 'Very Easy'}
                {effort === 2 && 'Easy'}
                {effort === 3 && 'Moderate'}
                {effort === 4 && 'Hard'}
                {effort === 5 && 'Very Hard'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <View style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>
              Add a note (optional)
            </Text>
            <TextInput
              style={[styles.noteInput, { backgroundColor: currentTheme.colors.background, color: currentTheme.colors.text }]}
              placeholder="How did it go? Any thoughts?"
              placeholderTextColor={currentTheme.colors.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkInButton, { backgroundColor: habit.color }]}
          onPress={handleCheckIn}
        >
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={24}
            color="#FFF"
          />
          <Text style={styles.checkInButtonText}>Complete Check-In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  habitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  habitName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  valueInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 32,
  },
  sliderContainer: {
    gap: 16,
  },
  effortDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  effortDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  effortLabel: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  noteInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  checkInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
