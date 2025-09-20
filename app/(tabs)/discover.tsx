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

const trendingTopics = [
  { id: 1, tag: '#SustainableFarming', posts: '2.3M', icon: '🌱' },
  { id: 2, tag: '#OrganicGardening', posts: '1.8M', icon: '🌿' },
  { id: 3, tag: '#ClimateChange', posts: '956K', icon: '🌍' },
  { id: 4, tag: '#GreenTech', posts: '743K', icon: '♻️' },
  { id: 5, tag: '#PermaCulture', posts: '542K', icon: '🌳' },
];

const suggestedUsers = [
  { id: 1, name: 'Alex Chen', username: '@alexchen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', followers: 1250, following: 890, specialty: 'Organic Farming' },
  { id: 2, name: 'Maya Patel', username: '@mayapatel', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', followers: 2340, following: 567, specialty: 'Permaculture' },
  { id: 3, name: 'Jordan Kim', username: '@jordankim', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', followers: 890, following: 1200, specialty: 'Urban Gardening' },
  { id: 4, name: 'Sophie Wilson', username: '@sophiewilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', followers: 3450, following: 234, specialty: 'Climate Science' },
  { id: 5, name: 'Ryan Martinez', username: '@ryanmartinez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', followers: 567, following: 890, specialty: 'Sustainable Tech' },
];

const discoverPosts = [
  { id: 1, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', likes: '1.2K', title: 'Tomato Harvest' },
  { id: 2, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', likes: '856', title: 'Green Garden' },
  { id: 3, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop', likes: '2.1K', title: 'Sustainable Farm' },
  { id: 4, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop', likes: '743', title: 'Wheat Field' },
  { id: 5, image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=400&fit=crop', likes: '1.5K', title: 'Organic Vegetables' },
  { id: 6, image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&h=400&fit=crop', likes: '967', title: 'Greenhouse Growing' },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { followUser, unfollowUser, isFollowing, addToSearchHistory, addNotification } = useAppContext();

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return suggestedUsers;
    return suggestedUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return trendingTopics;
    return trendingTopics.filter(topic => 
      topic.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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