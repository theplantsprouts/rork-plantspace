import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';
import { usePosts, type Post } from '@/hooks/use-posts';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTabBar } from './_layout';


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { posts, toggleLike, isLoading, error, refresh } = usePosts();
  const { handleScroll } = useTabBar();
  
  const onScroll = useCallback((event: any) => {
    if (event?.nativeEvent?.contentOffset?.y !== undefined) {
      handleScroll(event);
    }
  }, [handleScroll]);

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

  const memoizedPosts = useMemo(() => {
    return Platform.OS === 'web' ? posts : posts.slice(0, 50);
  }, [posts]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Bloom</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
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
          </View>
        ) : (
          memoizedPosts.map((post) => (
            <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

function PostCard({ post, onLike }: PostCardProps) {
  return (
    <View style={styles.postCard}>
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <View style={styles.avatarContainer}>
            {post.user.avatar ? (
              <Image
                source={{ uri: post.user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {post.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{post.user.name}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
        </View>
        <Text style={styles.postText}>{post.content}</Text>
      </View>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <View style={styles.actionIconContainer}>
            <Heart 
              size={20} 
              color={post.isLiked ? PlantTheme.colors.primary : PlantTheme.colors.onSurfaceVariant}
              fill={post.isLiked ? PlantTheme.colors.primary : 'none'}
            />
          </View>
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <MessageCircle size={20} color={PlantTheme.colors.onSurfaceVariant} />
          </View>
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <Share2 size={20} color={PlantTheme.colors.onSurfaceVariant} />
          </View>
          <Text style={styles.actionText}>{post.shares || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlantTheme.colors.backgroundStart,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(246, 248, 246, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 121, 111, 0.2)',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: PlantTheme.colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  postCard: {
    backgroundColor: PlantTheme.colors.surface,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    ...PlantTheme.shadows.sm,
  },
  postImage: {
    width: '100%',
    height: 192,
  },
  postContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PlantTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PlantTheme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PlantTheme.colors.onSurface,
  },
  timestamp: {
    fontSize: 14,
    color: PlantTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    color: PlantTheme.colors.onSurfaceVariant,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 121, 111, 0.2)',
    paddingVertical: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: PlantTheme.colors.onSurfaceVariant,
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
    fontWeight: '700' as const,
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
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});