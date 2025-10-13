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
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { MaterialInput } from '@/components/MaterialInput';
import { MaterialButton } from '@/components/MaterialButton';
import { useTheme } from '@/hooks/use-theme';

export default function SetNewPasswordScreen() {
  const { oobCode } = useLocalSearchParams<{ oobCode: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleResetPassword = async () => {
    setError('');

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!oobCode) {
      setError('Invalid reset link. Please request a new one');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode as string, password);
      router.replace('/password-reset-success');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/expired-action-code') {
        setError('Reset link has expired. Please request a new one');
      } else if (error.code === 'auth/invalid-action-code') {
        setError('Invalid reset link. Please request a new one');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password');
      } else {
        setError('Failed to reset password. Please try again');
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
            <View style={styles.content}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Lock color={colors.primary} size={48} />
              </View>

              <Text style={[styles.title, { color: colors.onSurface }]}>
                Set New Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Create a strong password for your account
              </Text>

              <View style={styles.form}>
                <MaterialInput
                  label="New Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showPassword}
                  leftIcon={<Lock color={colors.primary} size={20} />}
                  rightIcon={
                    showPassword ? (
                      <EyeOff color={colors.onSurfaceVariant} size={20} />
                    ) : (
                      <Eye color={colors.onSurfaceVariant} size={20} />
                    )
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  hint="At least 6 characters"
                  testID="password-input"
                />

                <MaterialInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  leftIcon={<Lock color={colors.primary} size={20} />}
                  rightIcon={
                    showConfirmPassword ? (
                      <EyeOff color={colors.onSurfaceVariant} size={20} />
                    ) : (
                      <Eye color={colors.onSurfaceVariant} size={20} />
                    )
                  }
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={error}
                  testID="confirm-password-input"
                />

                <MaterialButton
                  title={loading ? 'Resetting...' : 'Reset Password'}
                  onPress={handleResetPassword}
                  disabled={loading}
                  variant="filled"
                  size="large"
                  testID="reset-password-button"
                />
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
    paddingTop: 40,
    paddingBottom: 24,
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
});
