import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { PlantTheme, borderRadius, elevation, shadows } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <LinearGradient
            colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.content}>
            <View style={styles.errorCard}>
              <View style={styles.iconContainer}>
                <AlertTriangle color={PlantTheme.colors.error} size={48} />
              </View>
              <Text style={styles.title}>🌱 Oops! Something went wrong</Text>
              <Text style={styles.message}>
                Don&apos;t worry, even the best gardens need tending. Let&apos;s get you back to growing!
              </Text>
              {__DEV__ && this.state.error && (
                <Text style={styles.errorDetails}>
                  {this.state.error.message}
                </Text>
              )}
              <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                <RefreshCw color={PlantTheme.colors.white} size={20} />
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorCard: {
    alignItems: 'center',
    padding: 32,
    maxWidth: 400,
    width: '100%',
    backgroundColor: PlantTheme.colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.outlineVariant,
    ...elevation.level2,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
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
  errorDetails: {
    fontSize: 12,
    color: PlantTheme.colors.error,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: borderRadius.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    gap: 8,
    ...shadows.md,
  },
  retryText: {
    color: PlantTheme.colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});