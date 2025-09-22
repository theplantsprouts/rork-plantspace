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

// Keep the old names for backward compatibility
export const CardContainer = GlassContainer;
export const Card = GlassCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: PlantTheme.colors.cardBackground,
    borderRadius: PlantTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
    ...PlantTheme.shadows.sm,
    ...(Platform.OS === 'android' && {
      backgroundColor: PlantTheme.colors.cardBackground,
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  card: {
    backgroundColor: PlantTheme.colors.cardBackground,
    borderRadius: PlantTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
    ...PlantTheme.shadows.md,
    ...(Platform.OS === 'android' && {
      backgroundColor: PlantTheme.colors.cardBackground,
      elevation: 3,
      shadowColor: 'transparent',
    }),
  },
});