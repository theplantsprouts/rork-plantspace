import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { AnimatedButton } from './AnimatedPressable';
import { PlantTheme } from '@/constants/theme';

interface LoadingButtonProps {
  onPress: () => void | Promise<void>;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  loadingText?: string;
}

export function LoadingButton({
  onPress,
  children,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  loadingText,
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePress = async () => {
    if (isLoading || loading || disabled) return;

    try {
      setIsLoading(true);
      await Promise.resolve(onPress());
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonLoading = loading || isLoading;
  const isButtonDisabled = disabled || isButtonLoading;

  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    isButtonDisabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    isButtonDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <AnimatedButton style={buttonStyles} onPress={handlePress} disabled={isButtonDisabled} bounceEffect="medium">
      {isButtonLoading ? (
        <>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? PlantTheme.colors.white : PlantTheme.colors.primary}
          />
          {loadingText && <Text style={[textStyles, { marginLeft: 8 }]}>{loadingText}</Text>}
        </>
      ) : (
        typeof children === 'string' ? <Text style={textStyles}>{children}</Text> : children
      )}
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: PlantTheme.borderRadius.xl,
    minHeight: 52,
    gap: 8,
    ...PlantTheme.shadows.md,
  },
  primaryButton: {
    backgroundColor: PlantTheme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: PlantTheme.colors.surfaceVariant,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PlantTheme.colors.outline,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  primaryText: {
    color: PlantTheme.colors.white,
  },
  secondaryText: {
    color: PlantTheme.colors.onSurfaceVariant,
  },
  outlineText: {
    color: PlantTheme.colors.primary,
  },
  disabledText: {
    opacity: 0.7,
  },
});
