import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

interface SwipeableTabContainerProps {
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
}

const TAB_ORDER = ['home', 'discover', 'leaves', 'profile'];

export function SwipeableTabContainer({ children, onTabChange }: SwipeableTabContainerProps) {
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(0)).current;
  const lastTranslateX = useRef(0);
  const isAnimating = useRef(false);

  const getCurrentTabIndex = (): number => {
    if (pathname.includes('/home')) return 0;
    if (pathname.includes('/discover')) return 1;
    if (pathname.includes('/leaves')) return 2;
    if (pathname.includes('/profile')) return 3;
    return 0;
  };

  const navigateToTab = (direction: 'left' | 'right') => {
    if (isAnimating.current) return;

    const currentIndex = getCurrentTabIndex();
    let nextIndex = currentIndex;

    if (direction === 'left' && currentIndex < TAB_ORDER.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'right' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      isAnimating.current = true;

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const targetTab = TAB_ORDER[nextIndex];
      onTabChange?.(targetTab);

      const animationDirection = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      Animated.timing(translateX, {
        toValue: animationDirection,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        if (targetTab === 'home') {
          router.push('/(tabs)/home');
        } else if (targetTab === 'discover') {
          router.push('/(tabs)/discover');
        } else if (targetTab === 'leaves') {
          router.push('/(tabs)/leaves');
        } else if (targetTab === 'profile') {
          router.push('/(tabs)/profile');
        }
        translateX.setValue(0);
        lastTranslateX.current = 0;
        isAnimating.current = false;
      });
    } else {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start(() => {
        lastTranslateX.current = 0;
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10 && !isAnimating.current;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(lastTranslateX.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isAnimating.current) return;

        const currentIndex = getCurrentTabIndex();
        const { dx } = gestureState;

        if ((currentIndex === 0 && dx > 0) || (currentIndex === TAB_ORDER.length - 1 && dx < 0)) {
          translateX.setValue(dx * 0.2);
        } else {
          translateX.setValue(dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isAnimating.current) return;

        translateX.flattenOffset();
        const { dx, vx } = gestureState;
        const currentIndex = getCurrentTabIndex();

        const shouldSwipe = Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > SWIPE_VELOCITY_THRESHOLD;

        if (shouldSwipe) {
          if (dx < 0 && currentIndex < TAB_ORDER.length - 1) {
            navigateToTab('left');
          } else if (dx > 0 && currentIndex > 0) {
            navigateToTab('right');
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 10,
            }).start(() => {
              lastTranslateX.current = 0;
            });
          }
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start(() => {
            lastTranslateX.current = 0;
          });
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }).start(() => {
          lastTranslateX.current = 0;
        });
      },
    })
  ).current;

  useEffect(() => {
    translateX.setValue(0);
    lastTranslateX.current = 0;
    isAnimating.current = false;
  }, [pathname, translateX]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
