
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';

export default function HabitDetailScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { habits, deleteHabit } = useHabits();
  const { id } = useLocalSearchParams();

  const habit = habits.find(h => h.id === id);

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(id as string);
              router.back();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const getStrengthColor = () => {
    const strength = habit?.currentStreak || 0;
    if (strength >= 21) return theme.colors.success;
    if (strength >= 7) return theme.colors.primary;
    return theme.colors.textSecondary;
  };

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Habit not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: habit.name,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.iconContainer, { backgroundColor: habit.color || theme.colors.primary }]}>
          <Text style={styles.iconEmoji}>{habit.icon.emoji}</Text>
        </View>

        <Text style={[styles.habitName, { color: theme.colors.text }]}>{habit.name}</Text>
        {habit.description && (
          <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>
            {habit.description}
          </Text>
        )}

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface + 'CC' }]}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {habit.currentStreak || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface + 'CC' }]}>
            <Text style={[styles.statValue, { color: getStrengthColor() }]}>
              {Math.min(100, ((habit.currentStreak || 0) / 21) * 100).toFixed(0)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Strength</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Type:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {habit.type === 'yes_no' ? 'Yes/No' : habit.type === 'count' ? 'Count' : 'Duration'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Schedule:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {habit.schedule === 'daily' ? 'Daily' : habit.schedule === 'weekly' ? `${habit.timesPerWeek}x per week` : 'Specific Days'}
            </Text>
          </View>
          {habit.tags && habit.tags.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {habit.tags.map((tag, index) => (
                  <View key={`tag-${index}`} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
          onPress={handleDelete}
        >
          <IconSymbol name="delete" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete Habit</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 40,
  },
  habitName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  habitDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
