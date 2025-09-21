import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { PlantTheme } from '@/constants/theme';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function GlassContainer({ 
  children, 
  style, 
  testID 
}: ContainerProps) {
  return (
    <View testID={testID} style={[styles.container, style]}>
      {children}
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof PlantTheme.spacing;
  testID?: string;
}

export function GlassCard({ 
  children, 
  style, 
  padding = 'md',
  testID 
}: CardProps) {
  return (
    <GlassContainer
      testID={testID}
      style={[
        styles.card,
        { padding: PlantTheme.spacing[padding] },
        style
      ]}
    >
      {children}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: PlantTheme.colors.containerBackground,
    borderRadius: PlantTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.containerBorder,
    ...PlantTheme.shadows.sm,
  },
  card: {
    backgroundColor: PlantTheme.colors.containerBackground,
    ...PlantTheme.shadows.md,
  },
});