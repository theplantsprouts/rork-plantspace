import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Image as ImageIcon, X, Hash } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { usePosts } from "@/hooks/use-posts";
import { router } from "expo-router";
import { PlantTheme } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { FloatingCapsule } from "@/components/FloatingCapsule";

export default function CreatePostScreen() {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const { colors } = useTheme();
  
  const { user } = useAuth();
  const { addPost } = usePosts();

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      if (Platform.OS !== 'web') {
        Alert.alert("Permission needed", "Please grant camera roll permissions");
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);



  const removeImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    
    const hashtagMatches = text.match(/#\w+/g) || [];
    const uniqueHashtags = [...new Set(hashtagMatches.map(tag => tag.substring(1)))];
    setHashtags(uniqueHashtags);
  }, []);
  
  const removeHashtag = useCallback((tag: string) => {
    const newContent = content.replace(new RegExp(`#${tag}\\b`, 'g'), '').trim();
    setContent(newContent);
    setHashtags(hashtags.filter(h => h !== tag));
  }, [content, hashtags]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      if (Platform.OS !== 'web') {
        Alert.alert("Error", "Please add some content");
      }
      return;
    }

    if (!user) {
      if (Platform.OS !== 'web') {
        Alert.alert("Error", "Please log in to create a post");
      }
      return;
    }

    setLoading(true);
    try {
      await addPost(content.trim(), selectedImage || undefined);
      
      setContent("");
      setSelectedImage(null);
      setHashtags([]);
      
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (Platform.OS !== 'web') {
        Alert.alert("Error", error.message || "Failed to create post");
      }
    } finally {
      setLoading(false);
    }
  }, [content, selectedImage, user, addPost]);

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={() => router.back()}
      />
      <View style={[styles.floatingContainer, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.postContainer}>
              <Image 
                source={{ uri: user?.avatar || 'https://via.placeholder.com/48' }} 
                style={styles.avatar}
              />
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.glassBorder,
                      color: colors.onSurface,
                    }
                  ]}
                  value={content}
                  onChangeText={handleContentChange}
                  placeholder="What's growing? Use #hashtags"
                  placeholderTextColor={colors.onSurfaceVariant}
                  multiline
                  textAlignVertical="top"
                  testID="content-input"
                />
              </View>
            </View>

            {hashtags.length > 0 && (
              <View style={styles.hashtagsContainer}>
                <View style={styles.hashtagsHeader}>
                  <Hash size={16} color={colors.primary} />
                  <Text style={[styles.hashtagsTitle, { color: colors.onSurface }]}>Hashtags</Text>
                </View>
                <View style={styles.hashtagsList}>
                  {hashtags.map((tag) => (
                    <View key={tag} style={[styles.hashtagChip, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                      <Text style={[styles.hashtagText, { color: colors.primary }]}>#{tag}</Text>
                      <TouchableOpacity onPress={() => removeHashtag(tag)} style={styles.hashtagRemove}>
                        <X size={14} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                  testID="remove-image-button"
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.addPhotoButton, { backgroundColor: `${colors.primary}20` }]}
                onPress={pickImage}
                testID="pick-image-button"
              >
                <ImageIcon size={28} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                testID="submit-button"
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Planting..." : "Plant Seed"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
        <FloatingCapsule hideNotifications />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  postContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  inputWrapper: {
    flex: 1,
  },
  textInput: {
    minHeight: 192,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  addPhotoButton: {
    padding: 12,
    borderRadius: 9999,
  },
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  hashtagsContainer: {
    marginBottom: 16,
  },
  hashtagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  hashtagsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  hashtagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  hashtagRemove: {
    padding: 2,
  },
});