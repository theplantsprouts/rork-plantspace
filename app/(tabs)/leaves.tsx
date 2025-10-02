import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Bell } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/hooks/use-theme';

type Conversation = {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
};

type SearchUser = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
};

type TabType = 'previous' | 'new';

export default function LeavesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('previous');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const conversationsQuery = trpc.messages.getConversations.useQuery(undefined, {
    enabled: activeTab === 'previous',
  });

  const searchUsersQuery = trpc.messages.searchUsers.useQuery(
    { searchQuery: debouncedSearch },
    { enabled: activeTab === 'new' && debouncedSearch.length > 0 }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const conversations: Conversation[] = conversationsQuery.data?.conversations || [];
  const searchResults: SearchUser[] = searchUsersQuery.data?.users || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.backgroundStart, colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Leaves</Text>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Search size={20} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder={activeTab === 'previous' ? 'Search conversations' : 'Search users by name or username'}
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: colors.surfaceVariant },
                activeTab === 'previous' && [styles.activeTab, { backgroundColor: colors.primary }],
              ]}
              onPress={() => {
                setActiveTab('previous');
                setSearchQuery('');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'previous' ? colors.white : colors.onSurface },
                ]}
              >
                Previous Chats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: colors.surfaceVariant },
                activeTab === 'new' && [styles.activeTab, { backgroundColor: colors.primary }],
              ]}
              onPress={() => {
                setActiveTab('new');
                setSearchQuery('');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'new' ? colors.white : colors.onSurface },
                ]}
              >
                New Chats
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'previous' ? (
            conversationsQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : conversations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>💬</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.onSurface }]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
                  Start a conversation with someone from the community
                </Text>
              </View>
            ) : (
              conversations
                .filter((conv) =>
                  searchQuery
                    ? conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map((conversation) => (
                  <TouchableOpacity 
                    key={conversation.id} 
                    style={[styles.conversationItem, { backgroundColor: colors.surfaceVariant }]}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/chat?userId=${conversation.user.id}&name=${encodeURIComponent(conversation.user.name)}`)}
                  >
                    <Image 
                      source={{ uri: conversation.user.avatar || 'https://via.placeholder.com/56' }} 
                      style={styles.avatar}
                    />
                    <View style={styles.conversationContent}>
                      <View style={styles.conversationHeader}>
                        <Text style={[styles.userName, { color: colors.onSurface }]}>
                          {conversation.user.name}
                        </Text>
                        <Text style={[styles.timestamp, { color: colors.onSurfaceVariant }]}>
                          {formatTimestamp(conversation.timestamp)}
                        </Text>
                      </View>
                      <Text 
                        style={[styles.lastMessage, { color: colors.onSurfaceVariant }]}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage}
                      </Text>
                    </View>
                    {conversation.unread && (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                ))
            )
          ) : (
            searchUsersQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🔍</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.onSurface }]}>
                  Search for users
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
                  Enter a name or username to find people to chat with
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>😔</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.onSurface }]}>
                  No users found
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
                  Try searching with a different name or username
                </Text>
              </View>
            ) : (
              searchResults.map((user) => (
                <TouchableOpacity 
                  key={user.id} 
                  style={[styles.conversationItem, { backgroundColor: colors.surfaceVariant }]}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/chat?userId=${user.id}&name=${encodeURIComponent(user.name)}`)}
                >
                  <Image 
                    source={{ uri: user.avatar || 'https://via.placeholder.com/56' }} 
                    style={styles.avatar}
                  />
                  <View style={styles.conversationContent}>
                    <Text style={[styles.userName, { color: colors.onSurface }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.username, { color: colors.onSurfaceVariant }]}>
                      @{user.username}
                    </Text>
                    {user.bio && (
                      <Text 
                        style={[styles.bio, { color: colors.onSurfaceVariant }]}
                        numberOfLines={1}
                      >
                        {user.bio}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  bio: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 16,
  },
});

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
