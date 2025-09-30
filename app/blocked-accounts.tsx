import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isBlocked: boolean;
}

export default function BlockedAccountsScreen() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<BlockedUser[]>([]);

  const handleToggleBlock = (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'Unblock' : 'Unmute';
    const user = users.find(u => u.id === userId);
    
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: () => {
            setUsers(prevUsers =>
              prevUsers.map(u =>
                u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
              )
            );
          },
        },
      ]
    );
  };

  const renderUser = (user: BlockedUser) => (
    <View key={user.id} style={styles.userItem}>
      <View style={styles.userInfo}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userUsername}>{user.username}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleToggleBlock(user.id, user.isBlocked)}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>
          {user.isBlocked ? 'Unblock' : 'Unmute'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1a1c1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked &amp; Muted</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No blocked or muted accounts</Text>
            <Text style={styles.emptySubtext}>
              Accounts you block or mute will appear here
            </Text>
          </View>
        ) : (
          users.map(renderUser)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F6F8F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAE6',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8EAE6',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1a1c1a',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1c1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
