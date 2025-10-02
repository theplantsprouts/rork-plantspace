import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Bell } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PlantTheme } from '@/constants/theme';
import { router } from 'expo-router';

type Conversation = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  timestamp: string;
};

export default function LeavesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [];

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
          {conversations.length === 0 ? (
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
            conversations.map((conversation) => (
              <TouchableOpacity 
                key={conversation.id} 
                style={[styles.conversationItem, { backgroundColor: containerBg }]}
                activeOpacity={0.7}
              >
                <Image 
                  source={{ uri: conversation.user.avatar }} 
                  style={styles.avatar}
                />
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={[styles.userName, { color: textColor }]}>
                      {conversation.user.name}
                    </Text>
                    <Text style={[styles.timestamp, { color: secondaryTextColor }]}>
                      {conversation.timestamp}
                    </Text>
                  </View>
                  <Text 
                    style={[styles.lastMessage, { color: secondaryTextColor }]}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
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
});
