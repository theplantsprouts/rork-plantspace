import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
  const { colors, isDark } = useTheme();
  
  if (Platform.OS === 'web') {
    return (
      <View 
        testID={testID} 
        style={[
          styles.cardContainer, 
          { 
            backgroundColor: colors.glassBackground, 
            borderColor: colors.glassBorder,
            borderWidth: 1.5,
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          } as any, 
          style
        ]}
      >
        {children}
      </View>
    );
  }
  
  if (Platform.OS === 'android') {
    return (
      <View 
        testID={testID} 
        style={[
          styles.cardContainer, 
          { 
            backgroundColor: colors.glassBackground, 
            borderColor: colors.glassBorder,
            borderWidth: 1.5,
          }, 
          style
        ]}
      >
        {children}
      </View>
    );
  }
  
  return (
    <View testID={testID} style={[styles.cardContainer, style]}>
      <BlurView
        intensity={isDark ? 70 : 50}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[
        StyleSheet.absoluteFill,
        { 
          backgroundColor: colors.glassBackground,
          borderRadius: borderRadius.lg,
          borderWidth: 1.5,
          borderColor: colors.glassBorder,
        }
      ]} />
      <View style={styles.content}>
        {children}
      </View>
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
  const { colors, isDark } = useTheme();
  
  if (Platform.OS === 'web') {
    return (
      <View
        testID={testID}
        style={[
          styles.card,
          { 
            padding: spacing[padding as keyof typeof spacing], 
            backgroundColor: colors.glassBackground, 
            borderColor: colors.glassBorder,
            borderWidth: 1.5,
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          } as any,
          style
        ]}
      >
        {children}
      </View>
    );
  }
  
  if (Platform.OS === 'android') {
    return (
      <View
        testID={testID}
        style={[
          styles.card,
          { 
            backgroundColor: colors.glassBackground, 
            borderColor: colors.glassBorder,
            borderWidth: 1.5,
          },
          style
        ]}
      >
        <View style={{ padding: spacing[padding as keyof typeof spacing] }}>
          {children}
        </View>
      </View>
    );
  }
  
  return (
    <View testID={testID} style={[styles.card, style]}>
      <BlurView
        intensity={isDark ? 80 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[
        StyleSheet.absoluteFill,
        { 
          backgroundColor: colors.glassBackground,
          borderRadius: borderRadius.lg,
          borderWidth: 1.5,
          borderColor: colors.glassBorder,
        }
      ]} />
      <View style={[styles.content, { padding: spacing[padding as keyof typeof spacing] }]}>
        {children}
      </View>
    </View>
  );
}

export const CardContainer = GlassContainer;
export const Card = GlassCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...elevation.level2,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...elevation.level3,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
