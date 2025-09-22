import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { Heading, Sparkles, Wifi, WifiOff, Sun, Droplets } from 'lucide-react-native';
import { PlantTheme, PlantTerminology } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';
import { StoryCircles } from '@/components/StoryCircles';

// import { useAuth } from '@/hooks/use-auth'; // No longer needed at component level
import { useOffline } from '@/hooks/use-offline';
import { usePosts, type Post } from '@/hooks/use-posts';
import VirtualizedList from '@/components/VirtualizedList';
import PostItem from '@/components/PostItem';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTabBar } from './_layout';


export default function HomeScreen() {
  // const { user } = useAuth(); // Authentication handled at layout level
  const { isOnline } = useOffline();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showInsights, setShowInsights] = useState(false);
  const { posts, toggleLike, toggleShare, addComment, isLoading, error, refresh } = usePosts();
  // Enable scroll handling for tab bar animation
  const { handleScroll } = useTabBar();
  
  const onScroll = useCallback((event: any) => {
    if (event?.nativeEvent?.contentOffset?.y !== undefined) {
      handleScroll(event);
      console.log('Home screen scrolling:', event.nativeEvent.contentOffset.y);
    }
  }, [handleScroll]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Removed caching logic to prevent infinite loops
  // TODO: Implement proper caching without causing re-renders



  const handleCreatePost = useCallback(() => {
    router.push('/create-post');
  }, []);

  const handleLike = useCallback(async (postId: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    toggleLike(postId);
  }, [toggleLike]);


  const handleComment = useCallback((postId: string) => {
    console.log('Comment functionality for post:', postId);
    // Here you would implement comment functionality
    // For now, just add a mock comment
    addComment(postId, 'Great post! 🌱');
  }, [addComment]);

  const handleShare = useCallback((postId: string) => {
    console.log('Share functionality for post:', postId);
    toggleShare(postId);
  }, [toggleShare]);

  const renderPost = useCallback(({ item }: { item: Post }) => {
    const onLike = () => handleLike(item.id);
    const onComment = () => handleComment(item.id);
    const onShare = () => handleShare(item.id);
    
    return (
      <PostItem
        post={item}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
        testID={`post-${item.id}`}
      />
    );
  }, [handleLike, handleComment, handleShare]);

  const memoizedPosts = useMemo(() => {
    // Limit posts for better performance on mobile
    return Platform.OS === 'web' ? posts : posts.slice(0, 50);
  }, [posts]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  // Authentication is now handled at the layout level
  // This component will only render when user is authenticated

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>🌿 {PlantTerminology.home}</Text>
            <Text style={styles.headerSubtitle}>Nurture your community</Text>

          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowInsights(!showInsights)}
            >
              <Sparkles color={showInsights ? "#4ECDC4" : "#fff"} size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreatePost}
            >
              <GlassCard style={styles.createButtonGlass}>
                <Heading color={PlantTheme.colors.primary} size={20} />
                <Text style={styles.createButtonText}>{PlantTerminology.create}</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </View>

        {showInsights && (
          <View style={styles.aiInsightsPanel}>
            <GlassCard style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>🌱 Garden Insights</Text>
              <View style={styles.insightsGrid}>
                <View style={styles.insightCard}>
                  <Sun color={PlantTheme.colors.accent} size={16} />
                  <Text style={styles.insightValue}>{posts.length}</Text>
                  <Text style={styles.insightLabel}>Seeds Planted</Text>
                </View>
                <View style={styles.insightCard}>
                  <Droplets color={PlantTheme.colors.primary} size={16} />
                  <Text style={styles.insightValue}>{posts.reduce((acc, post) => acc + post.likes, 0)}</Text>
                  <Text style={styles.insightLabel}>Sunshine Given</Text>
                </View>
                <View style={styles.insightCard}>
                  {isOnline ? (
                    <Wifi color={PlantTheme.colors.success} size={16} />
                  ) : (
                    <WifiOff color={PlantTheme.colors.error} size={16} />
                  )}
                  <Text style={styles.insightValue}>{isOnline ? 'Growing' : 'Dormant'}</Text>
                  <Text style={styles.insightLabel}>Garden Status</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        <Animated.View style={[styles.postsContainer, { opacity: fadeAnim }]}>
          {!isLoading && memoizedPosts.length > 0 && (
            <StoryCircles posts={memoizedPosts} />
          )}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PlantTheme.colors.primary} />
              <Text style={styles.loadingText}>Loading your garden...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>🌱 Connection Issue</Text>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => {
                if (Platform.OS === 'web') {
                  window.location.reload();
                } else {
                  refresh();
                }
              }}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : memoizedPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>🌿 Welcome to Your Garden!</Text>
              <Text style={styles.emptyText}>Your community garden is ready to grow. Start by planting your first seed!</Text>
              <TouchableOpacity style={styles.createFirstPostButton} onPress={handleCreatePost}>
                <GlassCard style={styles.createFirstPostGlass}>
                  <Heading color={PlantTheme.colors.primary} size={24} />
                  <Text style={styles.createFirstPostText}>Plant Your First Seed</Text>
                </GlassCard>
              </TouchableOpacity>
            </View>
          ) : (
            <VirtualizedList
              data={memoizedPosts}
              renderItem={renderPost}
              keyExtractor={keyExtractor}
              estimatedItemSize={Platform.OS === 'web' ? 280 : 320}
              testID="posts-list"
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  createButton: {
    marginLeft: 8,
  },
  createButtonGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: PlantTheme.colors.cardBackground,
  },
  createButtonText: {
    color: PlantTheme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  postsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  // Removed auth-related styles as they're no longer needed
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiInsightsPanel: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  insightsContainer: {
    padding: 16,
    backgroundColor: PlantTheme.colors.cardBackground,
  },
  insightsTitle: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: PlantTheme.colors.cardBackground,
    borderRadius: PlantTheme.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
  },
  insightValue: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  insightLabel: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstPostButton: {
    marginTop: 16,
  },
  createFirstPostGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: PlantTheme.colors.cardBackground,
  },
  createFirstPostText: {
    color: PlantTheme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: PlantTheme.borderRadius.md,
  },
  retryButtonText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

});