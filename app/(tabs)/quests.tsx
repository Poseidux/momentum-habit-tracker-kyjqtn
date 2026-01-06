
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits } from '@/hooks/useHabits';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface Quest {
  id: string;
  title: string;
  description: string;
  duration: number;
  reward: number;
  icon: string;
  color: string;
  progress: number;
  total: number;
  joined: boolean;
  completed: boolean;
}

const WEEKLY_QUESTS: Omit<Quest, 'progress' | 'joined' | 'completed'>[] = [
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all habits for 7 days straight',
    duration: 7,
    reward: 500,
    icon: 'star',
    color: '#F59E0B',
    total: 7,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Check in before 9 AM for 7 days',
    duration: 7,
    reward: 300,
    icon: 'wb-sunny',
    color: '#EF4444',
    total: 7,
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Maintain 80% completion rate for 7 days',
    duration: 7,
    reward: 400,
    icon: 'trending-up',
    color: '#10B981',
    total: 7,
  },
  {
    id: 'habit_explorer',
    title: 'Habit Explorer',
    description: 'Try 3 different habit types this week',
    duration: 7,
    reward: 250,
    icon: 'explore',
    color: '#06B6D4',
    total: 3,
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Complete 5 social habits this week',
    duration: 7,
    reward: 200,
    icon: 'group',
    color: '#EC4899',
    total: 5,
  },
  {
    id: 'wellness_warrior',
    title: 'Wellness Warrior',
    description: 'Complete 10 health habits this week',
    duration: 7,
    reward: 350,
    icon: 'favorite',
    color: '#EF4444',
    total: 10,
  },
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const { currentTheme } = useAppTheme();
  const { habits } = useHabits();

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const stored = await AsyncStorage.getItem('momentum_quests');
      if (stored) {
        const savedQuests = JSON.parse(stored);
        setQuests(savedQuests);
        setActiveQuests(savedQuests.filter((q: Quest) => q.joined && !q.completed));
        setCompletedQuests(savedQuests.filter((q: Quest) => q.completed));
      } else {
        const initialQuests = WEEKLY_QUESTS.map(q => ({
          ...q,
          progress: 0,
          joined: false,
          completed: false,
        }));
        setQuests(initialQuests);
        await AsyncStorage.setItem('momentum_quests', JSON.stringify(initialQuests));
      }
    } catch (error) {
      console.error('Error loading quests:', error);
    }
  };

  const handleJoinQuest = async (questId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const updatedQuests = quests.map(q => {
        if (q.id === questId) {
          return { ...q, joined: true };
        }
        return q;
      });
      setQuests(updatedQuests);
      setActiveQuests(updatedQuests.filter(q => q.joined && !q.completed));
      await AsyncStorage.setItem('momentum_quests', JSON.stringify(updatedQuests));
      Alert.alert('Quest Joined!', 'Good luck on your journey! 🎯');
    } catch (error) {
      console.error('Error joining quest:', error);
    }
  };

  const handleClaimReward = async (questId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const quest = quests.find(q => q.id === questId);
      if (quest) {
        Alert.alert(
          'Reward Claimed! 🎉',
          `You earned ${quest.reward} XP!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
        const updatedQuests = quests.map(q => {
          if (q.id === questId) {
            return { ...q, completed: true };
          }
          return q;
        });
        setQuests(updatedQuests);
        setActiveQuests(updatedQuests.filter(q => q.joined && !q.completed));
        setCompletedQuests(updatedQuests.filter(q => q.completed));
        await AsyncStorage.setItem('momentum_quests', JSON.stringify(updatedQuests));
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const availableQuests = quests.filter(q => !q.joined && !q.completed);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Quests</Text>
        <Text style={styles.headerSubtitle}>Complete challenges, earn rewards</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Active Quests ({activeQuests.length})
            </Text>
            {activeQuests.map((quest, index) => (
              <Animated.View key={quest.id} entering={FadeInDown.delay(index * 100)}>
                <View style={[styles.questCard, { backgroundColor: currentTheme.colors.surface }]}>
                  <View style={[styles.questIcon, { backgroundColor: quest.color + '20' }]}>
                    <IconSymbol
                      ios_icon_name={quest.icon}
                      android_material_icon_name={quest.icon}
                      size={32}
                      color={quest.color}
                    />
                  </View>
                  <View style={styles.questInfo}>
                    <Text style={[styles.questTitle, { color: currentTheme.colors.text }]}>
                      {quest.title}
                    </Text>
                    <Text style={[styles.questDescription, { color: currentTheme.colors.textSecondary }]}>
                      {quest.description}
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { backgroundColor: currentTheme.colors.background }]}>
                        <View
                          style={[
                            styles.progressFill,
                            { backgroundColor: quest.color, width: `${(quest.progress / quest.total) * 100}%` }
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: currentTheme.colors.textSecondary }]}>
                        {quest.progress}/{quest.total}
                      </Text>
                    </View>
                    <View style={styles.rewardContainer}>
                      <IconSymbol
                        ios_icon_name="star.fill"
                        android_material_icon_name="star"
                        size={16}
                        color="#F59E0B"
                      />
                      <Text style={[styles.rewardText, { color: currentTheme.colors.text }]}>
                        {quest.reward} XP
                      </Text>
                    </View>
                  </View>
                  {quest.progress >= quest.total && (
                    <TouchableOpacity
                      style={[styles.claimButton, { backgroundColor: quest.color }]}
                      onPress={() => handleClaimReward(quest.id)}
                    >
                      <Text style={styles.claimButtonText}>Claim</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Available Quests */}
        {availableQuests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Available Quests
            </Text>
            {availableQuests.map((quest, index) => (
              <Animated.View key={quest.id} entering={FadeInDown.delay((activeQuests.length + index) * 100)}>
                <View style={[styles.questCard, { backgroundColor: currentTheme.colors.surface }]}>
                  <View style={[styles.questIcon, { backgroundColor: quest.color + '20' }]}>
                    <IconSymbol
                      ios_icon_name={quest.icon}
                      android_material_icon_name={quest.icon}
                      size={32}
                      color={quest.color}
                    />
                  </View>
                  <View style={styles.questInfo}>
                    <Text style={[styles.questTitle, { color: currentTheme.colors.text }]}>
                      {quest.title}
                    </Text>
                    <Text style={[styles.questDescription, { color: currentTheme.colors.textSecondary }]}>
                      {quest.description}
                    </Text>
                    <View style={styles.questMeta}>
                      <View style={styles.metaItem}>
                        <IconSymbol
                          ios_icon_name="calendar"
                          android_material_icon_name="calendar-today"
                          size={14}
                          color={currentTheme.colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: currentTheme.colors.textSecondary }]}>
                          {quest.duration} days
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <IconSymbol
                          ios_icon_name="star.fill"
                          android_material_icon_name="star"
                          size={14}
                          color="#F59E0B"
                        />
                        <Text style={[styles.metaText, { color: currentTheme.colors.text }]}>
                          {quest.reward} XP
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: quest.color }]}
                    onPress={() => handleJoinQuest(quest.id)}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Completed ({completedQuests.length})
            </Text>
            {completedQuests.map((quest, index) => (
              <Animated.View key={quest.id} entering={FadeInDown.delay(index * 100)}>
                <View style={[styles.questCard, { backgroundColor: currentTheme.colors.surface, opacity: 0.7 }]}>
                  <View style={[styles.questIcon, { backgroundColor: quest.color + '20' }]}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={32}
                      color={quest.color}
                    />
                  </View>
                  <View style={styles.questInfo}>
                    <Text style={[styles.questTitle, { color: currentTheme.colors.text }]}>
                      {quest.title}
                    </Text>
                    <Text style={[styles.completedText, { color: currentTheme.colors.success }]}>
                      ✓ Completed
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {quests.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="flag"
              android_material_icon_name="flag"
              size={64}
              color={currentTheme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: currentTheme.colors.textSecondary }]}>
              No quests available yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  questCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  questIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  claimButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
