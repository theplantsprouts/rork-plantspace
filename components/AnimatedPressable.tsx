import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Animated,
  ViewStyle,
  Platform,
  TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  scaleValue?: number;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
  bounceEffect?: 'subtle' | 'medium' | 'strong';
  disabled?: boolean;
}

export function AnimatedPressable({
  children,
  style,
  onPress,
  scaleValue,
  hapticFeedback = 'light',
  bounceEffect = 'medium',
  disabled = false,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bounceConfig = {
    subtle: { down: 0.96, up: 1.03, duration: 120 },
    medium: { down: 0.92, up: 1.08, duration: 150 },
    strong: { down: 0.88, up: 1.12, duration: 180 },
  };

  const config = bounceConfig[bounceEffect];
  const finalScaleDown = scaleValue ?? config.down;

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    if (Platform.OS !== 'web' && hapticFeedback !== 'none') {
      const feedbackMap = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      
      Haptics.impactAsync(feedbackMap[hapticFeedback]).catch(() => {});
    }

    Animated.spring(scaleAnim, {
      toValue: finalScaleDown,
      useNativeDriver: true,
      tension: 400,
      friction: 15,
      velocity: 2,
    }).start();
  }, [disabled, scaleAnim, finalScaleDown, hapticFeedback]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: config.up,
        useNativeDriver: true,
        tension: 250,
        friction: 8,
        velocity: 3,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 180,
        friction: 10,
        velocity: 1,
      }),
    ]).start();
  }, [disabled, scaleAnim, config.up]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    onPress?.();
  }, [disabled, onPress]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function AnimatedButton({
  children,
  style,
  onPress,
  disabled = false,
  ...props
}: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      style={style}
      onPress={onPress}
      disabled={disabled}
      bounceEffect="medium"
      hapticFeedback="medium"
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export function AnimatedIconButton({
  children,
  style,
  onPress,
  disabled = false,
  ...props
}: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      style={style}
      onPress={onPress}
      disabled={disabled}
      bounceEffect="subtle"
      hapticFeedback="light"
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
