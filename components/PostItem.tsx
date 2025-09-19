import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Sun, Sprout, Share2 } from "lucide-react-native";
import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";

interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  likes: number;
  comments: number;
}

interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  testID?: string;
}

function PostItem({ post, onLike, onComment, onShare, testID }: PostItemProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <GlassCard style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.userId.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>User {post.userId.slice(0, 8)}</Text>
          <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike?.(post.id)}
          testID={`like-button-${post.id}`}
        >
          <Sun size={20} color={PlantTheme.colors.accent} />
          <Text style={styles.actionText}>{post.likes} {PlantTerminology.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post.id)}
          testID={`comment-button-${post.id}`}
        >
          <Sprout size={20} color={PlantTheme.colors.primary} />
          <Text style={styles.actionText}>{post.comments} {PlantTerminology.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare?.(post.id)}
          testID={`share-button-${post.id}`}
        >
          <Share2 size={20} color={PlantTheme.colors.secondary} />
          <Text style={styles.actionText}>{PlantTerminology.share}</Text>
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
    backgroundColor: PlantTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...PlantTheme.shadows.sm,
  },
  avatarText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  userInfo: {
    flex: 1,
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
    borderTopColor: PlantTheme.colors.glassBorder,
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