import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Sprout, Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { MaterialInput } from "@/components/MaterialInput";
import { MaterialButton } from "@/components/MaterialButton";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { login, register, verifyOtp, resendOtp } = useAuth();







  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
      } else {
        const result = await register(email.trim(), password);
        if (result?.needsVerification) {
          setShowOtpVerification(true);
          setErrorMessage('');
          return;
        }
      }
      // Don't navigate here - let the index.tsx handle routing based on auth state
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

  const handleOtpVerification = async () => {
    if (!otp.trim()) {
      setErrorMessage('Please enter the verification code');
      return;
    }

    if (otp.length !== 6) {
      setErrorMessage('Verification code must be 6 digits');
      return;
    }

    setOtpLoading(true);
    setErrorMessage('');
    
    try {
      await verifyOtp(email.trim(), otp.trim());
      setShowOtpVerification(false);
      // Don't navigate here - let the index.tsx handle routing based on auth state
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setErrorMessage(error?.message || 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage('');
    try {
      await resendOtp(email.trim());
      setErrorMessage('Verification code sent! Please check your email.');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setErrorMessage(error?.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleBackToAuth = () => {
    setShowOtpVerification(false);
    setOtp('');
    setErrorMessage('');
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
                {isLogin ? (
                  <Sprout color={PlantTheme.colors.primary} size={48} />
                ) : (
                  <Leaf color={PlantTheme.colors.secondary} size={48} />
                )}
              </View>
              <Text style={styles.title}>
                {isLogin ? `🌱 Welcome Back to ${PlantTerminology.home}` : `🌿 Join Our ${PlantTerminology.home}`}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? "Continue nurturing your sustainable community"
                  : "Plant your first seed in our agriculture community"}
              </Text>

            </View>

            <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
              {showOtpVerification ? (
                <GlassCard style={styles.formCard}>
                  <View style={styles.otpHeader}>
                    <Text style={styles.otpTitle}>🔐 Verify Your Email</Text>
                    <Text style={styles.otpSubtitle}>
                      We&apos;ve sent a 6-digit verification code to{"\n"}
                      <Text style={styles.emailText}>{email}</Text>
                    </Text>
                    <Text style={styles.otpNote}>
                      📧 Check your email inbox (and spam folder) for the verification code.
                      The code expires in 60 minutes.
                    </Text>
                  </View>

                  <View style={styles.inputSection}>
                    <MaterialInput
                      label="🔢 Verification Code"
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Enter 6-digit code"
                      keyboardType="numeric"
                      maxLength={6}
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="otp-input"
                      style={styles.glassInput}
                    />
                  </View>

                  {errorMessage ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  <View style={styles.actionSection}>
                    <MaterialButton
                      title={otpLoading ? "🔐 Verifying..." : "✅ Verify Email"}
                      onPress={handleOtpVerification}
                      disabled={otpLoading}
                      size="large"
                      testID="verify-otp-button"
                      style={styles.materialButtonStyle}
                    />
                    
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendOtp}
                      testID="resend-otp-button"
                    >
                      <Text style={styles.resendText}>📧 Resend Code</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={handleBackToAuth}
                      testID="back-to-auth-button"
                    >
                      <Text style={styles.backText}>← Back to Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ) : (
                <GlassCard style={styles.formCard}>
                <View style={styles.inputSection}>
                  <MaterialInput
                    label="🌱 Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon={<Mail color={PlantTheme.colors.textSecondary} size={20} />}
                    testID="email-input"
                    style={styles.glassInput}
                  />

                  <MaterialInput
                    label="🔒 Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    leftIcon={<Lock color={PlantTheme.colors.textSecondary} size={20} />}
                    rightIcon={
                      showPassword ? (
                        <EyeOff color={PlantTheme.colors.textSecondary} size={20} />
                      ) : (
                        <Eye color={PlantTheme.colors.textSecondary} size={20} />
                      )
                    }
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    testID="password-input"
                    style={styles.glassInput}
                  />
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <View style={styles.actionSection}>
                  <MaterialButton
                    title={
                      loading
                        ? "🌱 Growing..."
                        : isLogin
                        ? `🚪 Enter ${PlantTerminology.home}`
                        : `🌱 ${PlantTerminology.create}`
                    }
                    onPress={handleSubmit}
                    disabled={loading}
                    size="large"
                    testID="submit-button"
                    style={styles.materialButtonStyle}
                  />
                </View>
              </GlassCard>
              )}
              
              {!showOtpVerification && (
                <GlassCard style={styles.switchCard}>
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setIsLogin(!isLogin)}
                  testID="switch-mode-button"
                >
                  <Text style={styles.switchText}>
                    {isLogin
                      ? "🌿 New to gardening? Plant your first seed"
                      : `🌳 Already growing? Enter your ${PlantTerminology.home.toLowerCase()}`}
                  </Text>
                </TouchableOpacity>
              </GlassCard>
              )}
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
    marginBottom: 16,
    ...(Platform.OS === 'android' && {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: PlantTheme.material3.shapes.corner.large,
      elevation: 3,
      shadowColor: 'transparent',
    }),
  },
  inputSection: {
    marginBottom: 8,
  },
  actionSection: {
    marginTop: 8,
  },
  switchCard: {
    padding: 16,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    ...(Platform.OS === 'android' && {
      borderRadius: PlantTheme.material3.shapes.corner.large,
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  glassInput: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    ...PlantTheme.shadows.sm,
    ...(Platform.OS === 'android' && {
      elevation: 1,
      shadowColor: 'transparent',
      borderRadius: PlantTheme.material3.shapes.corner.medium,
    }),
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: PlantTheme.colors.textPrimary,
    marginBottom: 8,
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
  button: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: PlantTheme.borderRadius.lg,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
    ...PlantTheme.shadows.md,
  },
  materialButton: {
    borderRadius: PlantTheme.borderRadius.xl,
    paddingVertical: 18,
    elevation: 4,
    shadowColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  switchButton: {
    alignItems: "center",
    padding: 8,
  },
  switchText: {
    color: PlantTheme.colors.primary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  animatedContainer: {
    // Container for animated form
  },

  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: PlantTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorText: {
    color: PlantTheme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  passwordToggle: {
    padding: 8,
    marginLeft: 8,
  },
  materialButtonStyle: {
    marginTop: 8,
    marginBottom: 16,
  },
  
  otpHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600' as const,
    color: PlantTheme.colors.primary,
  },
  otpNote: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
  resendButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  resendText: {
    color: PlantTheme.colors.primary,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 4,
  },
  backText: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500' as const,
  },

});