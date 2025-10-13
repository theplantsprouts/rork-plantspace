import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { MaterialInput } from '@/components/MaterialInput';
import { MaterialButton } from '@/components/MaterialButton';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleResetPassword = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      router.push({
        pathname: '/reset-email-sent',
        params: { email: email.trim() },
      } as any);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later');
      } else {
        setError('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <AnimatedButton
                onPress={() => router.back()}
                style={[styles.backButton, { backgroundColor: colors.surfaceContainer }]}
                bounceEffect="subtle"
                hapticFeedback="light"
              >
                <ArrowLeft color={colors.onSurface} size={24} />
              </AnimatedButton>
            </View>

            <View style={styles.content}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Mail color={colors.primary} size={48} />
              </View>

              <Text style={[styles.title, { color: colors.onSurface }]}>
                Reset Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Enter your email address and we&apos;ll send you instructions to reset your password
              </Text>

              <View style={styles.form}>
                <MaterialInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon={<Mail color={colors.primary} size={20} />}
                  error={error}
                  testID="email-input"
                />

                <MaterialButton
                  title={loading ? 'Sending...' : 'Send Reset Link'}
                  onPress={handleResetPassword}
                  disabled={loading}
                  variant="filled"
                  size="large"
                  testID="send-reset-button"
                />

                <AnimatedButton
                  onPress={() => router.back()}
                  style={styles.backToLoginButton}
                  bounceEffect="subtle"
                  hapticFeedback="light"
                >
                  <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                    Back to Login
                  </Text>
                </AnimatedButton>
              </View>
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
  },
  backToLoginButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
