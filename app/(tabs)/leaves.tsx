import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Bell } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PlantTheme } from '@/constants/theme';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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

  const backgroundColor = isDark ? '#112111' : '#f6f8f6';
  const textColor = '#000000';
  const secondaryTextColor = '#424842';
  const containerBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const searchBg = isDark ? 'rgba(23, 207, 23, 0.2)' : 'rgba(23, 207, 23, 0.1)';
  const primaryColor = '#17cf17';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: textColor }]}>Leaves</Text>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.searchContainer, { backgroundColor: searchBg }]}>
            <Search size={20} color={primaryColor} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder={activeTab === 'previous' ? 'Search conversations' : 'Search users by name or username'}
              placeholderTextColor={isDark ? 'rgba(23, 207, 23, 0.8)' : 'rgba(23, 207, 23, 0.8)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'previous' && [styles.activeTab, { backgroundColor: primaryColor }],
              ]}
              onPress={() => {
                setActiveTab('previous');
                setSearchQuery('');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'previous' ? '#fff' : textColor },
                ]}
              >
                Previous Chats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'new' && [styles.activeTab, { backgroundColor: primaryColor }],
              ]}
              onPress={() => {
                setActiveTab('new');
                setSearchQuery('');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'new' ? '#fff' : textColor },
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
                <ActivityIndicator size="large" color={primaryColor} />
              </View>
            ) : conversations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>💬</Text>
                <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
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
                    style={[styles.conversationItem, { backgroundColor: containerBg }]}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/chat?userId=${conversation.user.id}&name=${encodeURIComponent(conversation.user.name)}`)}
                  >
                    <Image 
                      source={{ uri: conversation.user.avatar || 'https://via.placeholder.com/56' }} 
                      style={styles.avatar}
                    />
                    <View style={styles.conversationContent}>
                      <View style={styles.conversationHeader}>
                        <Text style={[styles.userName, { color: textColor }]}>
                          {conversation.user.name}
                        </Text>
                        <Text style={[styles.timestamp, { color: secondaryTextColor }]}>
                          {formatTimestamp(conversation.timestamp)}
                        </Text>
                      </View>
                      <Text 
                        style={[styles.lastMessage, { color: secondaryTextColor }]}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage}
                      </Text>
                    </View>
                    {conversation.unread && (
                      <View style={[styles.unreadBadge, { backgroundColor: primaryColor }]} />
                    )}
                  </TouchableOpacity>
                ))
            )
          ) : (
            searchUsersQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🔍</Text>
                <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                  Search for users
                </Text>
                <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                  Enter a name or username to find people to chat with
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>😔</Text>
                <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                  No users found
                </Text>
                <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                  Try searching with a different name or username
                </Text>
              </View>
            ) : (
              searchResults.map((user) => (
                <TouchableOpacity 
                  key={user.id} 
                  style={[styles.conversationItem, { backgroundColor: containerBg }]}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/chat?userId=${user.id}&name=${encodeURIComponent(user.name)}`)}
                >
                  <Image 
                    source={{ uri: user.avatar || 'https://via.placeholder.com/56' }} 
                    style={styles.avatar}
                  />
                  <View style={styles.conversationContent}>
                    <Text style={[styles.userName, { color: textColor }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.username, { color: secondaryTextColor }]}>
                      @{user.username}
                    </Text>
                    {user.bio && (
                      <Text 
                        style={[styles.bio, { color: secondaryTextColor }]}
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeTab: {
    shadowColor: '#17cf17',
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
