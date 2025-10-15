import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Share,
  Platform,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Sprout, Leaf, Heading, Bookmark } from 'lucide-react-native';
import { usePosts, type Post } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import { borderRadius, shadows } from '@/constants/theme';
import { AnimatedIconButton, AnimatedButton } from '@/components/AnimatedPressable';


export default function HomeScreen() {
  const { posts, toggleLike, togglePostBookmark, toggleShare, addComment, isLoading, error, refresh, loadMore, hasMore } = usePosts();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleLike = useCallback(async (postId: string) => {
    toggleLike(postId);
  }, [toggleLike]);

  const memoizedPosts = useMemo(() => {
    return posts;
  }, [posts]);

  const renderPost: ListRenderItem<Post> = useCallback(({ item: post }) => (
    <PostCard 
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
      onShare={async () => {
        try {
          const shareMessage = `Check out this post from ${post.user.name}:\n\n${post.content}`;
          const shareUrl = `plantspace://post/${post.id}`;
          
          if (Platform.OS === 'web') {
            if (navigator.share) {
              await navigator.share({
                title: `Post by ${post.user.name}`,
                text: shareMessage,
                url: shareUrl,
              });
            } else {
              await navigator.clipboard.writeText(`${shareMessage}\n${shareUrl}`);
              Alert.alert('✨ Copied!', 'Post link copied to clipboard.');
            }
          } else {
            await Share.share({
              message: `${shareMessage}\n${shareUrl}`,
              title: `Post by ${post.user.name}`,
            });
          }
          
          await toggleShare(post.id);
        } catch (error: any) {
          if (error.message !== 'User did not share') {
            console.error('Share error:', error);
          }
        }
      }}
    />
  ), [colors, handleLike, togglePostBookmark, addComment, toggleShare]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Watering your garden...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>🌱 Connection Issue</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{error}</Text>
          <AnimatedButton style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => {
            refresh();
          }}>
            <Text style={[styles.retryButtonText, { color: colors.white }]}>Try Again</Text>
          </AnimatedButton>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>🌿 Welcome to Your Garden!</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your community garden is ready to grow. Start by planting your first seed!</Text>
      </View>
    );
  }, [isLoading, error, colors, refresh]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [hasMore, colors.primary]);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundStart }]}>
      <FlatList
        data={memoizedPosts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={10}
      />
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
    <View style={[styles.postCard, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
      <View style={styles.postCardContent}>
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          contentFit="cover"
          transition={100}
          cachePolicy="memory-disk"
          priority="normal"
          recyclingKey={post.image}
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
                priority="low"
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
          <AnimatedIconButton style={styles.bookmarkButton} onPress={onBookmark}>
            <Bookmark 
              size={20} 
              color={post.isBookmarked ? colors.primary : colors.onSurfaceVariant}
              fill={post.isBookmarked ? colors.primary : 'none'}
            />
          </AnimatedIconButton>
        </View>
        <Text style={[styles.postText, { color: colors.onSurfaceVariant }]}>{post.content}</Text>
      </View>
      <View style={[styles.postActions, { borderTopColor: `${colors.outline}33` }]}>
        <AnimatedIconButton 
          style={[styles.actionButton, { backgroundColor: `${colors.surfaceVariant}80` }]} 
          onPress={onLike}
          bounceEffect="medium"
        >
          <View style={styles.actionIconContainer}>
            <Sprout 
              size={20} 
              color={post.isLiked ? colors.primary : colors.onSurfaceVariant}
              fill={post.isLiked ? colors.primary : 'none'}
            />
          </View>
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.likes}</Text>
        </AnimatedIconButton>
        <AnimatedIconButton 
          style={[styles.actionButton, { backgroundColor: `${colors.surfaceVariant}80` }]} 
          onPress={onComment}
          bounceEffect="medium"
        >
          <View style={styles.actionIconContainer}>
            <Leaf size={20} color={colors.onSurfaceVariant} />
          </View>
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.comments}</Text>
        </AnimatedIconButton>
        <AnimatedIconButton 
          style={[styles.actionButton, { backgroundColor: `${colors.surfaceVariant}80` }]} 
          onPress={onShare}
          bounceEffect="medium"
        >
          <View style={styles.actionIconContainer}>
            <Heading size={20} color={colors.onSurfaceVariant} />
          </View>
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.shares || 0}</Text>
        </AnimatedIconButton>
      </View>
      </View>
    </View>
  );
});

PostCard.displayName = 'PostCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },


  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postCard: {
    borderRadius: borderRadius.card,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    ...shadows.md,
  },
  postCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  postImage: {
    width: '100%',
    height: 220,
  },
  postContent: {
    padding: 20,
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
    width: 44,
    height: 44,
    borderRadius: borderRadius.avatar,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.avatar,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    flex: 1,
    minHeight: 44,
    ...shadows.sm,
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
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});