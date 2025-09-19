import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { Redirect } from 'expo-router';
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

  if (isLoading) {
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

  // Not authenticated - go to auth screen
  if (!user) {
    console.log('Index.tsx - Redirecting to auth');
    return <Redirect href="/auth" />;
  }

  // Authenticated but profile not complete - go to profile setup
  if (!profileComplete) {
    console.log('Index.tsx - Redirecting to profile setup');
    return <Redirect href="/profile-setup" />;
  }

  // Authenticated and profile complete - go to home
  console.log('Index.tsx - Redirecting to home');
  return <Redirect href="/(tabs)/home" />;
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