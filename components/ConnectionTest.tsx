import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { auth, getPosts } from '@/lib/firebase';
import { GlassContainer } from './GlassContainer';
import { MaterialButton } from './MaterialButton';
import { useAuth } from '@/hooks/use-auth';

interface ConnectionTestProps {
  onClose?: () => void;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();

  const runTest = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    
    const testResults = {
      platform: Platform.OS,
      environment: __DEV__ ? 'Development' : 'Production',
      backend: 'Firebase',
      tests: [] as any[]
    };
    
    try {
      // Test 1: Firebase Auth Connection
      console.log('Testing Firebase Auth connection...');
      try {
        const currentUser = auth.currentUser;
        testResults.tests.push({
          name: 'Firebase Auth',
          status: 'success',
          message: currentUser ? 'User authenticated' : 'Auth service available (no user)',
          data: { 
            hasUser: !!currentUser,
            userId: currentUser?.uid,
            email: currentUser?.email
          }
        });
      } catch (error) {
        testResults.tests.push({
          name: 'Firebase Auth',
          status: 'error',
          message: `Firebase Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: { error: String(error) }
        });
      }

      // Test 2: Firestore Connection
      console.log('Testing Firestore connection...');
      try {
        // Wait for auth to be ready
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Get auth token to ensure it's valid
          await currentUser.getIdToken();
        }
        
        const posts = await getPosts();
        testResults.tests.push({
          name: 'Firestore Database',
          status: 'success',
          message: `Firestore connected successfully (${posts.length} posts found)`,
          data: { postsCount: posts.length, authenticated: !!currentUser }
        });
      } catch (error: any) {
        let errorMessage = error.message || 'Unknown error';
        if (error.code === 'permission-denied') {
          errorMessage = 'Permission denied - user may not be properly authenticated';
        } else if (error.code === 'unauthenticated') {
          errorMessage = 'User not authenticated - please log in';
        }
        
        testResults.tests.push({
          name: 'Firestore Database',
          status: 'error',
          message: `Firestore error: ${errorMessage}`,
          data: { error: String(error), code: error.code }
        });
      }

      // Test 3: User Profile Check
      console.log('Testing user profile...');
      if (user) {
        testResults.tests.push({
          name: 'User Profile',
          status: 'success',
          message: 'User profile loaded successfully',
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            hasCompleteProfile: !!(user.name && user.username && user.bio)
          }
        });
      } else {
        testResults.tests.push({
          name: 'User Profile',
          status: 'info',
          message: 'No user logged in',
          data: { authenticated: false }
        });
      }

      // Determine overall success
      const hasErrors = testResults.tests.some(test => test.status === 'error');
      setResult({
        success: !hasErrors,
        message: hasErrors ? 'Some Firebase tests failed' : 'All Firebase tests passed',
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
  }, [user]);

  // Auto-run test on mount
  useEffect(() => {
    runTest();
  }, [runTest]);

  return (
    <View style={styles.container}>
      <GlassContainer style={styles.content}>
        <Text style={styles.title}>Firebase Connection Test</Text>
        <Text style={styles.subtitle}>Test Firebase services connection</Text>
        
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