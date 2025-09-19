import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { User, Sprout, Camera, Leaf, UserCheck, AtSign, FileText } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";

import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { MaterialInput } from "@/components/MaterialInput";
import { MaterialButton } from "@/components/MaterialButton";

export default function ProfileSetupScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const { completeProfile } = useAuth();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleSubmit = async () => {
    if (!name.trim() || !username.trim() || !bio.trim()) {
      const errorMsg = "Please fill in all required fields";
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMsg);
      } else {
        console.error(errorMsg);
      }
      return;
    }

    if (bio.length < 10) {
      const errorMsg = "Bio must be at least 10 characters long";
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMsg);
      } else {
        console.error(errorMsg);
      }
      return;
    }

    if (username.length < 3) {
      const errorMsg = "Username must be at least 3 characters long";
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMsg);
      } else {
        console.error(errorMsg);
      }
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      const errorMsg = "Username can only contain letters, numbers, and underscores";
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMsg);
      } else {
        console.error(errorMsg);
      }
      return;
    }

    setLoading(true);
    try {
      await completeProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatar.trim() || undefined,
      });
      // Don't navigate here - let the index.tsx handle routing based on profile completion
    } catch (error: any) {
      console.error('Profile setup error:', error);
      const errorMessage = error?.message || "Failed to complete profile";
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMessage);
      } else {
        console.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAvatar = () => {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${username || 'default'}&backgroundColor=c0aede,d1d4f9,ffd5dc,ffdfbf`;
    setAvatar(avatarUrl);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Sprout color={PlantTheme.colors.primary} size={48} />
              </View>
              <Text style={styles.title}>🌱 Complete Your {PlantTerminology.home} Profile</Text>
              <Text style={styles.subtitle}>
                Let&apos;s set up your profile to join our sustainable community
              </Text>
            </View>

            <Animated.View style={[
              styles.animatedContainer,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}>
              <GlassCard style={styles.formCard}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <Text style={styles.label}>Profile Picture</Text>
                <View style={styles.avatarContainer}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User color={PlantTheme.colors.textSecondary} size={40} />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.avatarButton}
                    onPress={generateAvatar}
                    testID="generate-avatar-button"
                  >
                    <Camera color={PlantTheme.colors.primary} size={20} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.avatarHint}>
                  Tap the camera to generate an avatar
                </Text>
              </View>

              <MaterialInput
                label="🌿 Display Name *"
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                autoCapitalize="words"
                leftIcon={<UserCheck color={PlantTheme.colors.textSecondary} size={20} />}
                testID="name-input"
              />

              <MaterialInput
                label="🏷️ Username *"
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="unique_username"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<AtSign color={PlantTheme.colors.textSecondary} size={20} />}
                hint="Letters, numbers, and underscores only"
                testID="username-input"
              />

              <MaterialInput
                label="📝 Bio *"
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about your passion for sustainable agriculture..."
                multiline
                numberOfLines={4}
                leftIcon={<FileText color={PlantTheme.colors.textSecondary} size={20} />}
                hint={`${bio.length}/200 characters (minimum 10)`}
                testID="bio-input"
              />

              <MaterialButton
                title={loading ? "🌱 Planting Your Profile..." : `🌿 Join the ${PlantTerminology.home}`}
                onPress={handleSubmit}
                disabled={loading}
                size="large"
                icon={<Leaf color={PlantTheme.colors.white} size={20} />}
                testID="complete-profile-button"
                style={styles.materialButtonStyle}
              />

              <Text style={styles.requiredNote}>
                * Required fields
              </Text>
              </GlassCard>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: PlantTheme.borderRadius.full,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  title: {
    fontSize: 28,
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
  formCard: {
    padding: 24,
    ...(Platform.OS === 'android' && {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: PlantTheme.material3.shapes.corner.large,
      elevation: 3,
      shadowColor: 'transparent',
    }),
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginVertical: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: PlantTheme.colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: PlantTheme.colors.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: PlantTheme.colors.primary,
    ...PlantTheme.shadows.sm,
    ...(Platform.OS === 'android' && {
      elevation: 3,
      shadowColor: 'transparent',
    }),
  },
  avatarHint: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: PlantTheme.colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    borderRadius: Platform.OS === 'android' ? PlantTheme.borderRadius.sm : PlantTheme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    ...(Platform.OS === 'android' && {
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: PlantTheme.colors.textPrimary,
    ...(Platform.OS === 'android' && {
      fontFamily: 'System',
    }),
  },
  bioWrapper: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  bioIcon: {
    marginTop: 0,
  },
  bioInput: {
    height: 84,
    paddingTop: 0,
  },
  inputHint: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    marginTop: 4,
  },
  button: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: Platform.OS === 'android' ? PlantTheme.borderRadius.xl : PlantTheme.borderRadius.lg,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    ...PlantTheme.shadows.md,
    ...(Platform.OS === 'android' && {
      paddingVertical: 18,
      elevation: 4,
      shadowColor: 'transparent',
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  requiredNote: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  animatedContainer: {
    // Container for animated form
  },
  materialButtonStyle: {
    marginTop: 8,
    marginBottom: 16,
  },
});