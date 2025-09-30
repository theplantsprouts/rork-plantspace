import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Sprout } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { PlantTheme } from '@/constants/theme';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ChangeUsernameScreen() {
  const insets = useSafeAreaInsets();
  const { user, firebaseUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUsername = (value: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!value.trim()) {
      setError('Username is required');
      return false;
    }
    if (value.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (value.length > 30) {
      setError('Username must be less than 30 characters');
      return false;
    }
    if (!usernameRegex.test(value)) {
      setError('Username can only contain letters, numbers, underscores, and periods');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateUsername(username)) {
      return;
    }

    if (!firebaseUser) {
      Alert.alert('Error', 'You must be logged in to change your username');
      return;
    }

    if (username === user?.username) {
      Alert.alert('No Changes', 'Username is the same as before');
      return;
    }

    setIsLoading(true);
    try {
      const profileRef = doc(db, 'profiles', firebaseUser.uid);
      await updateDoc(profileRef, {
        username: username.trim(),
      });

      Alert.alert('Success', 'Username updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.error('Error updating username:', err);
      if (err.code === 'permission-denied') {
        Alert.alert('Error', 'You do not have permission to update your username');
      } else {
        Alert.alert('Error', 'Failed to update username. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1a1c1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Username</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Username</Text>
          <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
            <Sprout
              color={error ? '#EF4444' : '#424842'}
              size={20}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) validateUsername(text);
              }}
              placeholder="Enter new username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.helperText}>
              Your username must be unique and can only contain letters, numbers, underscores, and periods.
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F6F8F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#424842',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1E3E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperError: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#191c19',
  },
  helperText: {
    fontSize: 12,
    color: '#737973',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#F6F8F6',
  },
  saveButton: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
