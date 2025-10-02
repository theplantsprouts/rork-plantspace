import React, { useState, useEffect, useMemo } from 'react';
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
import { useConversations } from '@/hooks/use-chat';
import { auth, getProfile } from '@/lib/firebase';
import type { Profile } from '@/lib/firebase';

type ConversationWithProfile = {
  id: string;
  otherUserId: string;
  profile?: Profile;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
};

export default function LeavesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const { conversations: rawConversations, loading } = useConversations();
  const [conversationsWithProfiles, setConversationsWithProfiles] = useState<ConversationWithProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [fetchedConvIds, setFetchedConvIds] = useState<string>('');

  useEffect(() => {
    const fetchProfiles = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoadingProfiles(false);
        setConversationsWithProfiles([]);
        return;
      }

      if (rawConversations.length === 0) {
        setLoadingProfiles(false);
        setConversationsWithProfiles([]);
        return;
      }

      const currentConvIds = rawConversations.map(c => c.id).sort().join(',');
      if (currentConvIds === fetchedConvIds) {
        return;
      }

      setLoadingProfiles(true);
      const conversationsWithData = await Promise.all(
        rawConversations.map(async (conv) => {
          const otherUserId = conv.participants.find((id) => id !== user.uid) || '';
          const profile = await getProfile(otherUserId);
          const unreadCount = conv.unreadCount?.[user.uid] || 0;

          return {
            id: conv.id,
            otherUserId,
            profile: profile || undefined,
            lastMessage: conv.lastMessage,
            lastMessageTime: conv.lastMessageTime,
            unreadCount,
          };
        })
      );

      setConversationsWithProfiles(conversationsWithData);
      setFetchedConvIds(currentConvIds);
      setLoadingProfiles(false);
    };

    fetchProfiles();
  }, [rawConversations, fetchedConvIds]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversationsWithProfiles;
    return conversationsWithProfiles.filter((conv) =>
      conv.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversationsWithProfiles, searchQuery]);

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  };

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
              placeholder="Search Leaves"
              placeholderTextColor={isDark ? 'rgba(23, 207, 23, 0.8)' : 'rgba(23, 207, 23, 0.8)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading || loadingProfiles ? (
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
                  ? 'Try searching for a different name'
                  : 'Start a conversation with someone from the community'}
              </Text>
            </View>
          ) : (
            filteredConversations.map((conversation) => (
              <TouchableOpacity 
                key={conversation.id} 
                style={[styles.conversationItem, { backgroundColor: containerBg }]}
                activeOpacity={0.7}
                onPress={() => router.push({
                  pathname: '/chat' as any,
                  params: {
                    conversationId: conversation.id,
                    userId: conversation.otherUserId,
                    userName: conversation.profile?.name || conversation.profile?.username || 'User',
                    userAvatar: conversation.profile?.avatar || '',
                  },
                })}
              >
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: conversation.profile?.avatar || 'https://via.placeholder.com/56' }} 
                    style={styles.avatar}
                  />
                  {conversation.unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: primaryColor }]}>
                      <Text style={styles.unreadText}>
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={[styles.userName, { color: textColor }]}>
                      {conversation.profile?.name || conversation.profile?.username || 'User'}
                    </Text>
                    <Text style={[styles.timestamp, { color: secondaryTextColor }]}>
                      {formatTimestamp(conversation.lastMessageTime)}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.lastMessage,
                      { color: secondaryTextColor },
                      conversation.unreadCount > 0 && styles.unreadMessage,
                    ]}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage || 'No messages yet'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  avatarContainer: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  unreadMessage: {
    fontWeight: '600',
  },
});
