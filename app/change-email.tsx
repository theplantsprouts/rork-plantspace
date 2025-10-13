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
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { MaterialInput } from '@/components/MaterialInput';
import { MaterialButton } from '@/components/MaterialButton';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function ChangeEmailScreen() {
  const { user, firebaseUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleUpdateEmail = async () => {
    setError('');

    if (!newEmail.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (newEmail.trim() === user?.email) {
      setError('New email must be different from current email');
      return;
    }

    if (!firebaseUser || !user?.email) {
      setError('You must be logged in to change your email');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      await updateEmail(firebaseUser, newEmail.trim());
      
      Alert.alert(
        'Success',
        'Email updated successfully. Please verify your new email address.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Update email error:', error);
      
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in before changing your email');
      } else {
        setError(error.message || 'Failed to update email');
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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Change Email</Text>
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
                <Mail color={colors.primary} size={48} />
              </View>

              <Text style={[styles.title, { color: colors.onSurface }]}>
                Update Your Email
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Current email: {user?.email}
              </Text>

              <View style={styles.form}>
                <MaterialInput
                  label="New Email Address"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Enter new email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon={<Mail color={colors.primary} size={20} />}
                  testID="new-email-input"
                />

                <MaterialInput
                  label="Current Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  leftIcon={<Lock color={colors.primary} size={20} />}
                  error={error}
                  hint="Required for security verification"
                  testID="password-input"
                />

                <MaterialButton
                  title={loading ? 'Updating...' : 'Update Email'}
                  onPress={handleUpdateEmail}
                  disabled={loading}
                  variant="filled"
                  size="large"
                  testID="update-email-button"
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
