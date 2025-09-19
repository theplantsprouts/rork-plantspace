import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ConnectionTest } from '@/components/ConnectionTest';
import { GlassContainer } from '@/components/GlassContainer';
import { MaterialButton } from '@/components/MaterialButton';
import { PlantTheme } from '@/constants/theme';
import { isUsingMock, enableMockMode } from '@/lib/trpc';

export default function DebugScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Connection Debug', headerShown: true }} />
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <GlassContainer style={styles.statusContainer}>
            <Text style={styles.title}>Backend Status</Text>
            <Text style={styles.statusText}>
              Mode: {isUsingMock() ? '🔧 Mock Backend' : '🌐 Real Backend'}
            </Text>
            <Text style={styles.description}>
              {isUsingMock() 
                ? 'Using local mock backend for development. All data is stored locally.'
                : 'Connected to remote backend server.'}
            </Text>
            
            <MaterialButton
              title="Enable Mock Mode"
              onPress={() => {
                enableMockMode();
                // Force re-render by updating state
              }}
              variant="outlined"
              style={styles.mockButton}
            />
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
});