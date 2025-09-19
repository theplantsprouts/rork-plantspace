import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, registerUser, loginUser, logoutUser, createPost, getPosts, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function FirebaseTest() {
  const insets = useSafeAreaInsets();
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [tests, setTests] = useState<{ name: string; status: 'pending' | 'success' | 'error'; message?: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const status = loading ? 'Loading...' : user ? `Authenticated as: ${user.email}` : 'Not authenticated';

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setTests(prev => [...prev.filter(t => t.name !== testName), { name: testName, status: 'pending' }]);
    
    try {
      await testFn();
      setTests(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'success' as const, message: 'Passed' }
          : t
      ));
    } catch (error: any) {
      setTests(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'error' as const, message: error.message }
          : t
      ));
    }
  };

  const testFirebaseConnection = async () => {
    // Test basic Firebase connection
    if (!auth || !db) {
      throw new Error('Firebase not initialized');
    }
  };

  const testAuth = async () => {
    if (!email || !password) {
      throw new Error('Email and password required');
    }
    
    try {
      await loginUser(email, password);
    } catch (loginError: any) {
      // If login fails, try to register
      if (loginError.message.includes('user-not-found') || loginError.message.includes('invalid-credential')) {
        await registerUser(email, password);
      } else {
        throw loginError;
      }
    }
  };

  const testFirestoreRead = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Try to read user profile
    const docRef = doc(db, 'profiles', user.uid);
    await getDoc(docRef);
  };

  const testFirestoreWrite = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Try to create a post
    await createPost('Test post from Firebase test');
  };

  const testFirestoreQuery = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Try to fetch posts
    const posts = await getPosts();
    if (posts.length === 0) {
      throw new Error('No posts found - create a post first');
    }
  };

  const runAllTests = async () => {
    setTests([]);
    await runTest('Firebase Connection', testFirebaseConnection);
    
    if (!user && email && password) {
      await runTest('Authentication', testAuth);
    }
    
    if (user) {
      await runTest('Firestore Read', testFirestoreRead);
      await runTest('Firestore Write', testFirestoreWrite);
      await runTest('Firestore Query', testFirestoreQuery);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setEmail('');
      setPassword('');
      setPostContent('');
      setTests([]);
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      {user ? (
        <View style={styles.userSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authSection}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      )}

      {user && (
        <View style={styles.postSection}>
          <TextInput
            style={styles.input}
            placeholder="Test post content"
            value={postContent}
            onChangeText={setPostContent}
            multiline
          />
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={runAllTests}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </Text>
      </TouchableOpacity>

      <View style={styles.testsContainer}>
        {tests.map((test) => (
          <View key={test.name} style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(test.status) }]} />
            </View>
            {test.message && (
              <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
                {test.message}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Firebase Configuration:</Text>
        <Text style={styles.infoText}>Project ID: plantspace-5a93d</Text>
        <Text style={styles.infoText}>Auth Domain: plantspace-5a93d.firebaseapp.com</Text>
        <Text style={styles.infoText}>Storage Bucket: plantspace-5a93d.firebasestorage.app</Text>
        <Text style={styles.infoText}>Rules: Production mode (secure)</Text>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.infoTitle}>Instructions:</Text>
        <Text style={styles.infoText}>1. Enter email/password above</Text>
        <Text style={styles.infoText}>2. Click Run All Tests</Text>
        <Text style={styles.infoText}>3. Check test results below</Text>
        <Text style={styles.infoText}>4. All tests should pass ✅</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  authSection: {
    marginBottom: 20,
  },
  userSection: {
    marginBottom: 20,
  },
  postSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testsContainer: {
    marginBottom: 20,
  },
  testItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  testMessage: {
    fontSize: 14,
    marginTop: 5,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});