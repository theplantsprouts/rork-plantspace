import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { User, Sprout, Camera, Leaf, UserCheck, AtSign, FileText } from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { validateName, validateUsername, validateBio, sanitizeInput } from "@/lib/validation";

import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { MaterialInput } from "@/components/MaterialInput";
import { MaterialButton } from "@/components/MaterialButton";
import { AnimatedIconButton } from "@/components/AnimatedPressable";

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

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async () => {
    setErrorMessage('');
    
    if (!name.trim() || !username.trim() || !bio.trim()) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      setErrorMessage(nameValidation.message || "Invalid name");
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setErrorMessage(usernameValidation.message || "Invalid username");
      return;
    }

    const bioValidation = validateBio(bio);
    if (!bioValidation.valid) {
      setErrorMessage(bioValidation.message || "Invalid bio");
      return;
    }

    setLoading(true);
    try {
      const profileData: { name: string; username: string; bio: string; avatar?: string } = {
        name: sanitizeInput(name),
        username: sanitizeInput(username),
        bio: sanitizeInput(bio),
      };
      
      // Only include avatar if it has a value
      if (avatar.trim()) {
        profileData.avatar = avatar.trim();
      }
      
      console.log('Starting profile completion with data:', profileData);
      await completeProfile(profileData);
      
      console.log('Profile setup completed successfully, navigating to home...');
      
      // Give a small delay to ensure state updates are processed, then navigate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force navigation to home after successful profile completion
      router.replace('/(tabs)/home');
      
    } catch (error: any) {
      console.error('Profile setup error:', error);
      let message = error?.message || "Failed to complete profile";
      
      // Make error messages more user-friendly
      if (message.includes('mutateAsync')) {
        message = "Profile setup failed. Please try again.";
      }
      
      setErrorMessage(message);
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
              <Text style={styles.title}>Complete Your {PlantTerminology.home} Profile</Text>
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
                  <AnimatedIconButton
                    style={styles.avatarButton}
                    onPress={generateAvatar}
                    testID="generate-avatar-button"
                    bounceEffect="medium"
                  >
                    <Camera color={PlantTheme.colors.primary} size={20} />
                  </AnimatedIconButton>
                </View>
                <Text style={styles.avatarHint}>
                  Tap the camera to generate an avatar
                </Text>
              </View>

              <MaterialInput
                label="Display Name *"
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                autoCapitalize="words"
                leftIcon={<UserCheck color={PlantTheme.colors.textSecondary} size={20} />}
                testID="name-input"
                style={styles.glassInput}
              />

              <MaterialInput
                label="Username *"
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="unique_username"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<AtSign color={PlantTheme.colors.textSecondary} size={20} />}
                hint="Letters, numbers, and underscores only"
                testID="username-input"
                style={styles.glassInput}
              />

              <MaterialInput
                label="Bio *"
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about your passion for sustainable agriculture..."
                multiline
                numberOfLines={4}
                leftIcon={<FileText color={PlantTheme.colors.textSecondary} size={20} />}
                hint={`${bio.length}/200 characters (minimum 10)`}
                testID="bio-input"
                style={styles.glassInput}
              />

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <MaterialButton
                title={loading ? "Planting Your Profile..." : `Join the ${PlantTerminology.home}`}
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
    backgroundColor: PlantTheme.colors.glassBackground,
    borderRadius: PlantTheme.borderRadius.full,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    ...PlantTheme.shadows.sm,
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
    borderRadius: PlantTheme.borderRadius.avatar,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: PlantTheme.borderRadius.avatar,
    backgroundColor: PlantTheme.colors.glassBackground,
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
    borderRadius: PlantTheme.borderRadius.avatar,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: PlantTheme.colors.primary,
    ...PlantTheme.shadows.md,
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
    borderColor: PlantTheme.colors.cardBorder,
    borderRadius: Platform.OS === 'android' ? PlantTheme.borderRadius.sm : PlantTheme.borderRadius.md,
    backgroundColor: Platform.OS === 'android' ? PlantTheme.colors.cardBackground : 'transparent',
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
  glassInput: {
    backgroundColor: PlantTheme.colors.glassBackground,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    borderRadius: PlantTheme.borderRadius.input,
    ...PlantTheme.shadows.sm,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: `${PlantTheme.colors.error}1A`,
    borderRadius: PlantTheme.borderRadius.input,
    borderWidth: 1,
    borderColor: `${PlantTheme.colors.error}4D`,
  },
  errorText: {
    color: PlantTheme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});