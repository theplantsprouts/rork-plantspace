import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Sprout, Leaf, Heading, Bookmark, Bell } from 'lucide-react-native';
import { usePosts, type Post } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import { borderRadius, shadows } from '@/constants/theme';

import * as Haptics from 'expo-haptics';
import { useTabBar } from './_layout';
import { router } from 'expo-router';


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { posts, toggleLike, togglePostBookmark, toggleShare, addComment, isLoading, error, refresh } = usePosts();
  const { handleScroll } = useTabBar();
  const { colors } = useTheme();
  
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
    <View style={[styles.container, { backgroundColor: colors.backgroundStart }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: `${colors.background}CC`, borderBottomColor: `${colors.outline}33` }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Garden</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Bell color={colors.onSurface} size={24} />
        </TouchableOpacity>
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
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Watering your garden...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>🌱 Connection Issue</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => {
              refresh();
            }}>
              <Text style={[styles.retryButtonText, { color: colors.white }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : memoizedPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>🌿 Welcome to Your Garden!</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your community garden is ready to grow. Start by planting your first seed!</Text>
          </View>
        ) : (
          memoizedPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              colors={colors}
              onLike={() => handleLike(post.id)}
              onBookmark={() => togglePostBookmark(post.id)}
              onComment={() => {
                Alert.alert(
                  '🌱 Add Roots',
                  'Share your thoughts and grow the conversation.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Add Comment', 
                      onPress: () => {
                        addComment(post.id, 'Great post!');
                      }
                    },
                  ]
                );
              }}
              onShare={() => {
                Alert.alert(
                  '🌱 Spread Seeds',
                  'How would you like to share this seed?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Share', onPress: () => toggleShare(post.id) },
                  ]
                );
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface PostCardProps {
  post: Post;
  colors: any;
  onLike: () => void;
  onBookmark: () => void;
  onComment: () => void;
  onShare: () => void;
}

const PostCard = React.memo<PostCardProps>(({ post, colors, onLike, onBookmark, onComment, onShare }) => {
  return (
    <View style={[styles.postCard, { backgroundColor: colors.surface }]}>
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          priority="high"
          recyclingKey={post.image}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
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
                cachePolicy="memory-disk"
                priority="high"
                recyclingKey={post.user.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {post.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: colors.onSurface }]}>{post.user.name}</Text>
            <Text style={[styles.timestamp, { color: colors.onSurfaceVariant }]}>{post.timestamp}</Text>
          </View>
          <TouchableOpacity style={styles.bookmarkButton} onPress={onBookmark}>
            <Bookmark 
              size={20} 
              color={post.isBookmarked ? colors.primary : colors.onSurfaceVariant}
              fill={post.isBookmarked ? colors.primary : 'none'}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.postText, { color: colors.onSurfaceVariant }]}>{post.content}</Text>
      </View>
      <View style={[styles.postActions, { borderTopColor: `${colors.outline}33` }]}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <View style={styles.actionIconContainer}>
            <Sprout 
              size={20} 
              color={post.isLiked ? colors.primary : colors.onSurfaceVariant}
              fill={post.isLiked ? colors.primary : 'none'}
            />
          </View>
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <View style={styles.actionIconContainer}>
            <Leaf size={20} color={colors.onSurfaceVariant} />
          </View>
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <View style={styles.actionIconContainer}>
            <Heading size={20} color={colors.onSurfaceVariant} />
          </View>
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.shares || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

PostCard.displayName = 'PostCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 40,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
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
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.sm,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  userInfo: {
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  timestamp: {
    fontSize: 14,
    marginTop: 2,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
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
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});