
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { HabitType, HabitSchedule, HABIT_COLORS, HABIT_ICONS, HABIT_TAGS } from '@/types/habit';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';

const FREE_HABIT_LIMIT = 5;

export default function AddHabitScreen() {
  const { addHabit, habits } = useHabits();
  const { user } = useAuth();
  const { isDark, colors } = useAppTheme();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<HabitType>('yes_no');
  const [selectedSchedule, setSelectedSchedule] = useState<HabitSchedule>('daily');
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState('3');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (!user?.isPremium && habits.length >= FREE_HABIT_LIMIT) {
      Alert.alert(
        'Upgrade to Premium',
        `Free users can create up to ${FREE_HABIT_LIMIT} habits. Upgrade to unlock unlimited habits!`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await addHabit({
        name,
        type: selectedType,
        schedule: selectedSchedule,
        specificDays: selectedSchedule === 'specific_days' ? selectedDays : undefined,
        timesPerWeek: selectedSchedule === 'x_per_week' ? parseInt(timesPerWeek) : undefined,
        icon: selectedIcon,
        color: selectedColor,
        tags: selectedTags,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit');
    }
  };

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDay = (dayIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'New Habit',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Habit Name */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Habit Name</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: colors.surface, 
                color: colors.text, 
                borderColor: colors.border 
              }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Morning meditation"
            placeholderTextColor={colors.textTertiary}
            autoFocus
          />
        </Animated.View>

        {/* Type */}
        <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Type</Text>
          <View style={styles.segmentedControl}>
            {(['yes_no', 'count', 'duration'] as HabitType[]).map((type, index) => (
              <Pressable
                key={`type-${index}`}
                style={({ pressed }) => [
                  styles.segment,
                  { 
                    backgroundColor: selectedType === type ? colors.accent : colors.surface,
                    borderColor: selectedType === type ? colors.accent : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  setSelectedType(type);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[
                  styles.segmentText,
                  { color: selectedType === type ? '#FFFFFF' : colors.text }
                ]}>
                  {type === 'yes_no' ? 'Yes/No' : type === 'count' ? 'Count' : 'Duration'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Schedule */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Schedule</Text>
          <View style={styles.segmentedControl}>
            {(['daily', 'specific_days', 'x_per_week'] as HabitSchedule[]).map((schedule, index) => (
              <Pressable
                key={`schedule-${index}`}
                style={({ pressed }) => [
                  styles.segment,
                  { 
                    backgroundColor: selectedSchedule === schedule ? colors.accent : colors.surface,
                    borderColor: selectedSchedule === schedule ? colors.accent : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  setSelectedSchedule(schedule);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[
                  styles.segmentText,
                  { color: selectedSchedule === schedule ? '#FFFFFF' : colors.text }
                ]}>
                  {schedule === 'daily' ? 'Daily' : schedule === 'specific_days' ? 'Days' : 'X/Week'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Specific Days */}
        {selectedSchedule === 'specific_days' && (
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Select Days</Text>
            <View style={styles.daysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Pressable
                  key={`day-${index}`}
                  style={({ pressed }) => [
                    styles.dayButton,
                    { 
                      backgroundColor: selectedDays.includes(index) ? colors.accent : colors.surface,
                      borderColor: selectedDays.includes(index) ? colors.accent : colors.border,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text style={[
                    styles.dayText,
                    { color: selectedDays.includes(index) ? '#FFFFFF' : colors.text }
                  ]}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Times Per Week */}
        {selectedSchedule === 'x_per_week' && (
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Times per Week</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.surface, 
                  color: colors.text, 
                  borderColor: colors.border 
                }
              ]}
              value={timesPerWeek}
              onChangeText={setTimesPerWeek}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor={colors.textTertiary}
            />
          </Animated.View>
        )}

        {/* Tags */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Tags (Optional)</Text>
          <View style={styles.tagsContainer}>
            {HABIT_TAGS.map((tag, index) => (
              <Pressable
                key={`tag-${index}`}
                style={({ pressed }) => [
                  styles.tagButton,
                  { 
                    backgroundColor: selectedTags.includes(tag) ? colors.accent + '20' : colors.surface,
                    borderColor: selectedTags.includes(tag) ? colors.accent : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagButtonText,
                  { color: selectedTags.includes(tag) ? colors.accent : colors.text }
                ]}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Color Picker */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Color (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsScroll}>
            {HABIT_COLORS.map((color, index) => (
              <Pressable
                key={`color-${index}`}
                style={({ pressed }) => [
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  setSelectedColor(color);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                {selectedColor === color && (
                  <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color="#FFF" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Create Habit</Text>
          </Pressable>
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  
  // Section
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  
  // Input
  input: {
    ...typography.body,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  
  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  segmentText: {
    ...typography.body,
    fontWeight: '500',
  },
  
  // Days
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayText: {
    ...typography.label,
    fontWeight: '600',
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  tagButtonText: {
    ...typography.caption,
    fontWeight: '500',
  },
  
  // Colors
  colorsScroll: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  
  // Save Button
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  saveButtonText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
