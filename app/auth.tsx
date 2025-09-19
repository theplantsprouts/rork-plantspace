import React, { useState, useRef, useEffect } from "react";
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
import { Sprout, Leaf, Mail, Lock, Eye, EyeOff, Wifi, WifiOff } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { useOffline } from "@/hooks/use-offline";
import { trpcClient } from "@/lib/trpc";

import { PlantTheme, PlantTerminology } from "@/constants/theme";
import { GlassCard } from "@/components/GlassContainer";
import { MaterialInput } from "@/components/MaterialInput";
import { MaterialButton } from "@/components/MaterialButton";
import { ConnectionTest } from "@/components/ConnectionTest";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { login, register } = useAuth();
  const { isOnline } = useOffline();

  // Test backend connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const baseUrl = Platform.OS === 'web' ? window.location.origin : "https://l1v04hq0ysnd54scxcbqm.rork.com";
        console.log('Testing connection to:', `${baseUrl}/api`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${baseUrl}/api`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend response:', data);
          setConnectionStatus('✅ Connected');
        } else {
          console.log('Backend responded with error:', response.status);
          setConnectionStatus(`❌ Error ${response.status}`);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        if (error instanceof Error && error.name === 'AbortError') {
          setConnectionStatus('❌ Timeout');
        } else {
          setConnectionStatus('❌ Connection Failed');
        }
      }
    };
    
    testConnection();
  }, []);

  const retryConnection = () => {
    setConnectionStatus('Checking...');
    const testConnection = async () => {
      try {
        const baseUrl = Platform.OS === 'web' ? window.location.origin : "https://l1v04hq0ysnd54scxcbqm.rork.com";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${baseUrl}/api`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend response:', data);
          setConnectionStatus('✅ Connected');
        } else {
          setConnectionStatus(`❌ Error ${response.status}`);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        if (error instanceof Error && error.name === 'AbortError') {
          setConnectionStatus('❌ Timeout');
        } else {
          setConnectionStatus('❌ Connection Failed');
        }
      }
    };
    testConnection();
  };

  const testTrpcConnection = async () => {
    try {
      console.log('Testing tRPC connection...');
      const result = await trpcClient.example.hi.mutate({ name: 'Test' });
      console.log('tRPC test result:', result);
      setConnectionStatus('✅ tRPC Connected');
    } catch (error) {
      console.error('tRPC test failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('HTML instead of JSON')) {
          setConnectionStatus('❌ Server Error (HTML)');
        } else if (error.message.includes('Failed to fetch')) {
          setConnectionStatus('❌ Network Error');
        } else {
          setConnectionStatus(`❌ tRPC: ${error.message.substring(0, 20)}...`);
        }
      } else {
        setConnectionStatus('❌ tRPC Failed');
      }
    }
  };

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
        await register(email.trim(), password);
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
              
              {/* Connection Status */}
              <View style={styles.connectionStatus}>
                <View style={styles.statusRow}>
                  {isOnline ? (
                    <Wifi color={PlantTheme.colors.primary} size={16} />
                  ) : (
                    <WifiOff color={PlantTheme.colors.error} size={16} />
                  )}
                  <Text style={styles.statusText}>
                    Network: {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusText}>
                    Backend: {connectionStatus}
                  </Text>
                  {connectionStatus.includes('❌') && (
                    <TouchableOpacity onPress={retryConnection} style={styles.retryButton}>
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={testTrpcConnection} style={[styles.retryButton, { marginLeft: 8 }]}>
                    <Text style={styles.retryText}>tRPC</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowConnectionTest(true)} style={[styles.retryButton, { marginLeft: 8 }]}>
                    <Text style={styles.retryText}>Debug</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
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
                    disabled={loading || !isOnline}
                    size="large"
                    testID="submit-button"
                    style={styles.materialButtonStyle}
                  />
                </View>
              </GlassCard>
              
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
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      {showConnectionTest && (
        <View style={styles.modalOverlay}>
          <ConnectionTest onClose={() => setShowConnectionTest(false)} />
        </View>
      )}
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
  connectionStatus: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: PlantTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: PlantTheme.borderRadius.sm,
  },
  retryText: {
    fontSize: 10,
    color: PlantTheme.colors.white,
    fontWeight: '600' as const,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
});