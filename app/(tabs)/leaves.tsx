import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Bell, X, MessageCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PlantTheme } from '@/constants/theme';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';

type Chat = {
  id: string;
  otherUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

type SearchUser = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
};

export default function LeavesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const chatsQuery = trpc.chat.getChats.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const searchUsersQuery = trpc.chat.searchUsers.useQuery(
    { searchQuery: userSearchQuery },
    { enabled: userSearchQuery.length > 0 }
  );

  const chats = chatsQuery.data || [];
  const searchResults = searchUsersQuery.data || [];

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.otherUser.name.toLowerCase().includes(query) ||
      chat.otherUser.username.toLowerCase().includes(query) ||
      chat.lastMessage.toLowerCase().includes(query)
    );
  });

  const backgroundColor = isDark ? '#112111' : '#f6f8f6';
  const textColor = '#000000';
  const secondaryTextColor = '#424842';
  const containerBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const searchBg = isDark ? 'rgba(23, 207, 23, 0.2)' : 'rgba(23, 207, 23, 0.1)';
  const primaryColor = '#17cf17';
  const modalBg = isDark ? '#1a2e1a' : '#ffffff';

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

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/chat' as any,
      params: {
        userId: chat.otherUser.id,
        userName: chat.otherUser.name,
        userAvatar: chat.otherUser.avatar,
      },
    });
  };

  const handleUserSelect = (user: SearchUser) => {
    setShowSearchModal(false);
    setUserSearchQuery('');
    router.push({
      pathname: '/chat' as any,
      params: {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
      },
    });
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
          
          <View style={styles.searchRow}>
            <View style={[styles.searchContainer, { backgroundColor: searchBg }]}>
              <Search size={20} color={primaryColor} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search chats"
                placeholderTextColor={isDark ? 'rgba(23, 207, 23, 0.8)' : 'rgba(23, 207, 23, 0.8)'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={[styles.newChatButton, { backgroundColor: primaryColor }]}
              onPress={() => setShowSearchModal(true)}
            >
              <MessageCircle size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {chatsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredChats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🌱</Text>
                <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                  Start connecting with people and grow your network!
                </Text>
                <TouchableOpacity
                  style={[styles.startChatButton, { backgroundColor: primaryColor }]}
                  onPress={() => setShowSearchModal(true)}
                >
                  <Text style={styles.startChatButtonText}>Start a Chat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredChats.map((chat) => (
                <TouchableOpacity 
                  key={chat.id} 
                  style={[styles.conversationItem, { backgroundColor: containerBg }]}
                  activeOpacity={0.7}
                  onPress={() => handleChatPress(chat)}
                >
                  <Image 
                    source={{ uri: chat.otherUser.avatar || 'https://via.placeholder.com/56' }} 
                    style={styles.avatar}
                  />
                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <Text style={[styles.userName, { color: textColor }]}>
                        {chat.otherUser.name}
                      </Text>
                      <Text style={[styles.timestamp, { color: secondaryTextColor }]}>
                        {formatTimestamp(chat.lastMessageTime)}
                      </Text>
                    </View>
                    <Text 
                      style={[styles.lastMessage, { color: secondaryTextColor }]}
                      numberOfLines={1}
                    >
                      {chat.lastMessage}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>New Message</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalSearchContainer, { backgroundColor: searchBg }]}>
              <Search size={20} color={primaryColor} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search by name or username"
                placeholderTextColor={isDark ? 'rgba(23, 207, 23, 0.8)' : 'rgba(23, 207, 23, 0.8)'}
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
                autoFocus
              />
            </View>

            {searchUsersQuery.isLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
              </View>
            ) : searchResults.length === 0 && userSearchQuery.length > 0 ? (
              <View style={styles.modalEmptyState}>
                <Text style={[styles.modalEmptyText, { color: secondaryTextColor }]}>
                  No users found
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.userItem, { backgroundColor: containerBg }]}
                    onPress={() => handleUserSelect(item)}
                  >
                    <Image
                      source={{ uri: item.avatar || 'https://via.placeholder.com/48' }}
                      style={styles.userAvatar}
                    />
                    <View style={styles.userInfo}>
                      <Text style={[styles.userItemName, { color: textColor }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.userItemUsername, { color: secondaryTextColor }]}>
                        @{item.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.userList}
              />
            )}
          </View>
        </View>
      </Modal>
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
  startChatButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startChatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newChatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    height: '80%',
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
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  modalLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
  },
  userList: {
    paddingBottom: 24,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  userItemUsername: {
    fontSize: 14,
  },
});
