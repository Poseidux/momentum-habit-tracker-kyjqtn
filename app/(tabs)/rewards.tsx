
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, THEMES } from '@/contexts/ThemeContext';
import { useUserStats } from '@/hooks/useHabits';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  color: string;
  type: 'theme' | 'icon' | 'badge';
  unlocked: boolean;
}

const REWARD_ITEMS: Omit<RewardItem, 'unlocked'>[] = [
  // Themes
  { id: 'theme_ocean', name: 'Ocean Theme', description: 'Calming blue gradient', cost: 500, icon: 'water', color: '#0EA5E9', type: 'theme' },
  { id: 'theme_forest', name: 'Forest Theme', description: 'Natural green gradient', cost: 500, icon: 'park', color: '#10B981', type: 'theme' },
  { id: 'theme_sunset', name: 'Sunset Theme', description: 'Warm orange gradient', cost: 750, icon: 'wb-sunny', color: '#F59E0B', type: 'theme' },
  { id: 'theme_midnight', name: 'Midnight Theme', description: 'Deep purple gradient', cost: 750, icon: 'nights-stay', color: '#8B5CF6', type: 'theme' },
  
  // Icons
  { id: 'icon_pack_1', name: 'Fitness Icons', description: 'Workout themed icons', cost: 300, icon: 'fitness-center', color: '#10B981', type: 'icon' },
  { id: 'icon_pack_2', name: 'Nature Icons', description: 'Nature themed icons', cost: 300, icon: 'eco', color: '#34D399', type: 'icon' },
  { id: 'icon_pack_3', name: 'Tech Icons', description: 'Technology themed icons', cost: 400, icon: 'computer', color: '#3B82F6', type: 'icon' },
  
  // Badges
  { id: 'badge_warrior', name: 'Habit Warrior', description: 'Complete 100 habits', cost: 1000, icon: 'military-tech', color: '#F59E0B', type: 'badge' },
  { id: 'badge_master', name: 'Streak Master', description: '30 day streak', cost: 1500, icon: 'emoji-events', color: '#EF4444', type: 'badge' },
  { id: 'badge_legend', name: 'Momentum Legend', description: 'Reach level 50', cost: 2000, icon: 'stars', color: '#8B5CF6', type: 'badge' },
];

export default function RewardsScreen() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [userXP, setUserXP] = useState(0);
  const { currentTheme, setTheme } = useAppTheme();
  const stats = useUserStats();

  useEffect(() => {
    loadRewards();
    loadUserXP();
  }, []);

  const loadRewards = async () => {
    try {
      const stored = await AsyncStorage.getItem('momentum_rewards');
      if (stored) {
        setRewards(JSON.parse(stored));
      } else {
        const initialRewards = REWARD_ITEMS.map(r => ({ ...r, unlocked: false }));
        setRewards(initialRewards);
        await AsyncStorage.setItem('momentum_rewards', JSON.stringify(initialRewards));
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const loadUserXP = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_xp');
      if (stored) {
        setUserXP(parseInt(stored, 10));
      }
    } catch (error) {
      console.error('Error loading user XP:', error);
    }
  };

  const handleUnlock = async (reward: RewardItem) => {
    if (userXP < reward.cost) {
      Alert.alert('Not Enough XP', `You need ${reward.cost - userXP} more XP to unlock this reward`);
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const newXP = userXP - reward.cost;
      setUserXP(newXP);
      await AsyncStorage.setItem('user_xp', newXP.toString());

      const updatedRewards = rewards.map(r => {
        if (r.id === reward.id) {
          return { ...r, unlocked: true };
        }
        return r;
      });
      setRewards(updatedRewards);
      await AsyncStorage.setItem('momentum_rewards', JSON.stringify(updatedRewards));

      // Apply theme if it's a theme reward
      if (reward.type === 'theme') {
        const themeId = reward.id.replace('theme_', '');
        const theme = THEMES.find(t => t.id === themeId);
        if (theme) {
          setTheme(theme.id);
        }
      }

      Alert.alert('Unlocked! 🎉', `You unlocked ${reward.name}!`);
    } catch (error) {
      console.error('Error unlocking reward:', error);
      Alert.alert('Error', 'Failed to unlock reward');
    }
  };

  const groupedRewards = {
    themes: rewards.filter(r => r.type === 'theme'),
    icons: rewards.filter(r => r.type === 'icon'),
    badges: rewards.filter(r => r.type === 'badge'),
  };

  const renderRewardCard = (reward: RewardItem, index: number) => (
    <Animated.View key={reward.id} entering={FadeInDown.delay(index * 50)}>
      <View style={[styles.rewardCard, { backgroundColor: currentTheme.colors.surface }]}>
        <View style={[styles.rewardIcon, { backgroundColor: reward.color + '20' }]}>
          <IconSymbol
            ios_icon_name={reward.icon}
            android_material_icon_name={reward.icon}
            size={32}
            color={reward.color}
          />
        </View>
        <View style={styles.rewardInfo}>
          <Text style={[styles.rewardName, { color: currentTheme.colors.text }]}>
            {reward.name}
          </Text>
          <Text style={[styles.rewardDescription, { color: currentTheme.colors.textSecondary }]}>
            {reward.description}
          </Text>
          <View style={styles.costContainer}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={16}
              color="#F59E0B"
            />
            <Text style={[styles.costText, { color: currentTheme.colors.text }]}>
              {reward.cost} XP
            </Text>
          </View>
        </View>
        {reward.unlocked ? (
          <View style={[styles.unlockedBadge, { backgroundColor: currentTheme.colors.success }]}>
            <IconSymbol
              ios_icon_name="checkmark"
              android_material_icon_name="check"
              size={20}
              color="#FFF"
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.unlockButton,
              { backgroundColor: userXP >= reward.cost ? reward.color : currentTheme.colors.background }
            ]}
            onPress={() => handleUnlock(reward)}
            disabled={userXP < reward.cost}
          >
            <Text style={[styles.unlockButtonText, { opacity: userXP >= reward.cost ? 1 : 0.5 }]}>
              Unlock
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Reward Store</Text>
        <Text style={styles.headerSubtitle}>Unlock themes, icons & badges</Text>
        <View style={styles.xpContainer}>
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={24}
            color="#F59E0B"
          />
          <Text style={styles.xpText}>{userXP} XP</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Themes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Themes
          </Text>
          {groupedRewards.themes.map((reward, index) => renderRewardCard(reward, index))}
        </View>

        {/* Icon Packs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Icon Packs
          </Text>
          {groupedRewards.icons.map((reward, index) => renderRewardCard(reward, index))}
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Badges
          </Text>
          {groupedRewards.badges.map((reward, index) => renderRewardCard(reward, index))}
        </View>
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
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
  },
  xpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
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
  rewardCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  rewardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costText: {
    fontSize: 14,
    fontWeight: '600',
  },
  unlockButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  unlockedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
