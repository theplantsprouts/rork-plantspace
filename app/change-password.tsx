import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { MaterialInput } from '@/components/MaterialInput';
import { MaterialButton } from '@/components/MaterialButton';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function ChangePasswordScreen() {
  const { user, firebaseUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleUpdatePassword = async () => {
    setError('');

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    if (!firebaseUser || !user?.email) {
      setError('You must be logged in to change your password');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      await updatePassword(firebaseUser, newPassword);
      
      Alert.alert('Success', 'Password updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Update password error:', error);
      
      if (error.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in before changing your password');
      } else {
        setError(error.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <AnimatedButton
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surfaceContainer }]}
            bounceEffect="subtle"
            hapticFeedback="light"
          >
            <ArrowLeft color={colors.onSurface} size={24} />
          </AnimatedButton>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Change Password</Text>
          <View style={styles.headerSpacer} />
        </View>

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
                Update Your Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Choose a strong password to keep your account secure
              </Text>

              <View style={styles.form}>
                <MaterialInput
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  leftIcon={<Lock color={colors.primary} size={20} />}
                  rightIcon={
                    showCurrentPassword ? (
                      <EyeOff color={colors.onSurfaceVariant} size={20} />
                    ) : (
                      <Eye color={colors.onSurfaceVariant} size={20} />
                    )
                  }
                  onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  testID="current-password-input"
                />

                <MaterialInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  leftIcon={<Lock color={colors.primary} size={20} />}
                  rightIcon={
                    showNewPassword ? (
                      <EyeOff color={colors.onSurfaceVariant} size={20} />
                    ) : (
                      <Eye color={colors.onSurfaceVariant} size={20} />
                    )
                  }
                  onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                  hint="At least 6 characters"
                  testID="new-password-input"
                />

                <MaterialInput
                  label="Confirm New Password"
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
                  title={loading ? 'Updating...' : 'Update Password'}
                  onPress={handleUpdatePassword}
                  disabled={loading}
                  variant="filled"
                  size="large"
                  testID="update-password-button"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginRight: 48,
  },
  headerSpacer: {
    width: 48,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
    fontSize: 28,
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
