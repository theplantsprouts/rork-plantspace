import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { PlantTheme, borderRadius, shadows } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  screenName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ScreenErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ScreenErrorBoundary] caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[ScreenErrorBoundary - ${this.props.screenName || 'Screen'}]:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined });
    router.replace('/(tabs)/home');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorScreen onRetry={this.handleRetry} onGoHome={this.handleGoHome} error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorScreen({ onRetry, onGoHome, error }: { onRetry: () => void; onGoHome: () => void; error?: Error }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.errorCard}>
          <View style={styles.iconContainer}>
            <AlertTriangle color={PlantTheme.colors.error} size={56} />
          </View>
          <Text style={styles.title}>🌱 Oops!</Text>
          <Text style={styles.message}>
            Something went wrong in this screen. Don&apos;t worry, we can fix this!
          </Text>
          {__DEV__ && error && (
            <View style={styles.errorDetailsContainer}>
              <Text style={styles.errorDetailsTitle}>Error Details (Dev Mode)</Text>
              <Text style={styles.errorDetails}>{error.message}</Text>
              {error.stack && (
                <Text style={styles.errorStack} numberOfLines={10}>
                  {error.stack}
                </Text>
              )}
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <RefreshCw color={PlantTheme.colors.white} size={20} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
              <Home color={PlantTheme.colors.primary} size={20} />
              <Text style={styles.homeText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorCard: {
    alignItems: 'center',
    padding: 32,
    maxWidth: 500,
    width: '100%',
    backgroundColor: PlantTheme.colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: PlantTheme.colors.outlineVariant,
    ...shadows.lg,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: PlantTheme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetailsContainer: {
    width: '100%',
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    borderRadius: borderRadius.md,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PlantTheme.colors.error,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: PlantTheme.colors.error,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: PlantTheme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
    gap: 8,
    ...shadows.md,
  },
  retryText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PlantTheme.colors.surfaceVariant,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
    gap: 8,
    borderWidth: 1,
    borderColor: PlantTheme.colors.outline,
  },
  homeText: {
    color: PlantTheme.colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
