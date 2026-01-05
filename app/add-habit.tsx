
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { useHabits } from '@/hooks/useHabits';
import { useAuth } from '@/contexts/AuthContext';
import { HabitType, HabitSchedule, HABIT_COLORS, HABIT_ICONS, HABIT_TAGS } from '@/types/habit';

export default function AddHabitScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<HabitType>('yes_no');
  const [selectedSchedule, setSelectedSchedule] = useState<HabitSchedule>('daily');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customIconUri, setCustomIconUri] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { addHabit, habits } = useHabits();
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const isPremium = user?.isPremium || false;
  const canCreateMoreHabits = isPremium || habits.length < 3;

  useEffect(() => {
    setHasUnsavedChanges(
      title.trim() !== '' || description.trim() !== '' || selectedTags.length > 0 || customTags.length > 0
    );
  }, [title, description, selectedTags, customTags]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    if (!canCreateMoreHabits) {
      Alert.alert(
        'Upgrade to Premium',
        'Free users can only create up to 3 habits. Upgrade to Premium for unlimited habits!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/auth/sign-in' as any) },
        ]
      );
      return;
    }

    try {
      // TODO: Backend Integration - Create habit via API endpoint
      await addHabit({
        title: title.trim(),
        description: description.trim(),
        type: selectedType,
        schedule: selectedSchedule,
        color: selectedColor,
        icon: selectedIcon,
        customIconUrl: customIconUri || undefined,
        tags: [...selectedTags, ...customTags],
      } as any);

      Alert.alert('Success', 'Habit created successfully!');
      setHasUnsavedChanges(false);
      router.back();
    } catch (error: any) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', error.message || 'Failed to create habit');
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
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
    } else {
      router.back();
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Custom tags are only available for Premium users. Upgrade now!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/auth/sign-in' as any) },
        ]
      );
      return;
    }

    if (Platform.OS === 'web') {
      const text = prompt('Enter tag name:');
      if (text && text.trim() && !customTags.includes(text.trim())) {
        setCustomTags([...customTags, text.trim()]);
      }
    } else {
      Alert.prompt('Add Custom Tag', 'Enter tag name:', (text) => {
        if (text && text.trim() && !customTags.includes(text.trim())) {
          setCustomTags([...customTags, text.trim()]);
        }
      });
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const pickCustomIcon = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Custom icons are only available for Premium users. Upgrade now!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/auth/sign-in' as any) },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCustomIconUri(result.assets[0].uri);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Habit',
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={{ color: theme.colors.primary, fontSize: 17 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ color: theme.colors.primary, fontSize: 17, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              placeholder="e.g., Morning meditation"
              placeholderTextColor={theme.colors.text + '80'}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              placeholder="Optional notes about this habit"
              placeholderTextColor={theme.colors.text + '80'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Habit Type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Type</Text>
            <View style={styles.optionsRow}>
              {(['yes_no', 'count', 'duration'] as HabitType[]).map((type, index) => (
                <TouchableOpacity
                  key={`type-${index}`}
                  style={[
                    styles.optionButton,
                    { backgroundColor: theme.colors.card },
                    selectedType === type && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      selectedType === type && { color: '#FFFFFF' },
                    ]}
                  >
                    {type === 'yes_no' ? 'Yes/No' : type === 'count' ? 'Count' : 'Duration'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Schedule</Text>
            <View style={styles.optionsRow}>
              {(['daily', 'specific_days', 'x_per_week'] as HabitSchedule[]).map((schedule, index) => (
                <TouchableOpacity
                  key={`schedule-${index}`}
                  style={[
                    styles.optionButton,
                    { backgroundColor: theme.colors.card },
                    selectedSchedule === schedule && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setSelectedSchedule(schedule)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      selectedSchedule === schedule && { color: '#FFFFFF' },
                    ]}
                  >
                    {schedule === 'daily' ? 'Daily' : schedule === 'specific_days' ? 'Specific Days' : 'X per Week'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Color</Text>
            <View style={styles.colorGrid}>
              {HABIT_COLORS.map((color, index) => (
                <TouchableOpacity
                  key={`color-${index}`}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon, index) => (
                <TouchableOpacity
                  key={`icon-${index}`}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.colors.card },
                    selectedIcon === icon && { backgroundColor: theme.colors.primary + '30' },
                  ]}
                  onPress={() => {
                    setSelectedIcon(icon);
                    setCustomIconUri(null);
                  }}
                >
                  <IconSymbol 
                    ios_icon_name={icon.ios} 
                    android_material_icon_name={icon.android} 
                    size={24} 
                    color={selectedIcon === icon ? theme.colors.primary : theme.colors.text} 
                  />
                </TouchableOpacity>
              ))}
              {/* Custom Icon Upload */}
              <TouchableOpacity
                style={[
                  styles.iconOption, 
                  { backgroundColor: theme.colors.card },
                  customIconUri && { backgroundColor: theme.colors.primary + '30' }
                ]}
                onPress={pickCustomIcon}
              >
                {customIconUri ? (
                  <Image source={{ uri: customIconUri }} style={styles.customIcon} />
                ) : (
                  <IconSymbol 
                    ios_icon_name="photo" 
                    android_material_icon_name="photo" 
                    size={24} 
                    color={theme.colors.text} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Tags</Text>
            <View style={styles.tagsContainer}>
              {HABIT_TAGS.map((tag, index) => (
                <TouchableOpacity
                  key={`tag-${index}`}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.card },
                    selectedTags.includes(tag) && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: theme.colors.text },
                      selectedTags.includes(tag) && { color: '#FFFFFF' },
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
              {/* Add Custom Tag Button */}
              <TouchableOpacity
                style={[styles.tag, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.primary }]}
                onPress={handleAddCustomTag}
              >
                <IconSymbol 
                  ios_icon_name="plus" 
                  android_material_icon_name="add" 
                  size={16} 
                  color={theme.colors.primary} 
                />
              </TouchableOpacity>
            </View>

            {/* Custom Tags Display */}
            {customTags.length > 0 && (
              <View style={[styles.tagsContainer, { marginTop: 8 }]}>
                {customTags.map((tag, index) => (
                  <View key={`custom-tag-${index}`} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.tagText, { color: '#FFFFFF' }]}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeCustomTag(tag)} style={styles.removeTag}>
                      <IconSymbol 
                        ios_icon_name="xmark" 
                        android_material_icon_name="close" 
                        size={12} 
                        color="#FFFFFF" 
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Free User Limit Warning */}
          {!isPremium && habits.length >= 2 && (
            <View style={[styles.warningBox, { backgroundColor: '#FFF3CD' }]}>
              <Text style={styles.warningText}>
                {habits.length === 2
                  ? '⚠️ You can create 1 more habit on the free plan'
                  : '⚠️ Free plan limit reached (3 habits). Upgrade to Premium for unlimited habits!'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    padding: 16,
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
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeTag: {
    marginLeft: 4,
  },
  warningBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
  },
});
