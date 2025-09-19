import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Sun, Sprout, Share2 } from "lucide-react-native";
import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { type Post } from "@/hooks/use-posts";

interface PostItemProps {
  post: Post;
  onLike?: () => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  testID?: string;
}

function PostItem({ post, onLike, onComment, onShare, testID }: PostItemProps) {

  return (
    <GlassCard style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.user.avatar ? (
            <Image
              source={{ uri: post.user.avatar }}
              style={styles.avatarImage}
              contentFit="cover"
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
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
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