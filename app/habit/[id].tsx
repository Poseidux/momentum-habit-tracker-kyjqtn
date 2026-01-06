
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function HabitDetailScreen() {
  const { isDark, colors } = useAppTheme();
  const router = useRouter();
  const { habits, deleteHabit } = useHabits();
  const { id } = useLocalSearchParams();

  const habit = habits.find(h => h.id === id);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/add-habit?id=${id}`);
  };

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Habit',
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

  const consistency = habit.totalCheckIns > 0 
    ? Math.round((habit.currentStreak / habit.totalCheckIns) * 100) 
    : 0;
  const habitStrength = Math.min(100, (habit.currentStreak / 21) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              onPress={handleEdit}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.6 }
              ]}
            >
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={20}
                color={colors.accent}
              />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.surface }]}>
            <IconSymbol
              ios_icon_name={habit.icon}
              android_material_icon_name={habit.icon}
              size={48}
              color={colors.accent}
            />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{habit.name}</Text>
          {habit.tags && habit.tags.length > 0 && (
            <View style={styles.heroTags}>
              {habit.tags.map((tag, index) => (
                <View key={`tag-${index}`} style={[styles.tag, { backgroundColor: colors.accent + '15' }]}>
                  <Text style={[styles.tagText, { color: colors.accent }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{consistency}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Consistency</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{habit.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{Math.round(habitStrength)}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Strength</Text>
          </View>
        </Animated.View>

        {/* Heatmap */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Activity</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Last 30 days</Text>
          
          <View style={styles.heatmapGrid}>
            {Array.from({ length: 30 }).map((_, index) => {
              const intensity = Math.random();
              const bgColor = intensity > 0.7 
                ? colors.accent 
                : intensity > 0.4 
                ? colors.accent + '60' 
                : colors.progressBg;
              
              return (
                <View
                  key={`cell-${index}`}
                  style={[styles.heatmapCell, { backgroundColor: bgColor }]}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Details */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Type</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {habit.type === 'yes_no' ? 'Yes/No' : habit.type === 'count' ? 'Count' : 'Duration'}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Schedule</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {habit.schedule === 'daily' 
                ? 'Daily' 
                : habit.schedule === 'x_per_week' 
                ? `${habit.timesPerWeek}x per week` 
                : 'Specific Days'}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Check-ins</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{habit.totalCheckIns}</Text>
          </View>
        </Animated.View>

        {/* Delete Button */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              { backgroundColor: colors.error + '15', borderColor: colors.error },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleDelete}
          >
            <IconSymbol ios_icon_name="trash" android_material_icon_name="delete" size={20} color={colors.error} />
            <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete Habit</Text>
          </Pressable>
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
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
  headerButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  
  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  heroTitle: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.micro,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.section,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
  },
  
  // Card
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    ...typography.section,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  
  // Heatmap
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  heatmapCell: {
    width: 24,
    height: 24,
    borderRadius: spacing.xs,
  },
  
  // Details
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailLabel: {
    ...typography.body,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  
  // Delete Button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  deleteButtonText: {
    ...typography.label,
    fontWeight: '600',
  },
});
