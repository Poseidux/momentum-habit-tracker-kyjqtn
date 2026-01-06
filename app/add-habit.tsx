
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

export default function AddHabitScreen() {
  const { addHabit } = useHabits();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<HabitType>('yes_no');
  const [selectedSchedule, setSelectedSchedule] = useState<HabitSchedule>('daily');
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState('3');
  const [goal, setGoal] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState<string | undefined>();
  const { theme } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    if (title.trim() || description.trim() || selectedTags.length > 0 || customTags.length > 0) {
      // Form has data
    }
  }, [title, description, selectedTags, customTags]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      await addHabit({
        name: title,
        description,
        type: selectedType,
        icon: selectedIcon,
        customIconUrl,
        schedule: selectedSchedule,
        days: selectedDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]),
        timesPerWeek: selectedSchedule === 'weekly' ? parseInt(timesPerWeek) : undefined,
        goal: goal ? parseInt(goal) : undefined,
        tags: [...selectedTags, ...customTags],
        color: selectedColor,
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

  const handleAddCustomTag = () => {
    if (customTagInput.trim() && !customTags.includes(customTagInput.trim())) {
      setCustomTags([...customTags, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const pickCustomIcon = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCustomIconUrl(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Add Habit',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Habit Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface + 'CC', color: theme.colors.text, borderColor: theme.colors.primary }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Morning Run"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surface + 'CC', color: theme.colors.text, borderColor: theme.colors.primary }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Type</Text>
          <View style={styles.optionsRow}>
            {(['yes_no', 'count', 'duration'] as HabitType[]).map((type, index) => (
              <TouchableOpacity
                key={`type-${index}`}
                style={[
                  styles.optionButton,
                  { borderColor: theme.colors.primary },
                  selectedType === type && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.optionText, { color: selectedType === type ? '#FFFFFF' : theme.colors.text }]}>
                  {type === 'yes_no' ? 'Yes/No' : type === 'count' ? 'Count' : 'Duration'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Schedule</Text>
          <View style={styles.optionsRow}>
            {(['daily', 'weekly', 'specific_days'] as HabitSchedule[]).map((schedule, index) => (
              <TouchableOpacity
                key={`schedule-${index}`}
                style={[
                  styles.optionButton,
                  { borderColor: theme.colors.primary },
                  selectedSchedule === schedule && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedSchedule(schedule)}
              >
                <Text style={[styles.optionText, { color: selectedSchedule === schedule ? '#FFFFFF' : theme.colors.text }]}>
                  {schedule === 'daily' ? 'Daily' : schedule === 'weekly' ? 'Weekly' : 'Specific Days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedSchedule === 'specific_days' && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Select Days</Text>
            <View style={styles.daysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <TouchableOpacity
                  key={`day-${index}`}
                  style={[
                    styles.dayButton,
                    { borderColor: theme.colors.primary },
                    selectedDays.includes(index) && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text style={[styles.dayText, { color: selectedDays.includes(index) ? '#FFFFFF' : theme.colors.text }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedSchedule === 'weekly' && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Times per Week</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface + 'CC', color: theme.colors.text, borderColor: theme.colors.primary }]}
              value={timesPerWeek}
              onChangeText={setTimesPerWeek}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconsScroll}>
            {HABIT_ICONS.map((icon, index) => (
              <TouchableOpacity
                key={`icon-${index}`}
                style={[
                  styles.iconButton,
                  { borderColor: theme.colors.primary },
                  selectedIcon === icon && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconEmoji}>{icon.emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.iconButton, { borderColor: theme.colors.primary }]}
              onPress={pickCustomIcon}
            >
              <IconSymbol name="photo" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </ScrollView>
          {customIconUrl && (
            <Image source={{ uri: customIconUrl }} style={styles.customIconPreview} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsScroll}>
            {HABIT_COLORS.map((color, index) => (
              <TouchableOpacity
                key={`color-${index}`}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Tags</Text>
          <View style={styles.tagsContainer}>
            {HABIT_TAGS.map((tag, index) => (
              <TouchableOpacity
                key={`tag-${index}`}
                style={[
                  styles.tagButton,
                  { borderColor: theme.colors.primary },
                  selectedTags.includes(tag) && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, { color: selectedTags.includes(tag) ? '#FFFFFF' : theme.colors.text }]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customTagRow}>
            <TextInput
              style={[styles.input, styles.customTagInput, { backgroundColor: theme.colors.surface + 'CC', color: theme.colors.text, borderColor: theme.colors.primary }]}
              value={customTagInput}
              onChangeText={setCustomTagInput}
              placeholder="Add custom tag"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TouchableOpacity
              style={[styles.addTagButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddCustomTag}
            >
              <IconSymbol name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {customTags.length > 0 && (
            <View style={styles.customTagsContainer}>
              {customTags.map((tag, index) => (
                <View key={`custom-tag-${index}`} style={[styles.customTag, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.customTagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeCustomTag(tag)}>
                    <IconSymbol name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {(selectedType === 'count' || selectedType === 'duration') && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Goal {selectedType === 'count' ? '(count)' : '(minutes)'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface + 'CC', color: theme.colors.text, borderColor: theme.colors.primary }]}
              value={goal}
              onChangeText={setGoal}
              keyboardType="number-pad"
              placeholder={selectedType === 'count' ? '10' : '30'}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: theme.colors.error }]}
            onPress={handleCancel}
          >
            <Text style={[styles.buttonText, { color: theme.colors.error }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Save Habit</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
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
    padding: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  iconsScroll: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 28,
  },
  customIconPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: 12,
  },
  colorsScroll: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
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
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  customTagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  customTagText: {
    color: '#FFFFFF',
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
