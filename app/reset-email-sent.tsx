import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Mail } from 'lucide-react-native';
import { MaterialButton } from '@/components/MaterialButton';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function ResetEmailSentScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
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
            Check Your Email
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            We&apos;ve sent password reset instructions to
          </Text>
          
          <View style={[styles.emailContainer, { backgroundColor: colors.surfaceContainer }]}>
            <Mail color={colors.primary} size={20} />
            <Text style={[styles.email, { color: colors.onSurface }]}>
              {email || 'your email'}
            </Text>
          </View>

          <Text style={[styles.instructions, { color: colors.onSurfaceVariant }]}>
            Please check your inbox and click the link in the email to reset your password. The link will expire in 1 hour.
          </Text>

          <View style={styles.actions}>
            <MaterialButton
              title="Back to Login"
              onPress={() => router.replace('/auth')}
              variant="filled"
              size="large"
              testID="back-to-login-button"
            />

            <AnimatedButton
              onPress={() => router.back()}
              style={styles.resendButton}
              bounceEffect="subtle"
              hapticFeedback="light"
            >
              <Text style={[styles.resendText, { color: colors.primary }]}>
                Didn&apos;t receive the email? Try again
              </Text>
            </AnimatedButton>
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
    marginBottom: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  email: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  actions: {
    width: '100%',
  },
  resendButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
