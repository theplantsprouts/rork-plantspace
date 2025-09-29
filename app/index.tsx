import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, isProfileComplete } from '@/hooks/use-auth';
import { PlantTheme } from '@/constants/theme';
import { Sprout } from 'lucide-react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

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
      if (user && profileComplete) {
        console.log('Index.tsx - Navigating to home');
        router.replace('/(tabs)/home');
      } else if (user && !profileComplete) {
        console.log('Index.tsx - Navigating to profile setup');
        router.replace('/profile-setup');
      }
    }
  }, [user, isLoading, profileComplete]);

  if (isLoading) {
    return null;
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
            <Text style={styles.logoText}>Sprout</Text>
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
              Welcome to the{"\n"}Plant-Based Community
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
    backgroundColor: PlantTheme.colors.backgroundStart,
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
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: PlantTheme.colors.textDark,
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
    fontSize: 30,
    fontWeight: 'bold' as const,
    color: PlantTheme.colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    gap: 16,
  },
  signUpButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  loginButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
  },
  loginButtonText: {
    color: PlantTheme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
});