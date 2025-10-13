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
import { ArrowLeft, AlertTriangle, Lock } from 'lucide-react-native';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { MaterialInput } from '@/components/MaterialInput';
import { MaterialButton } from '@/components/MaterialButton';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function DeleteAccountScreen() {
  const { user, firebaseUser, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleDeleteAccount = async () => {
    setError('');

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    if (!firebaseUser || !user?.email) {
      setError('You must be logged in to delete your account');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const credential = EmailAuthProvider.credential(user.email, password);
              await reauthenticateWithCredential(firebaseUser, credential);
              
              await deleteUser(firebaseUser);
              
              await logout();
              router.replace('/auth');
            } catch (error: any) {
              console.error('Delete account error:', error);
              
              if (error.code === 'auth/wrong-password') {
                setError('Incorrect password');
              } else if (error.code === 'auth/requires-recent-login') {
                setError('Please log out and log back in before deleting your account');
              } else {
                setError(error.message || 'Failed to delete account');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Delete Account</Text>
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
              <View style={styles.warningContainer}>
                <AlertTriangle color="#EF4444" size={64} />
              </View>

              <Text style={styles.dangerTitle}>
                Delete Your Account
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                This action is permanent and cannot be undone
              </Text>

              <View style={[styles.warningBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }]}>
                <Text style={styles.warningTitle}>⚠️ Warning</Text>
                <Text style={styles.warningText}>
                  • All your posts will be deleted{'\n'}
                  • Your profile will be removed{'\n'}
                  • You will lose all your connections{'\n'}
                  • This action cannot be reversed
                </Text>
              </View>

              <View style={styles.form}>
                <MaterialInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  leftIcon={<Lock color={colors.primary} size={20} />}
                  hint="Required for security verification"
                  testID="password-input"
                />

                <MaterialInput
                  label="Type DELETE to confirm"
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="Type DELETE"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  error={error}
                  testID="confirm-input"
                />

                <MaterialButton
                  title={loading ? 'Deleting...' : 'Delete Account Forever'}
                  onPress={handleDeleteAccount}
                  disabled={loading || confirmText !== 'DELETE'}
                  variant="filled"
                  size="large"
                  style={styles.deleteButton}
                  textStyle={styles.deleteButtonText}
                  testID="delete-account-button"
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
  warningContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dangerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  warningBox: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#DC2626',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#EF4444',
  },
  form: {
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
});
