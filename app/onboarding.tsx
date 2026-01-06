
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const GOAL_AREAS = [
  { id: 'health', name: 'Health & Fitness', icon: 'fitness-center', color: '#10B981' },
  { id: 'mind', name: 'Mindfulness', icon: 'self-improvement', color: '#8B5CF6' },
  { id: 'productivity', name: 'Productivity', icon: 'work', color: '#F59E0B' },
  { id: 'learning', name: 'Learning', icon: 'school', color: '#3B82F6' },
  { id: 'creativity', name: 'Creativity', icon: 'palette', color: '#EC4899' },
  { id: 'social', name: 'Social', icon: 'group', color: '#06B6D4' },
];

const STARTER_HABITS = {
  health: [
    { name: 'Morning Exercise', icon: 'fitness-center', color: '#10B981', type: 'yes_no', schedule: 'daily', tags: ['Health', 'Fitness'] },
    { name: 'Drink 8 Glasses of Water', icon: 'local-drink', color: '#06B6D4', type: 'count', schedule: 'daily', tags: ['Health'] },
    { name: '8 Hours Sleep', icon: 'bedtime', color: '#8B5CF6', type: 'yes_no', schedule: 'daily', tags: ['Health'] },
    { name: 'Healthy Meal', icon: 'restaurant', color: '#10B981', type: 'yes_no', schedule: 'daily', tags: ['Health'] },
  ],
  mind: [
    { name: 'Meditate 10 Minutes', icon: 'self-improvement', color: '#8B5CF6', type: 'duration', schedule: 'daily', tags: ['Mindfulness'] },
    { name: 'Gratitude Journal', icon: 'edit', color: '#EC4899', type: 'yes_no', schedule: 'daily', tags: ['Mindfulness'] },
    { name: 'Deep Breathing', icon: 'air', color: '#06B6D4', type: 'yes_no', schedule: 'daily', tags: ['Mindfulness'] },
    { name: 'No Social Media Before Bed', icon: 'phone-disabled', color: '#EF4444', type: 'yes_no', schedule: 'daily', tags: ['Mindfulness'] },
  ],
  productivity: [
    { name: 'Plan Tomorrow', icon: 'event', color: '#F59E0B', type: 'yes_no', schedule: 'daily', tags: ['Work'] },
    { name: 'Focus Work Session', icon: 'timer', color: '#3B82F6', type: 'duration', schedule: 'daily', tags: ['Work'] },
    { name: 'Inbox Zero', icon: 'email', color: '#10B981', type: 'yes_no', schedule: 'daily', tags: ['Work'] },
    { name: 'Review Goals', icon: 'flag', color: '#EC4899', type: 'yes_no', schedule: 'daily', tags: ['Work'] },
  ],
  learning: [
    { name: 'Read 30 Minutes', icon: 'menu-book', color: '#3B82F6', type: 'duration', schedule: 'daily', tags: ['Study'] },
    { name: 'Learn New Skill', icon: 'school', color: '#8B5CF6', type: 'yes_no', schedule: 'daily', tags: ['Study'] },
    { name: 'Practice Language', icon: 'translate', color: '#10B981', type: 'duration', schedule: 'daily', tags: ['Study'] },
    { name: 'Watch Educational Video', icon: 'play-circle', color: '#F59E0B', type: 'yes_no', schedule: 'daily', tags: ['Study'] },
  ],
  creativity: [
    { name: 'Creative Writing', icon: 'edit', color: '#EC4899', type: 'duration', schedule: 'daily', tags: ['Creativity'] },
    { name: 'Draw or Paint', icon: 'palette', color: '#8B5CF6', type: 'yes_no', schedule: 'daily', tags: ['Creativity'] },
    { name: 'Play Music', icon: 'music-note', color: '#3B82F6', type: 'duration', schedule: 'daily', tags: ['Creativity'] },
    { name: 'Photography', icon: 'camera', color: '#10B981', type: 'yes_no', schedule: 'daily', tags: ['Creativity'] },
  ],
  social: [
    { name: 'Call a Friend', icon: 'phone', color: '#06B6D4', type: 'yes_no', schedule: 'daily', tags: ['Social'] },
    { name: 'Quality Time with Family', icon: 'group', color: '#EC4899', type: 'duration', schedule: 'daily', tags: ['Social'] },
    { name: 'Help Someone', icon: 'volunteer-activism', color: '#10B981', type: 'yes_no', schedule: 'daily', tags: ['Social'] },
    { name: 'Send Appreciation Message', icon: 'favorite', color: '#EF4444', type: 'yes_no', schedule: 'daily', tags: ['Social'] },
  ],
};

const CHECK_IN_TIMES = [
  { id: 'morning', label: 'Morning (8 AM)', time: '08:00' },
  { id: 'afternoon', label: 'Afternoon (2 PM)', time: '14:00' },
  { id: 'evening', label: 'Evening (6 PM)', time: '18:00' },
  { id: 'night', label: 'Night (9 PM)', time: '21:00' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedHabits, setSelectedHabits] = useState<any[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [buddyEmail, setBuddyEmail] = useState('');
  const router = useRouter();
  const { currentTheme } = useAppTheme();
  const { saveHabit } = useHabits();

  const handleGoalSelect = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoal(goalId);
  };

  const handleHabitToggle = (habit: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isSelected = selectedHabits.some(h => h.name === habit.name);
    if (isSelected) {
      setSelectedHabits(selectedHabits.filter(h => h.name !== habit.name));
    } else {
      if (selectedHabits.length < 3) {
        setSelectedHabits([...selectedHabits, habit]);
      } else {
        Alert.alert('Limit Reached', 'Please select up to 3 starter habits');
      }
    }
  };

  const handleTimeToggle = (timeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isSelected = selectedTimes.includes(timeId);
    if (isSelected) {
      setSelectedTimes(selectedTimes.filter(t => t !== timeId));
    } else {
      setSelectedTimes([...selectedTimes, timeId]);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 1 && !selectedGoal) {
      Alert.alert('Select a Goal', 'Please choose a goal area to continue');
      return;
    }
    if (step === 2 && selectedHabits.length === 0) {
      Alert.alert('Select Habits', 'Please choose at least 1 habit to continue');
      return;
    }
    if (step === 3 && selectedTimes.length === 0) {
      Alert.alert('Select Time', 'Please choose at least 1 check-in time');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(step - 1);
  };

  const handleFinish = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Save selected habits
      for (const habit of selectedHabits) {
        await saveHabit(habit);
      }

      // Save onboarding completion and preferences
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('selected_goal', selectedGoal);
      await AsyncStorage.setItem('check_in_times', JSON.stringify(selectedTimes));
      if (buddyEmail) {
        await AsyncStorage.setItem('buddy_email', buddyEmail);
      }

      // Navigate to main app
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInRight} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: currentTheme.colors.text }]}>
        What&apos;s your main goal?
      </Text>
      <Text style={[styles.stepSubtitle, { color: currentTheme.colors.textSecondary }]}>
        Choose the area you want to focus on
      </Text>
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {GOAL_AREAS.map((goal, index) => (
          <Animated.View key={goal.id} entering={FadeInDown.delay(index * 100)}>
            <TouchableOpacity
              style={[
                styles.goalCard,
                { backgroundColor: currentTheme.colors.surface },
                selectedGoal === goal.id && { borderColor: goal.color, borderWidth: 3 }
              ]}
              onPress={() => handleGoalSelect(goal.id)}
            >
              <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                <IconSymbol
                  ios_icon_name={goal.icon}
                  android_material_icon_name={goal.icon}
                  size={32}
                  color={goal.color}
                />
              </View>
              <Text style={[styles.goalName, { color: currentTheme.colors.text }]}>
                {goal.name}
              </Text>
              {selectedGoal === goal.id && (
                <View style={styles.checkmark}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={28}
                    color={goal.color}
                  />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderStep2 = () => {
    const habits = selectedGoal ? STARTER_HABITS[selectedGoal as keyof typeof STARTER_HABITS] : [];
    return (
      <Animated.View entering={FadeInRight} style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: currentTheme.colors.text }]}>
          Pick 3 starter habits
        </Text>
        <Text style={[styles.stepSubtitle, { color: currentTheme.colors.textSecondary }]}>
          Selected: {selectedHabits.length}/3
        </Text>
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {habits.map((habit, index) => {
            const isSelected = selectedHabits.some(h => h.name === habit.name);
            return (
              <Animated.View key={habit.name} entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity
                  style={[
                    styles.habitCard,
                    { backgroundColor: currentTheme.colors.surface },
                    isSelected && { borderColor: habit.color, borderWidth: 3 }
                  ]}
                  onPress={() => handleHabitToggle(habit)}
                >
                  <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
                    <IconSymbol
                      ios_icon_name={habit.icon}
                      android_material_icon_name={habit.icon}
                      size={24}
                      color="#FFF"
                    />
                  </View>
                  <Text style={[styles.habitName, { color: currentTheme.colors.text }]}>
                    {habit.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={habit.color}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderStep3 = () => (
    <Animated.View entering={FadeInRight} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: currentTheme.colors.text }]}>
        When should we remind you?
      </Text>
      <Text style={[styles.stepSubtitle, { color: currentTheme.colors.textSecondary }]}>
        Choose your preferred check-in times
      </Text>
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {CHECK_IN_TIMES.map((time, index) => {
          const isSelected = selectedTimes.includes(time.id);
          return (
            <Animated.View key={time.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                style={[
                  styles.timeCard,
                  { backgroundColor: currentTheme.colors.surface },
                  isSelected && { borderColor: currentTheme.colors.primary, borderWidth: 3 }
                ]}
                onPress={() => handleTimeToggle(time.id)}
              >
                <IconSymbol
                  ios_icon_name="clock"
                  android_material_icon_name="access-time"
                  size={24}
                  color={isSelected ? currentTheme.colors.primary : currentTheme.colors.textSecondary}
                />
                <Text style={[styles.timeLabel, { color: currentTheme.colors.text }]}>
                  {time.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={currentTheme.colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View entering={FadeInRight} style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: currentTheme.colors.text }]}>
        Invite an accountability buddy
      </Text>
      <Text style={[styles.stepSubtitle, { color: currentTheme.colors.textSecondary }]}>
        Optional: Share your journey with a friend
      </Text>
      <View style={styles.buddyContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text }]}
          placeholder="Friend's email (optional)"
          placeholderTextColor={currentTheme.colors.textSecondary}
          value={buddyEmail}
          onChangeText={setBuddyEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={[styles.infoCard, { backgroundColor: currentTheme.colors.surface }]}>
          <IconSymbol
            ios_icon_name="info.circle"
            android_material_icon_name="info"
            size={24}
            color={currentTheme.colors.primary}
          />
          <Text style={[styles.infoText, { color: currentTheme.colors.textSecondary }]}>
            Your buddy will receive an invite to join you on Momentum and support your habit journey
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color="#FFF"
              />
            </TouchableOpacity>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Welcome to Momentum</Text>
            <Text style={styles.headerSubtitle}>Step {step} of 4</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressSegment,
                { backgroundColor: s <= step ? '#FFF' : 'rgba(255,255,255,0.3)' }
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={step === 4 ? handleFinish : handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === 4 ? 'Start My Journey' : 'Continue'}
          </Text>
          <IconSymbol
            ios_icon_name="arrow.right"
            android_material_icon_name="arrow-forward"
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  habitName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  checkmark: {
    marginLeft: 12,
  },
  buddyContainer: {
    flex: 1,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
