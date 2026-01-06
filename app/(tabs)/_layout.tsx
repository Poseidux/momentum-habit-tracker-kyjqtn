
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TabLayout() {
  // Define the tabs configuration
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Today',
    },
    {
      name: 'progress',
      route: '/(tabs)/progress',
      icon: 'bar-chart',
      label: 'Progress',
    },
    {
      name: 'quests',
      route: '/(tabs)/quests',
      icon: 'flag',
      label: 'Quests',
    },
    {
      name: 'journal',
      route: '/(tabs)/journal',
      icon: 'menu-book',
      label: 'Journal',
    },
    {
      name: 'rewards',
      route: '/(tabs)/rewards',
      icon: 'star',
      label: 'Rewards',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <ProtectedRoute>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="progress" name="progress" />
        <Stack.Screen key="quests" name="quests" />
        <Stack.Screen key="journal" name="journal" />
        <Stack.Screen key="rewards" name="rewards" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </ProtectedRoute>
  );
}
