
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <NativeTabs>
        <NativeTabs.Trigger key="home" name="(home)">
          <Icon sf="house.fill" />
          <Label>Today</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="progress" name="progress">
          <Icon sf="chart.bar.fill" />
          <Label>Progress</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="profile" name="profile">
          <Icon sf="person.fill" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ProtectedRoute>
  );
}
