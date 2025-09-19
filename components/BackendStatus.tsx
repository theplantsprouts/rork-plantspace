import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlantTheme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

interface BackendStatusProps {
  style?: any;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ style }) => {
  const { firebaseUser } = useAuth();
  
  // Show Firebase status
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        🔥 Firebase {firebaseUser ? 'Connected' : 'Ready'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderWidth: 1,
    borderRadius: PlantTheme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '600' as const,
  },
});