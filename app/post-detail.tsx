import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Sun, Sprout, Share2, Send } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { PlantTheme, PlantTerminology } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';
import { usePosts } from '@/hooks/use-posts';
import { AnimatedIconButton } from '@/components/AnimatedPressable';
import * as Haptics from 'expo-haptics';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { posts, toggleLike, toggleShare, addComment, isLoading } = usePosts();
  const insets = useSafeAreaInsets();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const post = posts.find(p => p.id === postId);
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <Text style={styles.errorText}>Loading...</Text>
        </View>
      </View>
    );
  }
  
  if (!post) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <Text style={styles.errorText}>Post not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const handleLike = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    toggleLike(post.id);
  };
  
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Empty Comment', 'Please write something before posting.');
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }

    setIsSubmitting(true);
    try {
      await addComment(post.id, commentText.trim());
      setCommentText('');
      Alert.alert('Success', 'Your roots have been added! 🌱');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleShare = () => {
    console.log('Spreading seeds (sharing) for post:', post.id);
    toggleShare(post.id);
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color={PlantTheme.colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌱 Seed Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.postCard}>
            {/* Author Info */}
            <View style={styles.authorSection}>
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
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.user.name}</Text>
                <Text style={styles.postTime}>{post.timestamp}</Text>
              </View>
            </View>
            
            {/* Post Content */}
            <Text style={styles.postContent}>{post.content}</Text>
            
            {/* Post Image */}
            {post.image && (
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                contentFit="cover"
                transition={Platform.OS === 'web' ? 0 : 200}
                cachePolicy="memory-disk"
                priority="normal"
              />
            )}
            
            {/* Engagement Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.statsText}>
                {post.likes} {PlantTerminology.likes} • {post.comments} {PlantTerminology.comments}
              </Text>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={[styles.actionButton, post.isLiked && styles.actionButtonActive]}
                onPress={handleLike}
                activeOpacity={0.7}
              >
                <Sun size={24} color={post.isLiked ? PlantTheme.colors.accent : PlantTheme.colors.textSecondary} />
                <Text style={[styles.actionText, post.isLiked && styles.actionTextActive]}>
                  {PlantTerminology.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.7}
                disabled
              >
                <Sprout size={24} color={PlantTheme.colors.primary} />
                <Text style={styles.actionText}>{PlantTerminology.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, post.isShared && styles.actionButtonActive]}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share2 size={24} color={post.isShared ? PlantTheme.colors.secondary : PlantTheme.colors.textSecondary} />
                <Text style={[styles.actionText, post.isShared && styles.actionTextActive]}>
                  {PlantTerminology.share}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
          
          {/* Comments Section */}
          <GlassCard style={styles.commentsCard}>
            <Text style={styles.commentsTitle}>🌿 {PlantTerminology.comments}</Text>
            <Text style={styles.commentsPlaceholder}>
              Share your thoughts and grow the conversation!
            </Text>
          </GlassCard>
        </ScrollView>

        {/* Comment Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom || 16 }]}>
            <GlassCard style={styles.commentInputCard}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add your roots... 🌱"
                placeholderTextColor={PlantTheme.colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                editable={!isSubmitting}
              />
              <AnimatedIconButton
                style={[
                  styles.sendButton,
                  (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
                bounceEffect="medium"
              >
                <Send 
                  size={20} 
                  color={commentText.trim() && !isSubmitting ? PlantTheme.colors.primary : PlantTheme.colors.textSecondary}
                />
              </AnimatedIconButton>
            </GlassCard>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: PlantTheme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postCard: {
    padding: 20,
    marginBottom: 20,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PlantTheme.colors.cardBackground,
    borderWidth: 2,
    borderColor: PlantTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
  },
  avatarText: {
    color: PlantTheme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
  },
  postTime: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: PlantTheme.colors.textPrimary,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: PlantTheme.borderRadius.md,
    marginBottom: 16,
  },
  statsSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: PlantTheme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    fontWeight: '500',
  },
  actionTextActive: {
    color: PlantTheme.colors.primary,
  },
  commentsCard: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 12,
  },
  commentsPlaceholder: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: PlantTheme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  commentInputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  commentInputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: PlantTheme.colors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: PlantTheme.colors.surfaceVariant,
    borderRadius: PlantTheme.borderRadius.md,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: PlantTheme.borderRadius.full,
    backgroundColor: PlantTheme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...PlantTheme.shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: PlantTheme.colors.surfaceVariant,
    opacity: 0.5,
  },
});