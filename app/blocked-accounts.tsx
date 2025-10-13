import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, UserX, Unlock } from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { MaterialButton } from '@/components/MaterialButton';
import { useTheme } from '@/hooks/use-theme';

interface BlockedUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  blockedAt: string;
}

export default function BlockedAccountsScreen() {
  const { colors } = useTheme();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock @${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            setBlockedUsers(blockedUsers.filter((u) => u.id !== user.id));
            Alert.alert('Success', `@${user.username} has been unblocked`);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <AnimatedButton
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surfaceContainer }]}
            bounceEffect="subtle"
            hapticFeedback="light"
          >
            <ArrowLeft color={colors.onSurface} size={24} />
          </AnimatedButton>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Blocked Accounts</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {blockedUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <UserX color={colors.primary} size={48} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                No Blocked Accounts
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
                You haven&apos;t blocked anyone yet. Blocked users won&apos;t be able to see your profile or contact you.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Blocked Users ({blockedUsers.length})
              </Text>
              {blockedUsers.map((user) => (
                <View
                  key={user.id}
                  style={[styles.userCard, { backgroundColor: colors.surfaceContainer }]}
                >
                  <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: colors.onSurface }]}>
                        {user.name}
                      </Text>
                      <Text style={[styles.userUsername, { color: colors.onSurfaceVariant }]}>
                        @{user.username}
                      </Text>
                    </View>
                  </View>
                  <MaterialButton
                    title="Unblock"
                    onPress={() => handleUnblock(user)}
                    variant="outlined"
                    size="small"
                    icon={<Unlock color={colors.primary} size={16} />}
                  />
                </View>
              ))}
            </>
          )}

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
              🔒 When you block someone:{'\n'}
              • They can&apos;t see your profile or posts{'\n'}
              • They can&apos;t message or tag you{'\n'}
              • They won&apos;t be notified that you blocked them
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginRight: 48,
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: 'uppercase',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
  },
  infoBox: {
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
