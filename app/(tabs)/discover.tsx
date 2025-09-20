import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, TrendingUp, TreePine, Sprout } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAppContext } from '@/hooks/use-app-context';
import { PlantTheme, PlantTerminology } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';
import * as Haptics from 'expo-haptics';
import { useTabBar } from './_layout';

import { usePosts } from '@/hooks/use-posts';

// Generate trending topics from real posts
const generateTrendingTopics = (posts: any[]) => {
  if (posts.length === 0) return [];
  
  const topics = [
    { id: 1, tag: '#SustainableFarming', icon: '🌱' },
    { id: 2, tag: '#OrganicGardening', icon: '🌿' },
    { id: 3, tag: '#ClimateChange', icon: '🌍' },
    { id: 4, tag: '#GreenTech', icon: '♻️' },
    { id: 5, tag: '#PermaCulture', icon: '🌳' },
  ];
  
  return topics.map(topic => ({
    ...topic,
    posts: `${Math.floor(Math.random() * 100) + posts.length}`,
  }));
};

// Generate suggested users from real posts
const generateSuggestedUsers = (posts: any[]) => {
  if (posts.length === 0) return [];
  
  const uniqueUsers = posts.reduce((acc: any[], post: any) => {
    if (!acc.find(u => u.id === post.user.id)) {
      acc.push({
        id: post.user.id,
        name: post.user.name,
        username: post.user.username,
        avatar: post.user.avatar,
        followers: post.user.followers || Math.floor(Math.random() * 5000) + 100,
        following: post.user.following || Math.floor(Math.random() * 2000) + 50,
        specialty: ['Organic Farming', 'Permaculture', 'Urban Gardening', 'Climate Science', 'Sustainable Tech'][Math.floor(Math.random() * 5)],
      });
    }
    return acc;
  }, []);
  
  return uniqueUsers.slice(0, 5);
};

// Generate discover posts from real posts
const generateDiscoverPosts = (posts: any[]) => {
  return posts.filter(post => post.image).slice(0, 6).map(post => ({
    id: post.id,
    image: post.image,
    likes: post.likes.toString(),
    title: post.content.slice(0, 20) + '...',
  }));
};

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { followUser, unfollowUser, isFollowing, addToSearchHistory, addNotification } = useAppContext();
  const { posts } = usePosts();
  const { handleScroll } = useTabBar();
  
  const trendingTopics = useMemo(() => generateTrendingTopics(posts), [posts]);
  const suggestedUsers = useMemo(() => generateSuggestedUsers(posts), [posts]);
  const discoverPosts = useMemo(() => generateDiscoverPosts(posts), [posts]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return suggestedUsers;
    return suggestedUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, suggestedUsers]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return trendingTopics;
    return trendingTopics.filter(topic => 
      topic.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, trendingTopics]);

  const handleSearch = (query: string) => {
    if (!query.trim() || query.length > 100) return;
    const sanitizedQuery = query.trim();
    setSearchQuery(sanitizedQuery);
    if (sanitizedQuery) {
      addToSearchHistory(sanitizedQuery);
    }
  };

  const handleFollowToggle = async (userId: number) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const user = suggestedUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (isFollowing(userId)) {
      unfollowUser(userId);
      addNotification({
        id: Date.now(),
        type: 'unfollow',
        user: { name: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
        message: `unfollowed ${user.name}`,
        time: 'now',
      });
    } else {
      followUser(userId);
      addNotification({
        id: Date.now(),
        type: 'follow',
        user: { name: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
        message: `started following ${user.name}`,
        time: 'now',
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌿 {PlantTerminology.discover}</Text>
          <Text style={styles.headerSubtitle}>Find your garden community</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.searchContainer}>
            <GlassCard style={styles.searchCard}>
              <Search color={PlantTheme.colors.primary} size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search farmers, gardens, topics..."
                placeholderTextColor={PlantTheme.colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp color={PlantTheme.colors.primary} size={24} />
              <Text style={styles.sectionTitle}>🌱 Trending in Agriculture</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredTopics.map((topic) => (
                <TouchableOpacity key={topic.id} style={styles.trendingCard}>
                  <GlassCard style={styles.trendingContent}>
                    <Text style={styles.topicIcon}>{topic.icon}</Text>
                    <Text style={styles.trendingTag}>{topic.tag}</Text>
                    <Text style={styles.trendingCount}>{topic.posts} {PlantTerminology.posts.toLowerCase()}</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TreePine color={PlantTheme.colors.primary} size={24} />
              <Text style={styles.sectionTitle}>🌳 {PlantTerminology.followers} to Connect</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredUsers.map((user) => (
                <TouchableOpacity key={user.id} style={styles.userCard}>
                  <GlassCard style={styles.userContent}>
                    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>{user.username}</Text>
                    <Text style={styles.userSpecialty}>{user.specialty}</Text>
                    <Text style={styles.userStats}>{user.followers} {PlantTerminology.followers.toLowerCase()}</Text>
                    <TouchableOpacity 
                      style={[
                        styles.followButton,
                        isFollowing(user.id) && styles.followingButton
                      ]}
                      onPress={() => handleFollowToggle(user.id)}
                    >
                      <Text style={[
                        styles.followButtonText,
                        isFollowing(user.id) && styles.followingButtonText
                      ]}>
                        {isFollowing(user.id) ? PlantTerminology.following : 'Connect'}
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sprout color={PlantTheme.colors.primary} size={24} />
              <Text style={styles.sectionTitle}>🌾 Explore Gardens</Text>
            </View>
            <View style={styles.exploreGrid}>
              {discoverPosts.map((post, index) => (
                <TouchableOpacity 
                  key={post.id} 
                  style={[
                    styles.exploreItem,
                    { width: (width - 50) / 3, height: (width - 50) / 3 },
                    index % 3 === 0 && { width: (width - 45) / 2, height: (width - 45) / 2 }
                  ]}
                >
                  <Image source={{ uri: post.image }} style={styles.exploreImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(46, 125, 50, 0.8)']}
                    style={styles.exploreOverlay}
                  >
                    <Text style={styles.exploreTitle}>{post.title}</Text>
                    <Text style={styles.exploreLikes}>☀️ {post.likes}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
    backgroundColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
  },
  trendingCard: {
    marginLeft: 20,
    width: 160,
  },
  trendingContent: {
    alignItems: 'center',
    gap: 8,
    padding: 15,
    backgroundColor: 'transparent',
  },
  topicIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  trendingTag: {
    color: PlantTheme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  trendingCount: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 12,
  },
  userCard: {
    marginLeft: 20,
    width: 150,
  },
  userContent: {
    alignItems: 'center',
    gap: 8,
    padding: 15,
    backgroundColor: 'transparent',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: PlantTheme.colors.primary,
  },
  userName: {
    color: PlantTheme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  userUsername: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 12,
  },
  userSpecialty: {
    color: PlantTheme.colors.primary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  userStats: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  followButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: PlantTheme.borderRadius.lg,
    ...PlantTheme.shadows.sm,
  },
  followButtonText: {
    color: PlantTheme.colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  followingButton: {
    backgroundColor: PlantTheme.colors.glassBackground,
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
  },
  followingButtonText: {
    color: PlantTheme.colors.primary,
  },
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 5,
  },
  exploreItem: {
    borderRadius: PlantTheme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: 5,
    ...PlantTheme.shadows.sm,
  },
  exploreImage: {
    width: '100%',
    height: '100%',
  },
  exploreOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  exploreTitle: {
    color: PlantTheme.colors.white,
    fontWeight: '600',
    fontSize: 11,
    marginBottom: 2,
  },
  exploreLikes: {
    color: PlantTheme.colors.white,
    fontWeight: '500',
    fontSize: 10,
  },
});