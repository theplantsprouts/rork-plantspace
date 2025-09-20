import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { PlantTheme } from '@/constants/theme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  testID?: string;
}

export function GlassContainer({ 
  children, 
  style, 
  intensity = 10,
  tint = 'light',
  testID 
}: GlassContainerProps) {
  if (Platform.OS === 'web') {
    return (
      <View testID={testID} style={[styles.glassContainer, styles.webGlassContainer, style]}>
        {children}
      </View>
    );
  }
  
  return (
    <BlurView
      testID={testID}
      intensity={intensity}
      tint={tint}
      style={[styles.glassContainer, style]}
    >
      {children}
    </BlurView>
  );
}

interface GlassCardProps {
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
}: GlassCardProps) {
  return (
    <GlassContainer
      testID={testID}
      style={[
        styles.glassCard,
        { padding: PlantTheme.spacing[padding] },
        style
      ]}
    >
      {children}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: PlantTheme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'android' && {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      elevation: 1,
      shadowColor: 'transparent',
    }),
  },
  webGlassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  } as ViewStyle,
  glassCard: {
    ...PlantTheme.shadows.md,
  },
});