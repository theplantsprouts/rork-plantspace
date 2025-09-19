import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function FirebaseTest() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<string>('Initializing...');
  const [tests, setTests] = useState<{ name: string; status: 'pending' | 'success' | 'error'; message?: string }[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStatus(`Authenticated as: ${currentUser.email}`);
      } else {
        setStatus('Not authenticated');
      }
    });

    return unsubscribe;
  }, []);

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
    
    // Try to write a test document
    const testDoc = doc(db, 'test', user.uid);
    await setDoc(testDoc, {
      test: true,
      timestamp: new Date().toISOString(),
    });
  };

  const runAllTests = async () => {
    setTests([]);
    await runTest('Firebase Connection', testFirebaseConnection);
    
    if (user) {
      await runTest('Firestore Read', testFirestoreRead);
      await runTest('Firestore Write', testFirestoreWrite);
    }
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

      <TouchableOpacity style={styles.button} onPress={runAllTests}>
        <Text style={styles.buttonText}>Run Tests</Text>
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
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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
});