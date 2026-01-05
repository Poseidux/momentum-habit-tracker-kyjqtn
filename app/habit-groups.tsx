
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { authenticatedGet, authenticatedPost, isBackendConfigured } from '@/utils/api';

interface HabitGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  challenges: number;
  color: string;
  inviteCode?: string;
}

export default function HabitGroupsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [groups, setGroups] = useState<HabitGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      if (!isBackendConfigured()) {
        console.log('[HabitGroups] Backend not configured - using empty state');
        setGroups([]);
        setLoading(false);
        return;
      }

      console.log('[HabitGroups] Fetching habit groups...');
      const response = await authenticatedGet<any>('/api/habit-groups');
      console.log('[HabitGroups] Groups response:', response);

      const groupsData = Array.isArray(response) ? response : response.groups || [];
      const transformedGroups: HabitGroup[] = groupsData.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        memberCount: g.memberCount || g.members?.length || 1,
        challenges: g.challenges?.length || 0,
        color: colors.primary,
        inviteCode: g.inviteCode,
      }));

      setGroups(transformedGroups);
      console.log('[HabitGroups] Successfully loaded', transformedGroups.length, 'groups');
    } catch (error: any) {
      console.log('[HabitGroups] Error fetching groups (using empty state):', error.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!isBackendConfigured()) {
      Alert.alert('Error', 'Backend not configured. Please rebuild the app.');
      return;
    }

    try {
      setCreating(true);
      console.log('[HabitGroups] Creating group:', groupName);

      const response = await authenticatedPost<any>('/api/habit-groups', {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        maxMembers: 10,
      });

      console.log('[HabitGroups] Group created:', response);

      setGroupName('');
      setGroupDescription('');
      setShowCreateModal(false);

      // Refresh groups list
      await fetchGroups();

      Alert.alert(
        'Success', 
        `Habit group created! ${response.inviteCode ? `Invite code: ${response.inviteCode}` : 'Share the invite code with friends.'}`
      );
    } catch (error: any) {
      console.error('[HabitGroups] Error creating group:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!isBackendConfigured()) {
      Alert.alert('Error', 'Backend not configured. Please rebuild the app.');
      return;
    }

    const promptForCode = (code: string | null) => {
      if (!code || !code.trim()) return;

      const joinGroup = async () => {
        try {
          console.log('[HabitGroups] Joining group with code:', code);

          // Note: The API expects groupId in the path, but we only have invite code
          // We'll need to find the group by invite code first or use a different endpoint
          // For now, we'll try to join using the code as the ID
          const response = await authenticatedPost<any>(`/api/habit-groups/${code}/join`, {
            inviteCode: code.trim(),
          });

          console.log('[HabitGroups] Joined group:', response);

          // Refresh groups list
          await fetchGroups();

          Alert.alert('Success', 'Joined habit group successfully!');
        } catch (error: any) {
          console.error('[HabitGroups] Error joining group:', error);
          Alert.alert('Error', error.message || 'Failed to join group. Please check the invite code.');
        }
      };

      joinGroup();
    };

    if (Platform.OS === 'web') {
      const code = prompt('Enter group invite code:');
      promptForCode(code);
    } else {
      Alert.prompt('Join Group', 'Enter group invite code:', promptForCode);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Habit Groups',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 16 }}>
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back" 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.colors.background }]} 
        edges={['bottom']}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Connect with Friends
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text, opacity: 0.7 }]}>
              Share challenges, compete, and stay motivated together
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { flex: 1 }]}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <IconSymbol 
                  ios_icon_name="plus.circle" 
                  android_material_icon_name="add-circle" 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.actionText}>Create Group</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { flex: 1 }]}
              onPress={handleJoinGroup}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.secondary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <IconSymbol 
                  ios_icon_name="person.badge.plus" 
                  android_material_icon_name="group-add" 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.actionText}>Join Group</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Create Group Modal */}
          {showCreateModal && (
            <View style={[styles.modalCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Create Habit Group
                </Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <IconSymbol 
                    ios_icon_name="xmark" 
                    android_material_icon_name="close" 
                    size={24} 
                    color={theme.colors.text} 
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Group Name"
                placeholderTextColor={theme.colors.text + '60'}
                value={groupName}
                onChangeText={setGroupName}
                maxLength={50}
              />

              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Description (optional)"
                placeholderTextColor={theme.colors.text + '60'}
                value={groupDescription}
                onChangeText={setGroupDescription}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateGroup}
                activeOpacity={0.8}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Groups List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Loading groups...
              </Text>
            </View>
          ) : groups.length === 0 && !showCreateModal ? (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="person.3" 
                android_material_icon_name="group" 
                size={64} 
                color={theme.colors.text} 
                style={{ opacity: 0.3 }} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No groups yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
                Create or join a group to get started
              </Text>
            </View>
          ) : (
            <View style={styles.groupsList}>
              {groups.map((group, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[styles.groupCard, { backgroundColor: theme.colors.card }]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.groupIcon, { backgroundColor: group.color + '20' }]}>
                      <IconSymbol 
                        ios_icon_name="person.3.fill" 
                        android_material_icon_name="group" 
                        size={28} 
                        color={group.color} 
                      />
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={[styles.groupName, { color: theme.colors.text }]}>
                        {group.name}
                      </Text>
                      {group.description && (
                        <Text style={[styles.groupDescription, { color: theme.colors.text }]} numberOfLines={1}>
                          {group.description}
                        </Text>
                      )}
                      <View style={styles.groupStats}>
                        <View style={styles.stat}>
                          <IconSymbol 
                            ios_icon_name="person" 
                            android_material_icon_name="person" 
                            size={14} 
                            color={theme.colors.text} 
                          />
                          <Text style={[styles.statText, { color: theme.colors.text }]}>
                            {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                          </Text>
                        </View>
                        <View style={styles.stat}>
                          <IconSymbol 
                            ios_icon_name="trophy" 
                            android_material_icon_name="emoji-events" 
                            size={14} 
                            color={theme.colors.text} 
                          />
                          <Text style={[styles.statText, { color: theme.colors.text }]}>
                            {group.challenges} challenges
                          </Text>
                        </View>
                      </View>
                    </View>
                    <IconSymbol 
                      ios_icon_name="chevron.right" 
                      android_material_icon_name="arrow-forward" 
                      size={20} 
                      color={theme.colors.text} 
                      style={{ opacity: 0.5 }} 
                    />
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol 
              ios_icon_name="info.circle" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: colors.primary }]}>
                About Habit Groups
              </Text>
              <Text style={[styles.infoDescription, { color: colors.primary }]}>
                • Create groups with up to 10 members{'\n'}
                • Share challenges and compete{'\n'}
                • Track group progress together{'\n'}
                • Send accountability nudges
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    opacity: 0.7,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.4,
  },
  groupsList: {
    gap: 12,
    marginBottom: 24,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
