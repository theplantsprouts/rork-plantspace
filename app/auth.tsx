import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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

    if (!isLogin && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
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
                {isLogin ? "Welcome Back" : "Join Sprout"}
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
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOff color={PlantTheme.colors.textSecondary} size={20} />
                    ) : (
                      <Eye color={PlantTheme.colors.textSecondary} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
                testID="submit-button"
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage('');
                }}
                testID="switch-mode-button"
              >
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Log In"}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
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
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
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
});