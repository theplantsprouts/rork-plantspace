import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react-native";
import { PlantTheme } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { type Post } from "@/hooks/use-posts";
import * as Haptics from 'expo-haptics';

interface PostItemProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  testID?: string;
}

function PostItem({ post, onLike, onComment, onShare, onBookmark, testID }: PostItemProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const handleLike = useCallback(async () => {
    console.log('Sunshine (like) pressed for post:', post.id);
    
    // Haptic feedback for better UX
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    
    onLike?.();
  }, [onLike, post.id]);
  
  const handleComment = useCallback(() => {
    console.log('Roots (comment) pressed for post:', post.id);
    
    // For now, simulate adding a comment without using Alert.prompt
    // In a real app, you'd want to implement a proper input modal
    if (Platform.OS === 'web') {
      // For web, show a simple confirmation
      Alert.alert(
        '🌱 Add Roots (Comment)',
        'Comment functionality will open a modal in the full version.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Comment', 
            onPress: () => {
              onComment?.();
              console.log('Comment action triggered');
            }
          },
        ]
      );
    } else {
      // For mobile, use Alert.alert with simulated comment
      Alert.alert(
        '🌱 Add Roots (Comment)',
        'Comment functionality will open a modal in the full version.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Comment', 
            onPress: () => {
              // Simulate adding a comment
              onComment?.();
              console.log('Comment action triggered');
            }
          },
        ]
      );
    }
  }, [onComment, post.id]);
  
  const handleShare = useCallback(() => {
    console.log('Spread Seeds (share) pressed for post:', post.id);
    
    // Show share options
    Alert.alert(
      '🌱 Spread Seeds',
      'How would you like to share this seed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy Link', onPress: () => {
          console.log('Copy link for post:', post.id);
          onShare?.();
        }},
        { text: 'Share to Garden', onPress: () => {
          console.log('Share to garden for post:', post.id);
          onShare?.();
        }},
      ]
    );
  }, [onShare, post.id]);
  
  const handleBookmark = useCallback(async () => {
    console.log('Bookmark pressed for post:', post.id);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  }, [isBookmarked, onBookmark, post.id]);

  return (
    <GlassCard style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.user.avatar ? (
            <Image
              source={{ uri: post.user.avatar }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={100}
            />
          ) : (
            <Text style={styles.avatarText}>
              {post.user.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.user.name}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmark}
          testID={`bookmark-button-${post.id}`}
          activeOpacity={0.7}
        >
          <Bookmark 
            size={20} 
            color={isBookmarked ? PlantTheme.colors.primary : PlantTheme.colors.onSurfaceVariant}
            fill={isBookmarked ? PlantTheme.colors.primary : 'none'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.image}
          contentFit="cover"
          transition={Platform.OS === 'web' ? 0 : 200}
          cachePolicy="memory-disk"
          priority="normal"
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          testID={`like-button-${post.id}`}
          activeOpacity={0.7}
        >
          <Heart 
            size={20} 
            color={post.isLiked ? PlantTheme.colors.primary : PlantTheme.colors.onSurfaceVariant}
            fill={post.isLiked ? PlantTheme.colors.primary : 'none'}
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
          testID={`comment-button-${post.id}`}
          activeOpacity={0.7}
        >
          <MessageCircle size={20} color={PlantTheme.colors.onSurfaceVariant} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          testID={`share-button-${post.id}`}
          activeOpacity={0.7}
        >
          <Share2 size={20} color={PlantTheme.colors.onSurfaceVariant} />
          <Text style={styles.actionText}>{post.shares || 0}</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PlantTheme.colors.cardBackground,
    borderWidth: 2,
    borderColor: PlantTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...PlantTheme.shadows.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  avatarText: {
    color: PlantTheme.colors.primary,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  userInfo: {
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: PlantTheme.colors.textPrimary,
  },
  timestamp: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    marginTop: 2,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: PlantTheme.colors.textPrimary,
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: PlantTheme.borderRadius.md,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: PlantTheme.colors.cardBorder,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default memo(PostItem);