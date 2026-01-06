
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface JournalEntry {
  id: string;
  habitId: string;
  habitName: string;
  date: string;
  note: string;
  mood: number;
  effort: number;
  createdAt: string;
}

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const { currentTheme } = useAppTheme();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem('momentum_journal');
      if (stored) {
        const parsedEntries = JSON.parse(stored);
        setEntries(parsedEntries.sort((a: JournalEntry, b: JournalEntry) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.habitName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMood === null || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const getMoodEmoji = (mood: number) => {
    const moods = ['😢', '😕', '😐', '🙂', '😄'];
    return moods[mood - 1] || '😐';
  };

  const getEffortColor = (effort: number) => {
    if (effort <= 2) return '#EF4444';
    if (effort <= 3) return '#F59E0B';
    return '#10B981';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleMoodFilter = (mood: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(selectedMood === mood ? null : mood);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Journal</Text>
        <Text style={styles.headerSubtitle}>Reflect on your journey</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: currentTheme.colors.surface }]}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={currentTheme.colors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.colors.text }]}
            placeholder="Search entries..."
            placeholderTextColor={currentTheme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodFilters}>
          {[1, 2, 3, 4, 5].map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodFilter,
                { backgroundColor: currentTheme.colors.surface },
                selectedMood === mood && { backgroundColor: currentTheme.colors.primary }
              ]}
              onPress={() => handleMoodFilter(mood)}
            >
              <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="book"
              android_material_icon_name="menu-book"
              size={64}
              color={currentTheme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: currentTheme.colors.textSecondary }]}>
              {searchQuery || selectedMood ? 'No entries match your filters' : 'No journal entries yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: currentTheme.colors.textSecondary }]}>
              Add notes and reflections when you check in habits
            </Text>
          </View>
        ) : (
          filteredEntries.map((entry, index) => (
            <Animated.View key={entry.id} entering={FadeInDown.delay(index * 50)}>
              <View style={[styles.entryCard, { backgroundColor: currentTheme.colors.surface }]}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeaderLeft}>
                    <Text style={[styles.habitName, { color: currentTheme.colors.text }]}>
                      {entry.habitName}
                    </Text>
                    <Text style={[styles.entryDate, { color: currentTheme.colors.textSecondary }]}>
                      {formatDate(entry.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.entryMeta}>
                    <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                  </View>
                </View>

                <Text style={[styles.entryNote, { color: currentTheme.colors.text }]}>
                  {entry.note}
                </Text>

                <View style={styles.entryFooter}>
                  <View style={styles.effortContainer}>
                    <Text style={[styles.effortLabel, { color: currentTheme.colors.textSecondary }]}>
                      Effort:
                    </Text>
                    <View style={styles.effortDots}>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <View
                          key={dot}
                          style={[
                            styles.effortDot,
                            {
                              backgroundColor: dot <= entry.effort
                                ? getEffortColor(entry.effort)
                                : currentTheme.colors.background
                            }
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))
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
  searchContainer: {
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  moodFilters: {
    flexDirection: 'row',
  },
  moodFilter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  entryCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryHeaderLeft: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
  },
  entryMeta: {
    marginLeft: 12,
  },
  entryNote: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  effortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  effortLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  effortDots: {
    flexDirection: 'row',
    gap: 4,
  },
  effortDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
