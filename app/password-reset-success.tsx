import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { MaterialButton } from '@/components/MaterialButton';
import { useTheme } from '@/hooks/use-theme';

export default function PasswordResetSuccessScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <CheckCircle color={colors.primary} size={64} />
          </View>

          <Text style={[styles.title, { color: colors.onSurface }]}>
            Password Reset Successful!
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Your password has been successfully reset. You can now log in with your new password.
          </Text>

          <View style={styles.actions}>
            <MaterialButton
              title="Go to Login"
              onPress={() => router.replace('/auth')}
              variant="filled"
              size="large"
              testID="go-to-login-button"
            />
          </View>
        </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  actions: {
    width: '100%',
  },
});
