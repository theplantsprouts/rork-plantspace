import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, isProfileComplete } from '@/hooks/use-auth';
import { PlantTheme, PlantTypography } from '@/constants/theme';
import { Sprout, AlertCircle } from 'lucide-react-native';

export default function Index() {
  const { user, firebaseUser, isLoading } = useAuth();

  const profileComplete = useMemo(() => {
    return user ? isProfileComplete(user) : false;
  }, [user]);

  console.log('Index.tsx - isLoading:', isLoading, 'user:', user ? `Present (${user.id})` : 'None');
  
  if (user) {
    console.log('Index.tsx - Profile complete:', profileComplete, 'user data:', {
      hasName: !!user.name,
      hasUsername: !!user.username,
      hasBio: !!user.bio
    });
  }

  useEffect(() => {
    if (!isLoading) {
      if (firebaseUser && !firebaseUser.emailVerified) {
        console.log('Index.tsx - Email not verified, staying on landing');
        return;
      }
      
      if (user && profileComplete) {
        console.log('Index.tsx - Navigating to home');
        router.replace('/(tabs)/home');
      } else if (user && !profileComplete) {
        console.log('Index.tsx - Navigating to profile setup');
        router.replace('/profile-setup');
      }
    }
  }, [user, firebaseUser, isLoading, profileComplete]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PlantTheme.colors.primary} />
      </View>
    );
  }

  if (firebaseUser && !firebaseUser.emailVerified) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.verificationContainer}>
            <View style={styles.iconContainer}>
              <AlertCircle color={PlantTheme.colors.primary} size={64} />
            </View>
            <Text style={styles.verificationTitle}>Verify Your Email</Text>
            <Text style={styles.verificationMessage}>
              We&apos;ve sent a verification link to {firebaseUser.email}. Please check your inbox and click the link to verify your account.
            </Text>
            <Text style={styles.verificationNote}>
              After verifying, please close and reopen the app to continue.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Sprout color={PlantTheme.colors.primary} size={36} />
            <Text style={styles.logoText}>PlantSpace</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfH2UvACjnzg40lAjLM4NcMfFWgnOeT0m-CF9l0D3KTtCCM5I8gLi8pH5L-zbaN8oU8i6V81h7KqLYH0380QcU9g-aPjE1pKumAsJzQo1U-3JkswXc0djzWF9SRxBVXs7YX_x9pcoDsmokPhxixIITNGU4NkyOPGLD8dpg1W9TunssPP7qo-gDt4WC37_RZW_dBrv-ondpNhRFnt7lLJGHoLsTjxs8tsmbQeXRyBaNOxLJT4EGfyI_BOSdMPe5MNT_zYLjYlMc6tKW' }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContent}>
            <Text style={styles.title}>
              Welcome to the{"\n"}Plant Community
            </Text>
            <Text style={styles.subtitle}>
              Connect with fellow plant enthusiasts, share your green journey, and discover new plant-based recipes and tips.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => router.push('/auth')}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlantTheme.colors.surfaceContainer,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    ...PlantTypography.headline,
    color: PlantTheme.colors.onSurface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 32,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
  },
  textContent: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  title: {
    ...PlantTypography.display,
    color: PlantTheme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...PlantTypography.body,
    color: PlantTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    gap: 16,
  },
  signUpButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: PlantTheme.borderRadius.full,
    alignItems: 'center',
    ...PlantTheme.elevation.level3,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  loginButton: {
    backgroundColor: PlantTheme.colors.surfaceVariant,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: PlantTheme.borderRadius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PlantTheme.colors.outline,
  },
  loginButtonText: {
    color: PlantTheme.colors.primary,
    ...PlantTypography.title,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: PlantTheme.colors.glassBackground,
    borderRadius: PlantTheme.borderRadius.full,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  verificationTitle: {
    ...PlantTypography.headline,
    color: PlantTheme.colors.onSurface,
    marginBottom: 16,
    textAlign: 'center',
  },
  verificationMessage: {
    ...PlantTypography.body,
    color: PlantTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  verificationNote: {
    ...PlantTypography.label,
    color: PlantTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});