
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '@/contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Platform } from 'react-native';
import { useHabits } from '@/hooks/useHabits';
import { HabitType, HabitSchedule, HABIT_COLORS, HABIT_ICONS, HABIT_TAGS } from '@/types/habit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FREE_HABIT_LIMIT = 3;

export default function AddHabitScreen() {
  const { addHabit, habits } = useHabits();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<HabitType>('yes_no');
  const [selectedSchedule, setSelectedSchedule] = useState<HabitSchedule>('daily');
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [scheduleCount, setScheduleCount] = useState('3');
  const { currentTheme } = useAppTheme();
  const router = useRouter();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (!user && habits.length >= FREE_HABIT_LIMIT) {
      Alert.alert(
        'Upgrade to Premium',
        `Free users can create up to ${FREE_HABIT_LIMIT} habits. Sign in to unlock unlimited habits!`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await addHabit({
        title,
        description,
        type: selectedType,
        schedule: selectedSchedule,
        scheduleDays: selectedSchedule === 'specific_days' ? selectedDays : undefined,
        scheduleCount: selectedSchedule === 'x_per_week' ? parseInt(scheduleCount) : undefined,
        icon: selectedIcon,
        color: selectedColor,
        tags: selectedTags,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Habit created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <LinearGradient
        colors={currentTheme.colors.gradient || [currentTheme.colors.primary, currentTheme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Habit</Text>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={[styles.label, { color: currentTheme.colors.text }]}>Habit Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text, borderColor: currentTheme.colors.primary + '30' }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Morning Run"
            placeholderTextColor={currentTheme.colors.textSecondary}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={[styles.label, { color: currentTheme.colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text, borderColor: currentTheme.colors.primary + '30' }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor={currentTheme.colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={[styles.label, { color: currentTheme.colors.text }]}>Type</Text>
          <View style={styles.optionsRow}>
            {(['yes_no', 'count', 'duration'] as HabitType[]).map((type, index) => (
              <React.Fragment key={`type-${index}`}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { borderColor: currentTheme.colors.primary + '30' },
                    selectedType === type && { backgroundColor: currentTheme.colors.primary, borderColor: currentTheme.colors.primary }
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.optionText, { color: selectedType === type ? '#FFFFFF' : currentTheme.colors.text }]}>
                    {type === 'yes_no' ? 'Yes/No' : type === 'count' ? 'Count' : 'Duration'}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={[styles.label, { color: currentTheme.colors.text }]}>Schedule</Text>
          <View style={styles.optionsRow}>
            {(['daily', 'specific_days', 'x_per_week'] as HabitSchedule[]).map((schedule, index) => (
              <React.Fragment key={`schedule-${index}`}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { borderColor: currentTheme.colors.primary + '30' },
                    selectedSchedule === schedule && { backgroundColor: currentTheme.colors.primary, borderColor: currentTheme.colors.primary }
                  ]}
                  onPress={() => setSelectedSchedule(schedule)}
                >
                  <Text style={[styles.optionText, { color: selectedSchedule === schedule ? '#FFFFFF' : currentTheme.colors.text }]}>
                    {schedule === 'daily' ? 'Daily' : schedule === 'specific_days' ? 'Specific Days' : 'X per Week'}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        {selectedSchedule === 'specific_days' && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <Text style={[styles.label, { color: currentTheme.colors.text }]}>Select Days</Text>
            <View style={styles.daysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <React.Fragment key={`day-${index}`}>
                  <TouchableOpacity
                    style={[
                      styles.dayButton,
                      { borderColor: currentTheme.colors.primary + '30' },
                      selectedDays.includes(index) && { backgroundColor: currentTheme.colors.primary, borderColor: currentTheme.colors.primary }
                    ]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text style={[styles.dayText, { color: selectedDays.includes(index) ? '#FFFFFF' : currentTheme.colors.text }]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        )}

        {selectedSchedule === 'x_per_week' && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <Text style={[styles.label, { color: currentTheme.colors.text }]}>Times per Week</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text, borderColor: currentTheme.colors.primary + '30' }]}
              value={scheduleCount}
              onChangeText={setScheduleCount}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor={currentTheme.colors.textSecondary}
            />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={[styles.label, { color: currentTheme.colors.text }]}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsScroll}>
            {HABIT_COLORS.map((color, index) => (
              <React.Fragment key={`color-${index}`}>
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
          <Text style={[styles.label, { color: currentTheme.colors.text }]}>Tags</Text>
          <View style={styles.tagsContainer}>
            {HABIT_TAGS.map((tag, index) => (
              <React.Fragment key={`tag-${index}`}>
                <TouchableOpacity
                  style={[
                    styles.tagButton,
                    { borderColor: currentTheme.colors.primary + '30' },
                    selectedTags.includes(tag) && { backgroundColor: currentTheme.colors.primary, borderColor: currentTheme.colors.primary }
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, { color: selectedTags.includes(tag) ? '#FFFFFF' : currentTheme.colors.text }]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800)} style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: currentTheme.colors.error }]}
            onPress={handleCancel}
          >
            <Text style={[styles.buttonText, { color: currentTheme.colors.error }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <LinearGradient
              colors={currentTheme.colors.gradient || [currentTheme.colors.primary, currentTheme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButtonGradient}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Create Habit</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorsScroll: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
