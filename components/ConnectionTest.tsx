import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { testConnection } from '@/lib/trpc';
import { GlassContainer } from './GlassContainer';
import { MaterialButton } from './MaterialButton';

interface ConnectionTestProps {
  onClose?: () => void;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const testResult = await testConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { error: String(error) }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlassContainer style={styles.content}>
        <Text style={styles.title}>Connection Test</Text>
        <Text style={styles.subtitle}>Test the backend API connection</Text>
        
        <MaterialButton
          title={isLoading ? "Testing..." : "Run Connection Test"}
          onPress={runTest}
          disabled={isLoading}
          style={styles.testButton}
        />
        
        {result && (
          <ScrollView style={styles.resultContainer}>
            <View style={[styles.resultHeader, result.success ? styles.success : styles.error]}>
              <Text style={styles.resultStatus}>
                {result.success ? '✅ Success' : '❌ Failed'}
              </Text>
            </View>
            
            <Text style={styles.resultMessage}>{result.message}</Text>
            
            {result.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Details:</Text>
                <Text style={styles.detailsText}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
        
        {onClose && (
          <MaterialButton
            title="Close"
            onPress={onClose}
            variant="outlined"
            style={styles.closeButton}
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
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5a7c3a',
    textAlign: 'center',
    marginBottom: 24,
  },
  testButton: {
    marginBottom: 20,
  },
  resultContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  resultHeader: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  success: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  error: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 16,
    color: '#2d5016',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 12,
    color: '#5a7c3a',
    fontFamily: 'monospace',
  },
  closeButton: {
    marginTop: 12,
  },
});