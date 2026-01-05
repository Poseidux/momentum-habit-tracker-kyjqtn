
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { HabitType, HabitSchedule, HabitTag, HABIT_COLORS, HABIT_ICONS, HABIT_TAGS } from '@/types/habit';
import { useHabits } from '@/hooks/useHabits';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AddHabitScreenContent() {
  const theme = useTheme();
  const router = useRouter();
  const { addHabit } = useHabits();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<HabitType>('yes_no');
  const [schedule, setSchedule] = useState<HabitSchedule>('daily');
  const [selectedTags, setSelectedTags] = useState<HabitTag[]>([]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    if (selectedTags.length === 0) {
      Alert.alert('Error', 'Please select at least one tag');
      return;
    }

    try {
      await addHabit({
        title: title.trim(),
        description: description.trim(),
        type,
        schedule,
        tags: selectedTags,
        color: selectedColor,
        icon: selectedIcon,
      });
      
      Alert.alert('Success', 'Habit created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    }
  };

  const toggleTag = (tag: HabitTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'New Habit',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: theme.dark ? colors.backgroundDark : colors.background,
          },
          headerTintColor: theme.dark ? colors.textDark : colors.text,
        }}
      />
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.dark ? colors.backgroundDark : colors.background }]}
        edges={['bottom']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
              Habit Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.dark ? colors.cardDark : colors.card,
                  borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
                  color: theme.dark ? colors.textDark : colors.text,
                }
              ]}
              placeholder="e.g., Morning Meditation"
              placeholderTextColor={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
              Description (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: theme.dark ? colors.cardDark : colors.card,
                  borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
                  color: theme.dark ? colors.textDark : colors.text,
                }
              ]}
              placeholder="Add a description..."
              placeholderTextColor={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Habit Type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
              Habit Type
            </Text>
            <View style={styles.optionsRow}>
              {(['yes_no', 'count', 'duration'] as HabitType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.optionButton,
                    type === t && { backgroundColor: colors.primary },
                    { borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder }
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text style={[
                    styles.optionText,
                    type === t && { color: '#FFFFFF' },
                    { color: theme.dark ? colors.textDark : colors.text }
                  ]}>
                    {t === 'yes_no' ? 'Yes/No' : t === 'count' ? 'Count' : 'Duration'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
              Schedule
            </Text>
            <View style={styles.optionsRow}>
              {(['daily', 'specific_days', 'x_per_week'] as HabitSchedule[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionButton,
                    schedule === s && { backgroundColor: colors.primary },
                    { borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder }
                  ]}
                  onPress={() => setSchedule(s)}
                >
                  <Text style={[
                    styles.optionText,
                    schedule === s && { color: '#FFFFFF' },
                    { color: theme.dark ? colors.textDark : colors.text }
                  ]}>
                    {s === 'daily' ? 'Daily' : s === 'specific_days' ? 'Specific Days' : 'X per Week'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
              Tags *
            </Text>
            <View style={styles.tagsGrid}>
              {HABIT_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    selectedTags.includes(tag) && { backgroundColor: colors.primary },
                    { borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder }
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[
                    styles.tagButtonText,
                    selectedTags.includes(tag) && { color: '#FFFFFF' },
                    { color: theme.dark ? colors.textDark : colors.text }
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Picker */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
              Color
            </Text>
            <View style={styles.colorsGrid}>
              {HABIT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <IconSymbol
                      ios_icon_name="check"
                      android_material_icon_name="check"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Icon Picker */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
              Icon
            </Text>
            <View style={styles.iconsGrid}>
              {HABIT_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    { borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder }
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <IconSymbol
                    ios_icon_name={icon}
                    android_material_icon_name={icon}
                    size={24}
                    color={selectedIcon === icon ? colors.primary : (theme.dark ? colors.textDark : colors.text)}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Create Habit</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default function AddHabitScreen() {
  return (
    <ProtectedRoute>
      <AddHabitScreenContent />
    </ProtectedRoute>
  );
}
