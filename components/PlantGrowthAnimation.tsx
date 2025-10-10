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

  const currentStage = PlantGrowthStages[stage];

  useEffect(() => {
    const reducedMotion = Platform.OS === 'web';
    
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: reducedMotion ? 400 : 800,
      useNativeDriver: true,
    }).start();

    if (!reducedMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [stage, scaleAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>

      
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