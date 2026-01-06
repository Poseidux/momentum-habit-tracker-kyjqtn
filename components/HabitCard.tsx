
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { IconSymbol } from './IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { Habit } from '@/types/habit';

interface HabitCardProps {
  habit: Habit;
  onCheckIn: () => void;
  onPress: () => void;
  isCheckedToday?: boolean;
}

export default function HabitCard({ habit, onCheckIn, onPress, isCheckedToday = false }: HabitCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCheckIn = () => {
    // Haptics feedback (native only)
    if (Platform.OS !== 'web') {
      // Optional: Add haptics if needed
    }
    scale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    onCheckIn();
  };

  const getStreakColor = () => {
    if (habit.currentStreak >= 30) return colors.streakGold;
    if (habit.currentStreak >= 7) return colors.streakSilver;
    return colors.accent;
  };

  const getStrengthColor = () => {
    if (habit.habitStrength >= 80) return colors.success;
    if (habit.habitStrength >= 50) return colors.warning;
    return colors.error;
  };

  // Parse icon if it's an object
  const iconData = typeof habit.icon === 'string' 
    ? { ios: habit.icon, android: habit.icon } 
    : habit.icon;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          { 
            backgroundColor: theme.dark ? colors.cardDark : colors.card,
            borderColor: habit.color,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
            <IconSymbol
              ios_icon_name={iconData.ios}
              android_material_icon_name={iconData.android}
              size={28}
              color={habit.color}
            />
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.dark ? colors.textDark : colors.text }]}>
              {habit.title}
            </Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <IconSymbol
                  ios_icon_name="flame.fill"
                  android_material_icon_name="local-fire-department"
                  size={14}
                  color={getStreakColor()}
                />
                <Text style={[styles.statText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                  {habit.currentStreak} day streak
                </Text>
              </View>
              <View style={styles.stat}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="bar-chart"
                  size={14}
                  color={getStrengthColor()}
                />
                <Text style={[styles.statText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                  {Math.round(habit.habitStrength || 0)}% strength
                </Text>
              </View>
            </View>
          </View>

          {/* Check-in Button */}
          <TouchableOpacity
            style={[
              styles.checkButton,
              { 
                backgroundColor: isCheckedToday ? colors.success : habit.color,
              }
            ]}
            onPress={handleCheckIn}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name={isCheckedToday ? 'checkmark' : 'plus'}
              android_material_icon_name={isCheckedToday ? 'check' : 'add'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
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
    borderLeftWidth: 4,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
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
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
