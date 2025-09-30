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
import { X, ImagePlus, Bell } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { usePosts } from '@/hooks/use-posts';
import { useAppContext } from '@/hooks/use-app-context';
import { useAIContent } from '@/hooks/use-ai-content';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';


export default function CreateScreen() {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const { addPost } = usePosts();
  const { addNotification } = useAppContext();
  const { moderatePost } = useAIContent();
  const { user } = useAuth();
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
        user: { name: user?.name || 'You', avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
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
              router.push('/(tabs)/home');
            }
          }
        ]);
      } else {
        setPostText('');
        setSelectedImage(null);
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color={PlantTheme.colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plant Seed</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Bell color={PlantTheme.colors.textPrimary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.postContainer}>
          <View style={styles.userSection}>
            <Image 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' }} 
              style={styles.userAvatar}
            />
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="What's growing?"
                placeholderTextColor={PlantTheme.colors.textSecondary}
                multiline
                value={postText}
                onChangeText={setPostText}
                maxLength={280}
              />
            </View>
          </View>

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
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.photoButton}
            onPress={pickImage}
          >
            <ImagePlus color={PlantTheme.colors.primary} size={28} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.plantButton, isPosting && styles.plantButtonDisabled]} 
            onPress={handlePost}
            disabled={isPosting}
          >
            <Text style={styles.plantButtonText}>
              {isPosting ? 'Planting...' : 'Plant Seed'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PlantTheme.colors.cardBorder,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PlantTheme.colors.textPrimary,
  },
  notificationButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  postContainer: {
    padding: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  textInputContainer: {
    flex: 1,
  },
  textInput: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    minHeight: 192,
    textAlignVertical: 'top',
    padding: 16,
    backgroundColor: PlantTheme.colors.backgroundStart,
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
    borderRadius: PlantTheme.borderRadius.xl,
  },
  imagePreview: {
    position: 'relative',
    marginTop: 16,
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
    fontWeight: '700' as const,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  photoButton: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: PlantTheme.colors.cardBackground,
  },
  plantButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  plantButtonDisabled: {
    opacity: 0.6,
  },
  plantButtonText: {
    color: '#000',
    fontWeight: '700' as const,
    fontSize: 16,
  },
});