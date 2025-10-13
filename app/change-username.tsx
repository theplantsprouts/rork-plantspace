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
import { ArrowLeft, AtSign } from 'lucide-react-native';
import { updateProfile } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { MaterialInput } from '@/components/MaterialInput';
import { MaterialButton } from '@/components/MaterialButton';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function ChangeUsernameScreen() {
  const { user, firebaseUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleUpdateUsername = async () => {
    setError('');

    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!firebaseUser) {
      setError('You must be logged in to change your username');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(firebaseUser.uid, { username: username.trim() });
      Alert.alert('Success', 'Username updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Update username error:', error);
      setError(error.message || 'Failed to update username');
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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Change Username</Text>
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
                <AtSign color={colors.primary} size={48} />
              </View>

              <Text style={[styles.title, { color: colors.onSurface }]}>
                Update Your Username
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Choose a unique username that represents you
              </Text>

              <View style={styles.form}>
                <MaterialInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter new username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon={<AtSign color={colors.primary} size={20} />}
                  error={error}
                  hint="3-20 characters, letters, numbers, and underscores only"
                  testID="username-input"
                />

                <MaterialButton
                  title={loading ? 'Updating...' : 'Update Username'}
                  onPress={handleUpdateUsername}
                  disabled={loading || username === user?.username}
                  variant="filled"
                  size="large"
                  testID="update-username-button"
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
