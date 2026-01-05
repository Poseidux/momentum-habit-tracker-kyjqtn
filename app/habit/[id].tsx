
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useHabits } from '@/hooks/useHabits';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function HabitDetailScreenContent() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { habits, deleteHabit } = useHabits();

  const habit = habits.find(h => h.id === id);

  if (!habit) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Habit Details',
            headerBackTitle: 'Back',
          }}
        />
        <View style={[styles.container, { backgroundColor: theme.dark ? colors.backgroundDark : colors.background }]}>
          <Text style={[styles.errorText, { color: theme.dark ? colors.textDark : colors.text }]}>
            Habit not found
          </Text>
        </View>
      </>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habit.id);
            router.back();
          },
        },
      ]
    );
  };

  const getStrengthColor = () => {
    if (habit.habitStrength >= 70) return colors.strengthStrong;
    if (habit.habitStrength >= 40) return colors.strengthMedium;
    return colors.strengthWeak;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: habit.title,
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
          {/* Habit Header */}
          <View style={[
            styles.headerCard,
            { 
              backgroundColor: habit.color + '15',
              borderColor: habit.color + '30',
            }
          ]}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
              <IconSymbol
                ios_icon_name={habit.icon}
                android_material_icon_name={habit.icon}
                size={48}
                color="#FFFFFF"
              />
            </View>
            <Text style={[styles.habitTitle, { color: habit.color }]}>
              {habit.title}
            </Text>
            {habit.description && (
              <Text style={[styles.habitDescription, { color: habit.color }]}>
                {habit.description}
              </Text>
            )}
            <View style={styles.tagsContainer}>
              {habit.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: habit.color }]}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}>
              <IconSymbol
                ios_icon_name="local-fire-department"
                android_material_icon_name="local-fire-department"
                size={32}
                color={colors.warning}
              />
              <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                {habit.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Current Streak
              </Text>
            </View>

            <View style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}>
              <IconSymbol
                ios_icon_name="star"
                android_material_icon_name="star"
                size={32}
                color={colors.xpGold}
              />
              <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                {habit.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Best Streak
              </Text>
            </View>

            <View style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}>
              <IconSymbol
                ios_icon_name="check-circle"
                android_material_icon_name="check-circle"
                size={32}
                color={colors.success}
              />
              <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                {habit.totalCompletions}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Total Check-ins
              </Text>
            </View>

            <View style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}>
              <IconSymbol
                ios_icon_name="trending-up"
                android_material_icon_name="trending-up"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                {habit.consistencyPercent}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Consistency
              </Text>
            </View>
          </View>

          {/* Habit Strength */}
          <View style={[
            styles.strengthCard,
            { 
              backgroundColor: theme.dark ? colors.cardDark : colors.card,
              borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
            }
          ]}>
            <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
              Habit Strength
            </Text>
            <View style={styles.strengthBar}>
              <View 
                style={[
                  styles.strengthFill, 
                  { 
                    width: `${habit.habitStrength}%`,
                    backgroundColor: getStrengthColor()
                  }
                ]} 
              />
            </View>
            <Text style={[styles.strengthPercent, { color: getStrengthColor() }]}>
              {habit.habitStrength}% Strong
            </Text>
            <Text style={[styles.strengthDescription, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              Keep checking in daily to build a stronger habit!
            </Text>
          </View>

          {/* Calendar Heatmap Placeholder */}
          <View style={[
            styles.calendarCard,
            { 
              backgroundColor: theme.dark ? colors.cardDark : colors.card,
              borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
            }
          ]}>
            <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
              Activity Calendar
            </Text>
            <View style={styles.calendarPlaceholder}>
              <IconSymbol
                ios_icon_name="calendar-today"
                android_material_icon_name="calendar-today"
                size={48}
                color={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
              />
              <Text style={[styles.placeholderText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Calendar heatmap coming soon
              </Text>
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.danger }]}
            onPress={handleDelete}
          >
            <IconSymbol
              ios_icon_name="delete"
              android_material_icon_name="delete"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.deleteButtonText}>Delete Habit</Text>
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
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 40,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  habitTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  habitDescription: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  strengthCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  strengthBar: {
    height: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 6,
  },
  strengthPercent: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  strengthDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  calendarPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default function HabitDetailScreen() {
  return (
    <ProtectedRoute>
      <HabitDetailScreenContent />
    </ProtectedRoute>
  );
}
