import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Shield, ArrowLeft } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';
import { getUserByEmail, setUserAsAdmin } from '@/lib/firebase';

export default function AdminInitialization() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const initializeAdmin = async () => {
    setLoading(true);
    try {
      const adminEmail = 'harshaghvdt@gmail.com';
      
      const user = await getUserByEmail(adminEmail);
      
      if (!user) {
        Alert.alert(
          'User Not Found',
          `No user found with email ${adminEmail}. Please make sure the user has registered first.`
        );
        return;
      }

      await setUserAsAdmin(user.id, true);
      
      Alert.alert(
        'Success',
        `User ${adminEmail} has been set as admin successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error initializing admin:', error);
      Alert.alert('Error', error.message || 'Failed to initialize admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={PlantTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Initialization</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: PlantTheme.colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: PlantTheme.colors.primaryLight }]}>
              <Shield size={48} color={PlantTheme.colors.primary} />
            </View>

            <Text style={styles.title}>Initialize Admin User</Text>
            <Text style={styles.description}>
              This will set harshaghvdt@gmail.com as an admin user. Make sure this user has already registered in the app.
            </Text>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: PlantTheme.colors.primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={initializeAdmin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={PlantTheme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Initialize Admin</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Note:</Text>
              <Text style={styles.infoText}>
                • The user must be registered first{'\n'}
                • Only run this once{'\n'}
                • Admin users can access the admin panel at /admin
              </Text>
            </View>
          </View>
        </View>
      </View>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    padding: 24,
    borderRadius: PlantTheme.borderRadius.lg,
    alignItems: 'center',
    ...PlantTheme.shadows.md,
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
    fontSize: 24,
    fontWeight: '700',
    color: PlantTheme.colors.onSurface,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: PlantTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: PlantTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...PlantTheme.shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: PlantTheme.colors.white,
  },
  infoBox: {
    width: '100%',
    padding: 16,
    backgroundColor: PlantTheme.colors.primaryLight,
    borderRadius: PlantTheme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: PlantTheme.colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PlantTheme.colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: PlantTheme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
