import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { PlantTheme } from '@/constants/theme';

interface CardContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function GlassContainer({ 
  children, 
  style, 
  testID 
}: CardContainerProps) {
  return (
    <View testID={testID} style={[styles.cardContainer, style]}>
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
    <View
      testID={testID}
      style={[
        styles.card,
        { padding: PlantTheme.spacing[padding] },
        style
      ]}
    >
      {children}
    </View>
  );
}

// Backwards compatibility aliases
export const CardContainer = GlassContainer;
export const Card = GlassCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: PlantTheme.colors.surface,
    borderRadius: PlantTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.outlineVariant,
    ...PlantTheme.elevation.level1,
    ...(Platform.OS === 'android' && {
      backgroundColor: PlantTheme.colors.surface,
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  card: {
    backgroundColor: PlantTheme.colors.surface,
    borderRadius: PlantTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.outlineVariant,
    ...PlantTheme.elevation.level2,
    ...(Platform.OS === 'android' && {
      backgroundColor: PlantTheme.colors.surface,
      elevation: 3,
      shadowColor: 'transparent',
    }),
  },
});
