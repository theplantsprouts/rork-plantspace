import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sprout, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { PlantTheme } from "@/constants/theme";
import { router } from "expo-router";
import { AnimatedButton, AnimatedIconButton } from "@/components/AnimatedPressable";



export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { user, login, register } = useAuth();
  
  // If user is already authenticated, don't show the login screen
  // The navigation will be handled by the root layout
  if (user) {
    console.log('LoginScreen - User already authenticated, should redirect');
    return null;
  }

  const handleSubmit = async () => {
    setErrorMessage('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (!isLogin && password.length < 8) {
      setErrorMessage("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
        console.log('Login successful, auth state will handle navigation');
        // Don't navigate here - let the auth state change handle it
      } else {
        const result = await register(email.trim(), password);
        if (result?.needsVerification) {
          setErrorMessage('Please check your email and click the verification link to complete registration.');
          return;
        }
        console.log('Registration successful, auth state will handle navigation');
        // Don't navigate here - let the auth state change handle it
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = error?.message || "Authentication failed";
      
      // Make error messages more user-friendly
      if (message.includes('mutateAsync')) {
        message = isLogin ? "Login failed. Please try again." : "Registration failed. Please try again.";
      }
      
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Sprout color={PlantTheme.colors.primary} size={40} />
              </View>
              <Text style={styles.title}>
                {isLogin ? "Welcome Back" : "Join PlantSpace"}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? "Continue your green journey"
                  : "Start your plant-based community experience"}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail color={PlantTheme.colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={PlantTheme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="email-input"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock color={PlantTheme.colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={PlantTheme.colors.textSecondary}
                    secureTextEntry={!showPassword}
                    testID="password-input"
                  />
                  <AnimatedIconButton
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    bounceEffect="subtle"
                  >
                    {showPassword ? (
                      <EyeOff color={PlantTheme.colors.textSecondary} size={20} />
                    ) : (
                      <Eye color={PlantTheme.colors.textSecondary} size={20} />
                    )}
                  </AnimatedIconButton>
                </View>
              </View>

              {!isLogin && (
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password must contain:</Text>
                  <Text style={styles.requirementText}>• At least 8 characters</Text>
                  <Text style={styles.requirementText}>• One uppercase letter (A-Z)</Text>
                  <Text style={styles.requirementText}>• One lowercase letter (a-z)</Text>
                  <Text style={styles.requirementText}>• One number (0-9)</Text>
                  <Text style={styles.requirementText}>• One special character (!@#$%^&*)</Text>
                </View>
              )}

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {isLogin && (
                <AnimatedButton
                  style={styles.forgotPasswordButton}
                  onPress={() => router.push("/forgot-password" as any)}
                  testID="forgot-password-button"
                  bounceEffect="subtle"
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </AnimatedButton>
              )}

              <AnimatedButton
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                testID="submit-button"
                bounceEffect="medium"
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
                </Text>
              </AnimatedButton>

              <AnimatedButton
                style={styles.switchButton}
                onPress={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage('');
                }}
                testID="switch-mode-button"
                bounceEffect="subtle"
              >
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Log In"}
                </Text>
              </AnimatedButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlantTheme.colors.backgroundStart,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PlantTheme.colors.white,
    borderWidth: 1,
    borderColor: PlantTheme.colors.outline,
    borderRadius: PlantTheme.borderRadius.input,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: PlantTheme.colors.textDark,
  },
  eyeIcon: {
    padding: 4,
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
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: PlantTheme.borderRadius.button,
    alignItems: 'center',
    marginTop: 8,
    ...PlantTheme.shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: PlantTheme.colors.white,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  switchButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 16,
  },
  switchText: {
    color: PlantTheme.colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: "center",
  },
  forgotPasswordButton: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: PlantTheme.colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  passwordRequirements: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: `${PlantTheme.colors.success}1A`,
    borderRadius: PlantTheme.borderRadius.input,
    borderWidth: 1,
    borderColor: `${PlantTheme.colors.success}4D`,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
});