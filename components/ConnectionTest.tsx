import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { trpcClient } from '@/lib/trpc';
import { GlassContainer } from './GlassContainer';
import { MaterialButton } from './MaterialButton';

interface ConnectionTestProps {
  onClose?: () => void;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const getBaseUrl = () => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.location) {
          return window.location.origin;
        }
      } catch (error) {
        console.log('Failed to get window.location.origin:', error);
      }
    }
    return "https://l1v04hq0ysnd54scxcbqm.rork.com";
  };

  const runTest = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    
    const baseUrl = getBaseUrl();
    const testResults = {
      baseUrl,
      platform: Platform.OS,
      environment: __DEV__ ? 'Development' : 'Production',
      tests: [] as any[]
    };
    
    try {
      // Test 1: Basic API Health Check
      console.log('Testing basic API health check...');
      try {
        const response = await fetch(`${baseUrl}/api`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            testResults.tests.push({
              name: 'API Health Check',
              status: 'success',
              message: `API is healthy (${response.status})`,
              data
            });
          } else {
            const text = await response.text();
            testResults.tests.push({
              name: 'API Health Check',
              status: 'error',
              message: `API returned non-JSON response (${response.status})`,
              data: { status: response.status, contentType, text: text.substring(0, 200) }
            });
          }
        } else {
          const text = await response.text();
          let errorMessage = `API returned ${response.status}: ${response.statusText}`;
          
          if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
            errorMessage = `Server returned HTML error page (${response.status}). Backend may not be configured correctly.`;
          }
          
          testResults.tests.push({
            name: 'API Health Check',
            status: 'error',
            message: errorMessage,
            data: { status: response.status, text: text.substring(0, 200) }
          });
        }
      } catch (error) {
        testResults.tests.push({
          name: 'API Health Check',
          status: 'error',
          message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { error: String(error) }
        });
      }

      // Test 2: tRPC Example Endpoint
      console.log('Testing tRPC example endpoint...');
      try {
        const exampleResult = await trpcClient.example.hi.mutate({ name: 'ConnectionTest' });
        testResults.tests.push({
          name: 'tRPC Example',
          status: 'success',
          message: 'tRPC example endpoint working',
          data: exampleResult
        });
      } catch (error) {
        testResults.tests.push({
          name: 'tRPC Example',
          status: 'error',
          message: `tRPC example failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { error: String(error) }
        });
      }

      // Test 3: Auth Endpoint (should fail without auth)
      console.log('Testing auth endpoint...');
      try {
        const authResult = await trpcClient.auth.me.query();
        testResults.tests.push({
          name: 'Auth Endpoint',
          status: 'success',
          message: 'Auth endpoint working (user authenticated)',
          data: authResult
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('Not authenticated')) {
          testResults.tests.push({
            name: 'Auth Endpoint',
            status: 'success',
            message: 'Auth endpoint working (correctly rejected unauthenticated request)',
            data: { expectedError: errorMessage }
          });
        } else {
          testResults.tests.push({
            name: 'Auth Endpoint',
            status: 'error',
            message: `Auth endpoint error: ${errorMessage}`,
            data: { error: errorMessage }
          });
        }
      }

      // Determine overall success
      const hasErrors = testResults.tests.some(test => test.status === 'error');
      setResult({
        success: !hasErrors,
        message: hasErrors ? 'Some tests failed' : 'All tests passed',
        details: testResults
      });
      
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { error: String(error), testResults }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-run test on mount
  useEffect(() => {
    runTest();
  }, [runTest]);

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