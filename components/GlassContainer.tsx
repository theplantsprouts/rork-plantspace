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
  
  if (Platform.OS === 'android') {
    return (
      <View testID={testID} style={[styles.glassContainer, styles.androidContainer, style]}>
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
  },
  webGlassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  } as ViewStyle,
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
    elevation: 3,
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  glassCard: {
    ...(Platform.OS === 'android' ? {
      elevation: 4,
      shadowColor: PlantTheme.colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
    } : {
      ...PlantTheme.shadows.md,
      backgroundColor: 'transparent',
    }),
  },
});