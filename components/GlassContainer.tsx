import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { PlantTheme } from '@/constants/theme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export function GlassContainer({ 
  children, 
  style, 
  intensity = 20,
  tint = 'light' 
}: GlassContainerProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.glassContainer, styles.webGlassContainer, style]}>
        <View style={styles.glassOverlay}>
          {children}
        </View>
      </View>
    );
  }
  
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.glassContainer, style]}
    >
      <View style={styles.glassOverlay}>
        {children}
      </View>
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
      style={[
        styles.glassCard,
        { padding: PlantTheme.spacing[padding] },
        style
      ]}
    >
      <View testID={testID} style={styles.testContainer}>
        {children}
      </View>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: PlantTheme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
    ...(Platform.OS === 'android' && {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  webGlassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  } as ViewStyle,
  glassOverlay: {
    backgroundColor: Platform.OS === 'android' ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
    flex: 1,
  },
  glassCard: {
    ...PlantTheme.shadows.md,
    backgroundColor: Platform.OS === 'android' ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
  },
  testContainer: {
    flex: 1,
  },
});