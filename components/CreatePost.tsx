import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { X, Camera, Image as ImageIcon, Sprout } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { usePosts } from "@/hooks/use-posts";
import { router } from "expo-router";
import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";

export default function CreatePostScreen() {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
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

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      if (Platform.OS !== 'web') {
        Alert.alert("Permission needed", "Please grant camera permissions");
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
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
        Alert.alert("Error", "Please plant some seeds (add content)");
      }
      return;
    }

    if (!user) {
      if (Platform.OS !== 'web') {
        Alert.alert("Error", "Please log in to tend your garden");
      }
      return;
    }

    setLoading(true);
    try {
      await addPost(content.trim(), selectedImage || undefined);

      if (Platform.OS !== 'web') {
        Alert.alert("Success", "Your seed has been planted successfully! 🌱");
      }
      
      // Clear form
      setContent("");
      setSelectedImage(null);
      
      router.back();
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (Platform.OS !== 'web') {
        Alert.alert("Error", error.message || "Failed to plant your seed");
      }
    } finally {
      setLoading(false);
    }
  }, [content, selectedImage, user, addPost]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Sprout color={PlantTheme.colors.primary} size={32} />
            </View>
            <Text style={styles.title}>🌱 {PlantTerminology.create}</Text>
            <Text style={styles.subtitle}>Share your sustainable journey with the community</Text>
          </View>

          <View style={styles.form}>
            <GlassCard style={styles.formCard}>
              {user && (
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    {user.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name || 'Anonymous Gardener'}</Text>
                    <Text style={styles.userHandle}>@{user.username || 'gardener'}</Text>
                  </View>
                </View>
              )}
              
              <TextInput
                style={styles.textInput}
                value={content}
                onChangeText={setContent}
                placeholder="What's growing in your garden today?"
                placeholderTextColor={PlantTheme.colors.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                testID="content-input"
              />

              {selectedImage && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                    testID="remove-image-button"
                  >
                    <X size={18} color={PlantTheme.colors.white} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                  testID="pick-image-button"
                >
                  <ImageIcon size={18} color={PlantTheme.colors.primary} />
                  <Text style={styles.imageButtonText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={takePhoto}
                  testID="take-photo-button"
                >
                  <Camera size={18} color={PlantTheme.colors.primary} />
                  <Text style={styles.imageButtonText}>Camera</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                testID="submit-button"
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Planting..." : `${PlantTerminology.share} 🌱`}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: PlantTheme.colors.cardBackground,
    borderRadius: PlantTheme.borderRadius.full,
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    padding: 20,
  },
  formCard: {
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
    borderRadius: PlantTheme.borderRadius.md,
    padding: 16,
    fontSize: 16,
    backgroundColor: PlantTheme.colors.cardBackground,
    color: PlantTheme.colors.textPrimary,
    minHeight: 120,
    marginBottom: 16,
    ...(Platform.OS === 'android' && {
      backgroundColor: PlantTheme.colors.cardBackground,
      textAlignVertical: 'top',
    }),
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: PlantTheme.borderRadius.md,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    ...PlantTheme.shadows.sm,
  },
  imageActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: PlantTheme.colors.cardBackground,
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
    borderRadius: PlantTheme.borderRadius.md,
    minWidth: 100,
    justifyContent: "center",
    gap: 6,
  },
  imageButtonText: {
    color: PlantTheme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: PlantTheme.borderRadius.lg,
    padding: 16,
    alignItems: "center",
    ...PlantTheme.shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: PlantTheme.colors.cardBorder,
  },
  userAvatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PlantTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: PlantTheme.colors.white,
    fontSize: 18,
    fontWeight: "600" as const,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
  },
});