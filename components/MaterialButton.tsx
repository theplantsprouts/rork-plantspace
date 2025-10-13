import React from 'react';
import {
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { PlantTheme } from '@/constants/theme';
import { AnimatedButton } from './AnimatedPressable';

interface MaterialButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function MaterialButton({
  title,
  onPress,
  disabled = false,
  variant = 'filled',
  size = 'medium',
  icon,
  style,
  textStyle,
  testID,
}: MaterialButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    Platform.OS === 'android' && styles.materialAndroid,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.baseText,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <AnimatedButton
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      bounceEffect="medium"
      hapticFeedback="medium"
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={textStyleCombined}>{title}</Text>
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PlantTheme.borderRadius.button,
    paddingHorizontal: 28,
    paddingVertical: 14,
    minHeight: 52,
  },
  
  // Variants
  filled: {
    backgroundColor: PlantTheme.colors.primary,
    ...PlantTheme.shadows.lg,
  },
  outlined: {
    backgroundColor: PlantTheme.colors.glassBackground,
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    } as any),
  },
  text: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: PlantTheme.borderRadius.lg,
  },
  medium: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    minHeight: 52,
    borderRadius: PlantTheme.borderRadius.button,
  },
  large: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    minHeight: 60,
    borderRadius: PlantTheme.borderRadius.button,
  },
  
  // Android specific - solid style
  materialAndroid: {
    elevation: 8,
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  
  // States
  disabled: {
    opacity: 0.38,
  },
  
  // Text styles
  baseText: {
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    ...(Platform.OS === 'android' && {
      fontFamily: 'System',
    }),
  },
  
  filledText: {
    color: PlantTheme.colors.white,
  },
  outlinedText: {
    color: PlantTheme.colors.primary,
  },
  textText: {
    color: PlantTheme.colors.primary,
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    opacity: 0.38,
  },
  
  iconContainer: {
    marginRight: 8,
  },
});