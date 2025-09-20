import React, { useMemo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, isProfileComplete } from '@/hooks/use-auth';
import { PlantTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Use useEffect to handle navigation to prevent redirect loops
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('Index.tsx - Navigating to auth');
        router.replace('/auth');
      } else if (!profileComplete) {
        console.log('Index.tsx - Navigating to profile setup');
        router.replace('/profile-setup');
      } else {
        console.log('Index.tsx - Navigating to home');
        router.replace('/(tabs)/home');
      }
    }
  }, [user, isLoading, profileComplete]);

  // Always show loading screen while determining where to navigate
  console.log('Index.tsx - Showing loading screen');
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Sprout color={PlantTheme.colors.primary} size={48} />
        </View>
        <Text style={styles.loadingTitle}>🌱 Garden</Text>
        <Text style={styles.loadingSubtitle}>Growing your sustainable community</Text>
        <ActivityIndicator 
          size="large" 
          color={PlantTheme.colors.primary} 
          style={styles.spinner}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: PlantTheme.borderRadius.full,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
});