
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { HabitType, HabitSchedule, HabitTag, HABIT_COLORS, HABIT_ICONS, HABIT_TAGS } from '@/types/habit';
import { useHabits, useUserStats } from '@/hooks/useHabits';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function AddHabitScreenContent() {
  const theme = useTheme();
  const router = useRouter();
  const { addHabit } = useHabits();
  const { stats } = useUserStats();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<HabitType>('yes_no');
  const [schedule, setSchedule] = useState<HabitSchedule>('daily');
  const [selectedTags, setSelectedTags] = useState<HabitTag[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isPremium = stats.isPremium || false;

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = 
      title.trim() !== '' ||
      description.trim() !== '' ||
      selectedTags.length > 0 ||
      customTags.length > 0;
    setHasUnsavedChanges(hasChanges);
  }, [title, description, selectedTags, customTags]);

  // Handle back button press with confirmation
  useEffect(() => {
    const unsubscribe = router.addListener?.('beforeRemove', (e: any) => {
      if (!hasUnsavedChanges) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: "Don't leave", style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    });

    return unsubscribe;
  }, [hasUnsavedChanges, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    if (selectedTags.length === 0 && customTags.length === 0) {
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
        customTags: customTags.length > 0 ? customTags : undefined,
        color: selectedColor,
        icon: selectedIcon,
      });
      
      setHasUnsavedChanges(false);
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

  const addCustomTag = () => {
    const trimmedTag = customTagInput.trim();
    if (trimmedTag && !customTags.includes(trimmedTag)) {
      setCustomTags([...customTags, trimmedTag]);
      setCustomTagInput('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
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

          {/* Custom Tags (Premium Feature) */}
          {isPremium && (
            <View style={styles.section}>
              <View style={styles.premiumHeader}>
                <Text style={[styles.label, { color: theme.dark ? colors.textDark : colors.text }]}>
                  Custom Tags
                </Text>
                <View style={styles.premiumBadge}>
                  <IconSymbol
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={12}
                    color="#FFD700"
                  />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              </View>
              
              {/* Custom tag input */}
              <View style={styles.customTagInputRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.customTagInput,
                    { 
                      backgroundColor: theme.dark ? colors.cardDark : colors.card,
                      borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
                      color: theme.dark ? colors.textDark : colors.text,
                    }
                  ]}
                  placeholder="Add custom tag..."
                  placeholderTextColor={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
                  value={customTagInput}
                  onChangeText={setCustomTagInput}
                  onSubmitEditing={addCustomTag}
                />
                <TouchableOpacity
                  style={[styles.addTagButton, { backgroundColor: colors.primary }]}
                  onPress={addCustomTag}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Display custom tags */}
              {customTags.length > 0 && (
                <View style={styles.customTagsList}>
                  {customTags.map((tag, index) => (
                    <View
                      key={index}
                      style={[
                        styles.customTagChip,
                        { 
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                        }
                      ]}
                    >
                      <Text style={[styles.customTagText, { color: colors.primary }]}>
                        {tag}
                      </Text>
                      <TouchableOpacity onPress={() => removeCustomTag(tag)}>
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={18}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

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
                      ios_icon_name="checkmark"
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
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD70020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
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
  customTagInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  customTagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  customTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  customTagText: {
    fontSize: 14,
    fontWeight: '600',
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
