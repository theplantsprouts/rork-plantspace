import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ConnectionTest } from '@/components/ConnectionTest';
import { GlassContainer } from '@/components/GlassContainer';

import { PlantTheme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function DebugScreen() {
  const { user, firebaseUser } = useAuth();
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Firebase Debug', headerShown: true }} />
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GlassContainer style={styles.statusContainer}>
            <Text style={styles.title}>Firebase Status</Text>
            <Text style={styles.statusText}>
              🔥 Firebase Backend
            </Text>
            <Text style={styles.description}>
              Using Firebase for authentication, database, and storage.
              {firebaseUser ? ` Authenticated as ${firebaseUser.email}` : ' Not authenticated.'}
            </Text>
            
            {user && (
              <View style={styles.userInfo}>
                <Text style={styles.userTitle}>User Profile:</Text>
                <Text style={styles.userDetail}>ID: {user.id}</Text>
                <Text style={styles.userDetail}>Email: {user.email}</Text>
                {user.name && <Text style={styles.userDetail}>Name: {user.name}</Text>}
                {user.username && <Text style={styles.userDetail}>Username: {user.username}</Text>}
                <Text style={styles.userDetail}>
                  Profile Complete: {user.name && user.username && user.bio ? '✅' : '❌'}
                </Text>
              </View>
            )}
          </GlassContainer>
          
          <ConnectionTest />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statusContainer: {
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: PlantTheme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  mockButton: {
    marginTop: 8,
  },
  userInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 8,
  },
  userDetail: {
    fontSize: 12,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 4,
  },
});