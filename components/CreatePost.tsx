import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { X, ImagePlus } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { usePosts } from "@/hooks/use-posts";
import { router } from "expo-router";
import { PlantTheme } from "@/constants/theme";

export default function CreatePostScreen() {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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

  const bgColor = isDark ? '#112111' : '#f6f8f6';
  const textColor = isDark ? '#ffffff' : '#000000';
  const placeholderColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
  const borderColor = isDark ? 'rgba(23, 207, 23, 0.5)' : 'rgba(23, 207, 23, 0.3)';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            testID="close-button"
          >
            <X size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Plant New Seed</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  color: textColor,
                }
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="What's blooming in your garden today?"
              placeholderTextColor={placeholderColor}
              multiline
              textAlignVertical="top"
              testID="content-input"
            />
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
              style={styles.addPhotoButton}
              onPress={pickImage}
              testID="pick-image-button"
            >
              <View style={styles.addPhotoIconContainer}>
                <ImagePlus size={32} color={PlantTheme.colors.primary} />
              </View>
              <Text style={[styles.addPhotoText, { color: textColor }]}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.footerBorder, { borderTopColor: borderColor }]} />
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    height: 192,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 24,
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
    gap: 24,
  },
  addPhotoButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  addPhotoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(23, 207, 23, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footerBorder: {
    borderTopWidth: 1,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: 9999,
    paddingVertical: 16,
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