import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { GlassContainer } from './GlassContainer';
import { MaterialButton } from './MaterialButton';
import { PlantTheme } from '@/constants/theme';

interface ConnectionErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  title = 'Connection Error',
  message,
  onRetry,
  showRetry = true,
}) => {
  return (
    <View style={styles.container}>
      <GlassContainer style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertTriangle color={PlantTheme.colors.error} size={48} />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.helpText}>
          <Text style={styles.helpTitle}>Troubleshooting:</Text>
          <Text style={styles.helpItem}>• Check your internet connection</Text>
          <Text style={styles.helpItem}>• Make sure the server is running</Text>
          <Text style={styles.helpItem}>• Try refreshing the app</Text>
          <Text style={styles.helpItem}>• Contact support if the issue persists</Text>
        </View>
        
        {showRetry && onRetry && (
          <MaterialButton
            title="🔄 Try Again"
            onPress={onRetry}
            style={styles.retryButton}
          />
        )}
      </GlassContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  helpText: {
    alignSelf: 'stretch',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 8,
  },
  helpItem: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  retryButton: {
    minWidth: 120,
  },
});