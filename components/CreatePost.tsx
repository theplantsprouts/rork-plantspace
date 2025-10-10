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
import { X, Image as ImageIcon } from "lucide-react-native";
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

      if (Platform.OS !== 'web') {
        Alert.alert("Success", "Your post has been created! 🌱");
      }
      
      setContent("");
      setSelectedImage(null);
      
      router.back();
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (Platform.OS !== 'web') {
        Alert.alert("Error", error.message || "Failed to create post");
      }
    } finally {
      setLoading(false);
    }
  }, [content, selectedImage, user, addPost]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            testID="close-button"
          >
            <X size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.primary }]}>Plant Seed</Text>
          <View style={{ width: 48 }} />
        </View>

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
                onChangeText={setContent}
                placeholder="What's growing?"
                placeholderTextColor={colors.onSurfaceVariant}
                multiline
                textAlignVertical="top"
                testID="content-input"
              />
            </View>
          </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23, 207, 23, 0.1)',
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
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
});