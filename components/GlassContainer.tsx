import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { borderRadius, elevation, spacing } from '@/constants/theme';

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
  const { colors } = useTheme();
  return (
    <View testID={testID} style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }, style]}>
      {children}
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  testID?: string;
}

export function GlassCard({ 
  children, 
  style, 
  padding = 'md',
  testID 
}: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        { padding: spacing[padding as keyof typeof spacing], backgroundColor: colors.surface, borderColor: colors.outlineVariant },
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
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    ...elevation.level1,
    ...(Platform.OS === 'android' && {
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    ...elevation.level2,
    ...(Platform.OS === 'android' && {
      elevation: 3,
      shadowColor: 'transparent',
    }),
  },
});
