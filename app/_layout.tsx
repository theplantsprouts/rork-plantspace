import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/hooks/use-app-context";
import { AuthProvider, useAuth, isProfileComplete } from "@/hooks/use-auth";
import { OfflineProvider } from "@/hooks/use-offline";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/Toast";
import { PlantTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshCw } from "lucide-react-native";


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount < 3) {
          console.log(`Retrying query, attempt ${failureCount + 1}`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function RootLayoutNav() {
  const { user, isLoading, firebaseUser, logout } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  
  console.log('RootLayoutNav - isLoading:', isLoading, 'user:', user ? `Present (${user.id})` : 'None', 'firebaseUser:', firebaseUser ? `Present (${firebaseUser.uid})` : 'None');
  
  // Check for auth inconsistency (Firebase user exists but no profile)
  useEffect(() => {
    if (!isLoading && firebaseUser && !user) {
      console.log('Auth inconsistency detected: Firebase user exists but no profile');
      setAuthError('Profile creation failed. Please try logging out and back in.');
    } else {
      setAuthError(null);
    }
  }, [isLoading, firebaseUser, user]);
  
  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    );
  }
  
  // Show auth error screen if there's an inconsistency
  if (authError) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Issue</Text>
          <Text style={styles.errorMessage}>{authError}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={async () => {
              setAuthError(null);
              await logout();
            }}
          >
            <RefreshCw color={PlantTheme.colors.white} size={20} style={styles.retryIcon} />
            <Text style={styles.retryButtonText}>Logout & Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }
  
  // If user is not authenticated, only show auth-related screens
  if (!user) {
    console.log('RootLayoutNav - User not authenticated, showing auth screens');
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
      </Stack>
    );
  }
  
  // If user is authenticated but profile is not complete, show profile setup
  const profileComplete = isProfileComplete(user);
  console.log('RootLayoutNav - User authenticated, profile complete:', profileComplete);
  
  if (!profileComplete) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="profile-setup" />
      </Stack>
    );
  }
  
  // If user is authenticated and profile is complete, show all screens including tabs
  console.log('RootLayoutNav - Showing full app with tabs');
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="create-post" options={{ title: "Create Post" }} />
      <Stack.Screen name="firebase-test" options={{ title: "Firebase Test" }} />
      <Stack.Screen name="debug" options={{ title: "Debug" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await SplashScreen.hideAsync();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to initialize app');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OfflineProvider>
            <AppProvider>
              <GestureHandlerRootView style={styles.gestureHandler}>
                <AuthenticatedLayout />
                <ToastContainer />
              </GestureHandlerRootView>
            </AppProvider>
          </OfflineProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Separate component to access auth context
function AuthenticatedLayout() {
  return <RootLayoutNav />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureHandler: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: PlantTheme.colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: PlantTheme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});