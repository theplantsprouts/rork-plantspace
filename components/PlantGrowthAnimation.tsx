import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, StyleSheet, Text, Platform } from 'react-native';
import { PlantGrowthStage, PlantGrowthStages, PlantTheme } from '@/constants/theme';

interface PlantGrowthAnimationProps {
  stage: PlantGrowthStage;
  engagementScore: number;
  size?: number;
}

function PlantGrowthAnimationComponent({ 
  stage, 
  engagementScore, 
  size = 120 
}: PlantGrowthAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const currentStage = PlantGrowthStages[stage];

  useEffect(() => {
    const reducedMotion = Platform.OS === 'web';
    
    // Growth animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: reducedMotion ? 800 : 1500,
        useNativeDriver: true,
      }),
      reducedMotion ? Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }) :
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    if (!reducedMotion) {
      // Gentle sway animation - only on mobile
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation - only on mobile
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 2500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [stage, scaleAnim, rotateAnim, glowAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const showGlow = Platform.OS !== 'web';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect - only on mobile */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: size * 0.75,
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      
      {/* Plant container */}
      <Animated.View
        style={[
          styles.plantContainer,
          {
            transform: [
              { scale: scaleAnim },
              Platform.OS !== 'web' ? { rotate } : { rotate: '0deg' },
            ],
          },
        ]}
      >
        <Text style={[styles.plantEmoji, { fontSize: size * 0.6 }]}>
          {currentStage.emoji}
        </Text>
      </Animated.View>
      
      {/* Stage info */}
      <View style={styles.stageInfo}>
        <Text style={styles.stageName}>{currentStage.name}</Text>
        <Text style={styles.stageDescription}>{currentStage.description}</Text>
        <Text style={styles.engagementScore}>
          Engagement: {engagementScore}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    backgroundColor: PlantTheme.colors.primaryLight,
    opacity: 0.3,
  },
  plantContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  plantEmoji: {
    textAlign: 'center',
  },
  stageInfo: {
    marginTop: PlantTheme.spacing.md,
    alignItems: 'center',
  },
  stageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: PlantTheme.spacing.xs,
  },
  stageDescription: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: PlantTheme.spacing.xs,
  },
  engagementScore: {
    fontSize: 12,
    color: PlantTheme.colors.textLight,
    fontWeight: '600',
  },
});

export const PlantGrowthAnimation = memo(PlantGrowthAnimationComponent);