import React, { useState, useMemo } from 'react';
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
import { Search, Bell, MessageCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PlantTheme } from '@/constants/theme';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';

type TabType = 'previous' | 'new';

export default function LeavesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('previous');

  const conversationsQuery = trpc.messages.getConversations.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const searchUsersQuery = trpc.messages.searchUsers.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const conversations = conversationsQuery.data || [];
  const searchResults = searchUsersQuery.data || [];

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter((conv) =>
      conv.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const backgroundColor = isDark ? '#112111' : '#f6f8f6';
  const textColor = '#000000';
  const secondaryTextColor = '#424842';
  const containerBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const searchBg = isDark ? 'rgba(23, 207, 23, 0.2)' : 'rgba(23, 207, 23, 0.1)';
  const primaryColor = '#17cf17';
  const tabActiveBg = isDark ? 'rgba(23, 207, 23, 0.3)' : 'rgba(23, 207, 23, 0.2)';
  const tabInactiveBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';

  const handleUserPress = (userId: string) => {
    router.push(`/chat?userId=${userId}` as any);
  };

  const handleConversationPress = (conversationId: string, otherUserId: string) => {
    router.push(`/chat?userId=${otherUserId}&conversationId=${conversationId}` as any);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

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
              placeholder="Search by name or user ID"
              placeholderTextColor={isDark ? 'rgba(23, 207, 23, 0.8)' : 'rgba(23, 207, 23, 0.8)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: activeTab === 'previous' ? tabActiveBg : tabInactiveBg },
              ]}
              onPress={() => setActiveTab('previous')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'previous' ? primaryColor : secondaryTextColor,
                    fontWeight: activeTab === 'previous' ? '700' : '500',
                  },
                ]}
              >
                Previous Chats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { backgroundColor: activeTab === 'new' ? tabActiveBg : tabInactiveBg },
              ]}
              onPress={() => setActiveTab('new')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'new' ? primaryColor : secondaryTextColor,
                    fontWeight: activeTab === 'new' ? '700' : '500',
                  },
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
            ) : filteredConversations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>💬</Text>
                <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </Text>
                <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                  {searchQuery
                    ? 'Try searching with a different name or ID'
                    : 'Start a conversation with someone from the community'}
                </Text>
              </View>
            ) : (
              filteredConversations.map((conversation) => (
                <TouchableOpacity 
                  key={conversation.id} 
                  style={[styles.conversationItem, { backgroundColor: containerBg }]}
                  activeOpacity={0.7}
                  onPress={() => handleConversationPress(conversation.id, conversation.otherUser.id)}
                >
                  {conversation.otherUser.avatar ? (
                    <Image 
                      source={{ uri: conversation.otherUser.avatar }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                      <Text style={styles.avatarText}>
                        {conversation.otherUser.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <Text style={[styles.userName, { color: textColor }]}>
                        {conversation.otherUser.name || 'Unknown User'}
                      </Text>
                      <Text style={[styles.timestamp, { color: secondaryTextColor }]}>
                        {formatTimestamp(conversation.lastMessageAt)}
                      </Text>
                    </View>
                    <Text 
                      style={[styles.lastMessage, { color: secondaryTextColor }]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage || 'No messages yet'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            searchQuery.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🔍</Text>
                <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                  Search for users
                </Text>
                <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                  Enter a name or user ID to find someone to chat with
                </Text>
              </View>
            ) : searchUsersQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>😕</Text>
                <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                  No users found
                </Text>
                <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                  Try searching with a different name or ID
                </Text>
              </View>
            ) : (
              searchResults.map((user) => (
                <TouchableOpacity 
                  key={user.id} 
                  style={[styles.conversationItem, { backgroundColor: containerBg }]}
                  activeOpacity={0.7}
                  onPress={() => handleUserPress(user.id)}
                >
                  {user.avatar ? (
                    <Image 
                      source={{ uri: user.avatar }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                      <Text style={styles.avatarText}>
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.conversationContent}>
                    <Text style={[styles.userName, { color: textColor }]}>
                      {user.name || 'No name'}
                    </Text>
                    <Text style={[styles.lastMessage, { color: secondaryTextColor }]}>
                      @{user.username || user.id.slice(0, 8)}
                    </Text>
                  </View>
                  <MessageCircle size={20} color={primaryColor} />
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
    paddingBottom: 12,
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
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
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
