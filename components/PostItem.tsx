import React, { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, Alert, Modal, Pressable } from "react-native";
import { Image } from "expo-image";
import { Sprout, Leaf, Heading, Bookmark, MoreVertical, Trash2, Flag } from "lucide-react-native";
import { PlantTheme } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { type Post } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-auth";
import { deletePost, reportPost } from "@/lib/firebase";
import { AnimatedIconButton } from "@/components/AnimatedPressable";

interface PostItemProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onDelete?: () => void;
  testID?: string;
}

function PostItem({ post, onLike, onComment, onShare, onBookmark, onDelete, testID }: PostItemProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useAuth();
  
  const isOwnPost = user?.id === post.user.id;
  const handleLike = useCallback(async () => {
    console.log('Sunshine pressed for post:', post.id);
    onLike?.();
  }, [onLike, post.id]);
  
  const handleComment = useCallback(() => {
    console.log('Roots pressed for post:', post.id);
    onComment?.();
  }, [onComment, post.id]);
  
  const handleShare = useCallback(() => {
    console.log('Spread Seeds pressed for post:', post.id);
    onShare?.();
  }, [onShare, post.id]);
  
  const handleBookmark = useCallback(async () => {
    console.log('Harvest pressed for post:', post.id);
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  }, [isBookmarked, onBookmark, post.id]);
  
  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);
  
  const handleDeletePost = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user?.id) {
              Alert.alert("Error", "You must be logged in to delete posts");
              return;
            }
            try {
              await deletePost(user.id, post.id);
              Alert.alert("Success", "Post deleted successfully");
              onDelete?.();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete post");
            }
          },
        },
      ]
    );
  }, [post.id, user?.id, onDelete]);
  
  const handleReportPost = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      "Report Post",
      "Why are you reporting this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Spam",
          onPress: async () => {
            if (!user?.id) {
              Alert.alert("Error", "You must be logged in to report posts");
              return;
            }
            try {
              await reportPost(user.id, post.id, "spam");
              Alert.alert("Success", "Post reported successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to report post");
            }
          },
        },
        {
          text: "Inappropriate",
          onPress: async () => {
            if (!user?.id) {
              Alert.alert("Error", "You must be logged in to report posts");
              return;
            }
            try {
              await reportPost(user.id, post.id, "inappropriate");
              Alert.alert("Success", "Post reported successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to report post");
            }
          },
        },
        {
          text: "Misleading",
          onPress: async () => {
            if (!user?.id) {
              Alert.alert("Error", "You must be logged in to report posts");
              return;
            }
            try {
              await reportPost(user.id, post.id, "misleading");
              Alert.alert("Success", "Post reported successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to report post");
            }
          },
        },
      ]
    );
  }, [post.id, user?.id]);

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
              transition={0}
              priority="low"
              recyclingKey={post.user.avatar}
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
        <View style={styles.headerActions}>
          <AnimatedIconButton
            style={styles.bookmarkButton}
            onPress={handleBookmark}
            testID={`bookmark-button-${post.id}`}
          >
            <Bookmark 
              size={20} 
              color={isBookmarked ? PlantTheme.colors.primary : PlantTheme.colors.onSurfaceVariant}
              fill={isBookmarked ? PlantTheme.colors.primary : 'none'}
            />
          </AnimatedIconButton>
          <AnimatedIconButton
            style={styles.menuButton}
            onPress={handleMenuPress}
            testID={`menu-button-${post.id}`}
          >
            <MoreVertical 
              size={24} 
              color={PlantTheme.colors.textPrimary}
            />
          </AnimatedIconButton>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.image}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
          priority="normal"
          recyclingKey={post.image}
        />
      )}

      <View style={styles.actions}>
        <AnimatedIconButton
          style={styles.actionButton}
          onPress={handleLike}
          testID={`like-button-${post.id}`}
          bounceEffect="medium"
        >
          <Sprout 
            size={20} 
            color={post.isLiked ? PlantTheme.colors.primary : PlantTheme.colors.onSurfaceVariant}
            fill={post.isLiked ? PlantTheme.colors.primary : 'none'}
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </AnimatedIconButton>

        <AnimatedIconButton
          style={styles.actionButton}
          onPress={handleComment}
          testID={`comment-button-${post.id}`}
          bounceEffect="medium"
        >
          <Leaf size={20} color={PlantTheme.colors.onSurfaceVariant} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </AnimatedIconButton>

        <AnimatedIconButton
          style={styles.actionButton}
          onPress={handleShare}
          testID={`share-button-${post.id}`}
          bounceEffect="medium"
        >
          <Heading size={20} color={PlantTheme.colors.onSurfaceVariant} />
          <Text style={styles.actionText}>{post.shares || 0}</Text>
        </AnimatedIconButton>
      </View>
      
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {isOwnPost ? (
              <AnimatedIconButton
                style={styles.menuItem}
                onPress={handleDeletePost}
                bounceEffect="subtle"
              >
                <Trash2 size={20} color={PlantTheme.colors.error} />
                <Text style={[styles.menuText, styles.deleteText]}>Delete Post</Text>
              </AnimatedIconButton>
            ) : (
              <AnimatedIconButton
                style={styles.menuItem}
                onPress={handleReportPost}
                bounceEffect="subtle"
              >
                <Flag size={20} color={PlantTheme.colors.onSurfaceVariant} />
                <Text style={styles.menuText}>Report Post</Text>
              </AnimatedIconButton>
            )}
          </View>
        </Pressable>
      </Modal>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bookmarkButton: {
    padding: 8,
  },
  menuButton: {
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
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: PlantTheme.colors.surfaceVariant,
    borderRadius: PlantTheme.borderRadius.full,
    gap: 6,
    minWidth: 70,
    justifyContent: "center",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: PlantTheme.colors.cardBackground,
    borderRadius: PlantTheme.borderRadius.lg,
    padding: 8,
    minWidth: 200,
    ...PlantTheme.shadows.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: PlantTheme.colors.textPrimary,
    fontWeight: '500' as const,
  },
  deleteText: {
    color: PlantTheme.colors.error,
  },
});

export default memo(PostItem);