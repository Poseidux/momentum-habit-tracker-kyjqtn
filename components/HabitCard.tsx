
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { Habit } from '@/types/habit';
import { colors } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface HabitCardProps {
  habit: Habit;
  onCheckIn: () => void;
  onPress: () => void;
  isCheckedToday?: boolean;
}

export default function HabitCard({ habit, onCheckIn, onPress, isCheckedToday = false }: HabitCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate check button
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    
    onCheckIn();
  };

  const getStreakColor = () => {
    if (habit.currentStreak >= 7) return colors.success;
    if (habit.currentStreak >= 3) return colors.warning;
    return colors.textSecondary;
  };

  const getStrengthColor = () => {
    if (habit.habitStrength >= 70) return colors.strengthStrong;
    if (habit.habitStrength >= 40) return colors.strengthMedium;
    return colors.strengthWeak;
  };

  return (
    <Animated.View style={cardStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          { 
            backgroundColor: theme.dark ? colors.cardDark : colors.card,
            borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.habitInfo}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
              <IconSymbol
                ios_icon_name={habit.icon}
                android_material_icon_name={habit.icon}
                size={24}
                color={habit.color}
              />
            </View>
            <View style={styles.habitText}>
              <Text style={[styles.habitTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
                {habit.title}
              </Text>
              <View style={styles.tagsContainer}>
                {habit.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: habit.color + '15' }]}>
                    <Text style={[styles.tagText, { color: habit.color }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          <Animated.View style={checkButtonStyle}>
            <TouchableOpacity
              style={[
                styles.checkButton,
                isCheckedToday && { backgroundColor: colors.success }
              ]}
              onPress={handleCheckIn}
              disabled={isCheckedToday}
            >
              {isCheckedToday ? (
                <IconSymbol
                  ios_icon_name="check"
                  android_material_icon_name="check"
                  size={24}
                  color="#FFFFFF"
                />
              ) : (
                <View style={[styles.checkCircle, { borderColor: habit.color }]} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <IconSymbol
              ios_icon_name="local-fire-department"
              android_material_icon_name="local-fire-department"
              size={16}
              color={getStreakColor()}
            />
            <Text style={[styles.statText, { color: getStreakColor() }]}>
              {habit.currentStreak} day streak
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              {habit.consistencyPercent}% consistent
            </Text>
          </View>
        </View>

        <View style={styles.strengthContainer}>
          <Text style={[styles.strengthLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
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
            {habit.habitStrength}%
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitText: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  strengthContainer: {
    gap: 6,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  strengthBar: {
    height: 6,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthPercent: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});
