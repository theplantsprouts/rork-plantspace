import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { PlantTheme } from '@/constants/theme';

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
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      activeOpacity={0.8}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={textStyleCombined}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PlantTheme.borderRadius.lg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  
  // Variants
  filled: {
    backgroundColor: PlantTheme.colors.primary,
    ...PlantTheme.shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // Android specific - solid style
  materialAndroid: {
    borderRadius: PlantTheme.borderRadius.lg,
    elevation: 4,
    shadowColor: PlantTheme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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