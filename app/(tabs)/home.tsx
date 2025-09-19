import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { Heading, Sparkles, Wifi, WifiOff, Sun, Droplets } from 'lucide-react-native';
import { PlantTheme, PlantTerminology } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';

import { useAuth } from '@/hooks/use-auth';
import { useOffline } from '@/hooks/use-offline';
import { usePosts, type Post } from '@/hooks/use-posts';
import VirtualizedList from '@/components/VirtualizedList';
import PostItem from '@/components/PostItem';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { user } = useAuth();
  const { isOnline, cachedPosts, cachePost } = useOffline();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showInsights, setShowInsights] = useState(false);
  const { posts, toggleLike } = usePosts();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (posts.length > 0) {
      // Cache posts for offline use
      posts.forEach(cachePost);
    } else if (!isOnline && cachedPosts.length > 0) {
      // Use cached posts when offline
    }
  }, [posts, isOnline, cachedPosts, cachePost]);

  const handleCreatePost = useCallback(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    router.push('/create-post');
  }, [user]);

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

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onLike={() => handleLike(item.id)}
      testID={`post-${item.id}`}
    />
  ), [handleLike]);

  const memoizedPosts = useMemo(() => posts, [posts]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <LinearGradient
          colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.authContent, { paddingTop: insets.top }]}>
            <Text style={styles.authTitle}>🌱 Welcome to Garden</Text>
            <Text style={styles.authSubtitle}>Grow with our sustainable community</Text>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.authButtonText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <VirtualizedList
            data={memoizedPosts}
            renderItem={renderPost}
            keyExtractor={keyExtractor}
            estimatedItemSize={300}
            testID="posts-list"
          />
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
  authContainer: {
    flex: 1,
  },
  authContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 18,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: PlantTheme.borderRadius.md,
    ...PlantTheme.shadows.md,
  },
  authButtonText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
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
    backgroundColor: PlantTheme.colors.glassBackground,
    borderRadius: PlantTheme.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
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

});