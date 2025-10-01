import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Search, UserX, UserCheck } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PlantTheme } from '@/constants/theme';
import { trpc } from '@/lib/trpc';

export default function UserManagement() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'suspended' | 'deleted'>('all');
  const [page, setPage] = useState(1);

  const usersQuery = trpc().admin.users.list.useQuery({ page, limit: 20, search, status });
  const suspendMutation = trpc().admin.users.suspend.useMutation();
  const activateMutation = trpc().admin.users.activate.useMutation();

  const handleSuspend = (userId: string, username: string) => {
    Alert.alert(
      'Suspend User',
      `Are you sure you want to suspend @${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Suspension Reason',
              'Please provide a reason for suspension:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Suspend',
                  onPress: async (reason) => {
                    try {
                      await suspendMutation.mutateAsync({ userId, reason: reason || 'No reason provided' });
                      usersQuery.refetch();
                      Alert.alert('Success', 'User has been suspended');
                    } catch {
                      Alert.alert('Error', 'Failed to suspend user');
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  };

  const handleActivate = async (userId: string, username: string) => {
    Alert.alert(
      'Activate User',
      `Are you sure you want to activate @${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              await activateMutation.mutateAsync({ userId });
              usersQuery.refetch();
              Alert.alert('Success', 'User has been activated');
            } catch {
              Alert.alert('Error', 'Failed to activate user');
            }
          },
        },
      ]
    );
  };

  const statusFilters = [
    { label: 'All', value: 'all' as const },
    { label: 'Active', value: 'active' as const },
    { label: 'Suspended', value: 'suspended' as const },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={PlantTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: PlantTheme.colors.surface }]}>
            <Search size={20} color={PlantTheme.colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={PlantTheme.colors.onSurfaceVariant}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    status === filter.value
                      ? PlantTheme.colors.primary
                      : PlantTheme.colors.surface,
                },
              ]}
              onPress={() => setStatus(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      status === filter.value
                        ? PlantTheme.colors.white
                        : PlantTheme.colors.onSurface,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {usersQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PlantTheme.colors.primary} />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : usersQuery.data?.users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : (
            usersQuery.data?.users.map((user: any) => (
              <View
                key={user.id}
                style={[styles.userCard, { backgroundColor: PlantTheme.colors.surface }]}
              >
                <View style={styles.userInfo}>
                  {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.full_name || 'Unknown'}</Text>
                    <Text style={styles.userUsername}>@{user.username || 'unknown'}</Text>
                    <View style={styles.statusBadgeContainer}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              user.status === 'active'
                                ? PlantTheme.colors.success
                                : user.status === 'suspended'
                                ? PlantTheme.colors.error
                                : PlantTheme.colors.gray,
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {user.status || 'active'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.userActions}>
                  {user.status === 'suspended' ? (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: PlantTheme.colors.success }]}
                      onPress={() => handleActivate(user.id, user.username)}
                    >
                      <UserCheck size={18} color={PlantTheme.colors.white} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: PlantTheme.colors.error }]}
                      onPress={() => handleSuspend(user.id, user.username)}
                    >
                      <UserX size={18} color={PlantTheme.colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}

          {usersQuery.data && usersQuery.data.totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { backgroundColor: PlantTheme.colors.surface },
                ]}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <Text
                  style={[
                    styles.paginationText,
                    { color: page === 1 ? PlantTheme.colors.gray : PlantTheme.colors.onSurface },
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Page {page} of {usersQuery.data.totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { backgroundColor: PlantTheme.colors.surface },
                ]}
                onPress={() => setPage((p) => p + 1)}
                disabled={page >= usersQuery.data.totalPages}
              >
                <Text
                  style={[
                    styles.paginationText,
                    {
                      color:
                        page >= usersQuery.data.totalPages
                          ? PlantTheme.colors.gray
                          : PlantTheme.colors.onSurface,
                    },
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: PlantTheme.borderRadius.md,
    ...PlantTheme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: PlantTheme.colors.onSurface,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: PlantTheme.borderRadius.full,
    ...PlantTheme.shadows.sm,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: PlantTheme.borderRadius.md,
    marginBottom: 12,
    ...PlantTheme.shadows.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PlantTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: PlantTheme.colors.primary,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
  },
  userUsername: {
    fontSize: 14,
    color: PlantTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusBadgeContainer: {
    marginTop: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: PlantTheme.colors.white,
    textTransform: 'uppercase',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: PlantTheme.borderRadius.md,
    ...PlantTheme.shadows.sm,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    color: PlantTheme.colors.onSurfaceVariant,
  },
});
