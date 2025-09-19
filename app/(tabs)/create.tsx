import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, Leaf, Heading } from 'lucide-react-native';
import { PlantTheme, PlantTerminology } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { usePosts } from '@/hooks/use-posts';
import { useAppContext } from '@/hooks/use-app-context';
import { useAIContent } from '@/hooks/use-ai-content';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function CreateScreen() {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const { addPost } = usePosts();
  const { addNotification } = useAppContext();
  const { analyzeContent, moderatePost, isAnalyzing } = useAIContent();
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzePostContent = async () => {
    if (!postText.trim()) return;
    
    try {
      const analysis = await analyzeContent({
        content: postText.trim(),
        image: selectedImage || undefined
      });
      setAiAnalysis(analysis);
      setShowAiInsights(true);
    } catch (error) {
      console.error('Error analyzing content:', error);
    }
  };

  const handlePost = async () => {
    if (!postText.trim() && !selectedImage) {
      if (Platform.OS !== 'web') {
        Alert.alert('Empty Post', 'Please add some content or an image to your post.');
      }
      return;
    }
    
    if (postText.length > 280) {
      if (Platform.OS !== 'web') {
        Alert.alert('Post Too Long', 'Please keep your post under 280 characters.');
      }
      return;
    }

    setIsPosting(true);
    
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const newPost = await addPost(postText.trim(), selectedImage || undefined);
      
      const moderatedPost = await moderatePost(newPost);
      
      addNotification({
        id: Date.now(),
        type: 'post',
        user: { name: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
        message: moderatedPost.moderationStatus === 'approved' 
          ? 'shared a new post about agriculture/environment' 
          : 'submitted a post for review',
        time: 'now',
      });
      
      const alertTitle = moderatedPost.moderationStatus === 'approved' ? 'Post Approved!' : 'Post Under Review';
      const alertMessage = moderatedPost.moderationStatus === 'approved' 
        ? `Your agriculture/environment post has been approved and shared! AI Score: ${(moderatedPost.aiScore || 0 * 100).toFixed(0)}%`
        : 'Your post is being reviewed to ensure it meets our agriculture/environment community guidelines.';
      
      if (Platform.OS !== 'web') {
        Alert.alert(alertTitle, alertMessage, [
          {
            text: 'OK',
            onPress: () => {
              setPostText('');
              setSelectedImage(null);
              setAiAnalysis(null);
              setShowAiInsights(false);
              router.push('/(tabs)/home');
            }
          }
        ]);
      } else {
        setPostText('');
        setSelectedImage(null);
        setAiAnalysis(null);
        setShowAiInsights(false);
        router.push('/(tabs)/home');
      }
    } catch (error) {
      console.error('Error posting:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to share your post. Please try again.');
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌱 {PlantTerminology.create}</Text>
          <TouchableOpacity 
            style={[styles.postButton, isPosting && styles.postButtonDisabled]} 
            onPress={handlePost}
            disabled={isPosting}
          >
            <Text style={styles.postButtonText}>
              {isPosting ? 'Planting...' : PlantTerminology.share}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <GlassCard style={styles.postContainer}>
            <View style={styles.userSection}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' }} 
                style={styles.userAvatar}
              />
              <View>
                <Text style={styles.userName}>You</Text>
                <Text style={styles.userHandle}>@yourhandle</Text>
              </View>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="What's growing in your garden today?"
              placeholderTextColor={PlantTheme.colors.textSecondary}
              multiline
              value={postText}
              onChangeText={setPostText}
              maxLength={280}
            />

            {selectedImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.characterCount}>
              <Text style={[
                styles.characterCountText,
                postText.length > 280 && styles.characterCountError
              ]}>
                {postText.length}/280
              </Text>
            </View>

            {postText.trim().length > 10 && (
              <TouchableOpacity 
                style={styles.aiAnalyzeButton} 
                onPress={analyzePostContent}
                disabled={isAnalyzing}
              >
                <Text style={styles.aiAnalyzeText}>
                  {isAnalyzing ? '🤖 Analyzing...' : '🤖 Check AI Relevance'}
                </Text>
              </TouchableOpacity>
            )}

            {showAiInsights && aiAnalysis && (
              <View style={styles.aiInsights}>
                <Text style={styles.aiInsightsTitle}>🤖 AI Analysis</Text>
                <View style={styles.aiScoreContainer}>
                  <Text style={styles.aiScoreLabel}>Agriculture Relevance:</Text>
                  <Text style={[
                    styles.aiScoreValue,
                    { color: aiAnalysis.isAgricultureRelated ? PlantTheme.colors.success : PlantTheme.colors.error }
                  ]}>
                    {aiAnalysis.isAgricultureRelated ? '✅ Relevant' : '❌ Not Relevant'}
                  </Text>
                </View>
                <View style={styles.aiScoreContainer}>
                  <Text style={styles.aiScoreLabel}>AI Score:</Text>
                  <Text style={styles.aiScoreValue}>
                    {(aiAnalysis.aiScore * 100).toFixed(0)}%
                  </Text>
                </View>
                {aiAnalysis.aiTags && aiAnalysis.aiTags.length > 0 && (
                  <View style={styles.aiTagsContainer}>
                    <Text style={styles.aiTagsLabel}>Tags:</Text>
                    <View style={styles.aiTags}>
                      {aiAnalysis.aiTags.map((tag: string, index: number) => (
                        <View key={`tag-${tag}-${index}`} style={styles.aiTag}>
                          <Text style={styles.aiTagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {aiAnalysis.moderationReason && (
                  <Text style={styles.moderationReason}>
                    💡 {aiAnalysis.moderationReason}
                  </Text>
                )}
              </View>
            )}
          </GlassCard>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
              <GlassCard style={styles.actionCard}>
                <ImageIcon color={PlantTheme.colors.accent} size={24} />
                <Text style={styles.actionText}>Photo</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <GlassCard style={styles.actionCard}>
                <Camera color={PlantTheme.colors.primary} size={24} />
                <Text style={styles.actionText}>Camera</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <GlassCard style={styles.actionCard}>
                <Leaf color={PlantTheme.colors.secondary} size={24} />
                <Text style={styles.actionText}>Voice</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <GlassCard style={styles.actionCard}>
                <Heading color={PlantTheme.colors.primaryLight} size={24} />
                <Text style={styles.actionText}>Location</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>🌱 Sustainable Community Guidelines</Text>
            <Text style={styles.tipText}>• Share farming techniques, crop updates, or garden progress</Text>
            <Text style={styles.tipText}>• Discuss sustainable practices and environmental conservation</Text>
            <Text style={styles.tipText}>• Post about climate change impacts on agriculture</Text>
            <Text style={styles.tipText}>• Share agricultural technology and innovation</Text>
            <Text style={styles.tipText}>• Connect with fellow farmers and environmental enthusiasts</Text>
          </GlassCard>
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
  },
  postButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: PlantTheme.borderRadius.lg,
    ...PlantTheme.shadows.sm,
  },
  postButtonText: {
    color: PlantTheme.colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postContainer: {
    marginBottom: 20,
    padding: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    color: PlantTheme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  userHandle: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
  },
  textInput: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: PlantTheme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  characterCount: {
    alignItems: 'flex-end',
  },
  characterCountText: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 12,
  },
  characterCountError: {
    color: PlantTheme.colors.error,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  actionCard: {
    alignItems: 'center',
    gap: 8,
    padding: 15,
  },
  actionText: {
    color: PlantTheme.colors.textPrimary,
    fontWeight: '500',
    fontSize: 12,
  },
  tipsContainer: {
    padding: 20,
  },
  tipsTitle: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  tipText: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  aiAnalyzeButton: {
    backgroundColor: PlantTheme.colors.glassBackground,
    borderRadius: PlantTheme.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
  },
  aiAnalyzeText: {
    color: PlantTheme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  aiInsights: {
    backgroundColor: PlantTheme.colors.glassBackground,
    borderRadius: PlantTheme.borderRadius.md,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  aiInsightsTitle: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  aiScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiScoreLabel: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
  },
  aiScoreValue: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  aiTagsContainer: {
    marginTop: 10,
  },
  aiTagsLabel: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  aiTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  aiTag: {
    backgroundColor: PlantTheme.colors.glassBackground,
    borderRadius: PlantTheme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
  },
  aiTagText: {
    color: PlantTheme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  moderationReason: {
    color: PlantTheme.colors.warning,
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
});