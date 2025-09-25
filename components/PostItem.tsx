import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { Sun, Sprout, Share2 } from "lucide-react-native";
import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { type Post } from "@/hooks/use-posts";
import * as Haptics from 'expo-haptics';

interface PostItemProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  testID?: string;
}

function PostItem({ post, onLike, onComment, onShare, testID }: PostItemProps) {
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
    
    if (Platform.OS === 'web') {
      // For web, use a simple prompt
      const comment = prompt('🌱 Add Roots (Comment)\nShare your thoughts on this seed:');
      if (comment && comment.trim()) {
        onComment?.();
        console.log('Comment added:', comment);
      }
    } else {
      // For mobile, use Alert.alert with input simulation
      Alert.alert(
        '🌱 Add Roots (Comment)',
        'Share your thoughts on this seed:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Post', 
            onPress: () => {
              // For now, just trigger the callback
              // In a real app, you'd want to implement a proper input modal
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
          <Sun size={20} color={PlantTheme.colors.accent} />
          <Text style={styles.actionText}>{post.likes} {PlantTerminology.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleComment}
          testID={`comment-button-${post.id}`}
          activeOpacity={0.7}
        >
          <Sprout size={20} color={PlantTheme.colors.primary} />
          <Text style={styles.actionText}>{post.comments} {PlantTerminology.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          testID={`share-button-${post.id}`}
          activeOpacity={0.7}
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