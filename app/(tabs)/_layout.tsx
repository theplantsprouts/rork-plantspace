import { Tabs, usePathname } from "expo-router";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { Platform, Animated, View, StyleSheet, TouchableWithoutFeedback, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import createContextHook from '@nkzw/create-context-hook';
import { useTheme } from '@/hooks/use-theme';

const TAB_WIDTH = 72;
const INDICATOR_PADDING = 4;
const WAVE_DURATION = 4000;

const [TabBarProvider, useTabBar] = createContextHook(() => {
  const tabBarAnimation = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');
  
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;
    
    if (Math.abs(scrollDiff) > 10 && currentScrollY > 50) {
      const newDirection = scrollDiff > 0 ? 'down' : 'up';
      
      if (newDirection !== scrollDirection.current) {
        scrollDirection.current = newDirection;
        
        Animated.spring(tabBarAnimation, {
          toValue: newDirection === 'down' ? 100 : 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      }
    } else if (currentScrollY <= 50) {
      Animated.spring(tabBarAnimation, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    }
    
    lastScrollY.current = currentScrollY;
  }, [tabBarAnimation]);
  
  return useMemo(() => ({
    tabBarAnimation,
    handleScroll,
  }), [tabBarAnimation, handleScroll]);
});

// Export the hook for use in screens
export { useTabBar };

export default function TabLayout() {
  return (
    <TabBarProvider>
      <TabLayoutContent />
    </TabBarProvider>
  );
}

function TabLayoutContent() {
  const { tabBarAnimation } = useTabBar();
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const tabs = useMemo(() => [
    { name: 'home', icon: Home, route: '/home' },
    { name: 'discover', icon: Compass, route: '/discover' },
    { name: 'leaves', icon: MessageCircle, route: '/leaves' },
    { name: 'profile', icon: User, route: '/profile' },
  ], []);

  const activeIndex = useMemo(() => {
    const index = tabs.findIndex(tab => pathname === tab.route);
    return index >= 0 ? index : 0;
  }, [pathname, tabs]);

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    }).start();
  }, [activeIndex, indicatorAnim]);

  useEffect(() => {
    const waveAnimation = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: WAVE_DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    waveAnimation.start();

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => {
      waveAnimation.stop();
      glowAnimation.stop();
    };
  }, [waveAnim, glowAnim]);

  const createTabIcon = useCallback((IconComponent: React.ComponentType<{ color: string; size: number }>, index: number) => {
    const TabIcon = ({ focused }: { color: string; size: number; focused: boolean }) => {
      const sproutAnim = useRef(new Animated.Value(0)).current;

      useEffect(() => {
        Animated.spring(scaleAnims[index], {
          toValue: focused ? 1.15 : 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 150,
        }).start();

        if (focused) {
          Animated.sequence([
            Animated.timing(sproutAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          sproutAnim.setValue(0);
        }
      }, [focused, sproutAnim]);

      return (
        <View style={styles.iconContainer}>
          <Animated.View style={{
            transform: [{ scale: scaleAnims[index] }],
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: focused 
              ? (isDark ? 'rgba(123, 211, 137, 0.15)' : 'rgba(23, 207, 23, 0.08)')
              : 'transparent',
          }}>
            <IconComponent 
              color={focused ? colors.primary : colors.onSurfaceVariant} 
              size={24} 
            />
          </Animated.View>
          {focused && (
            <Animated.View style={[
              styles.leafDecoration,
              {
                opacity: sproutAnim,
                transform: [
                  { scale: sproutAnim },
                  { 
                    rotate: sproutAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-45deg', '0deg'],
                    })
                  }
                ],
              }
            ]}>
              <View style={styles.leafEmoji}>
                {/* Leaf decoration */}
              </View>
            </Animated.View>
          )}
        </View>
      );
    };
    TabIcon.displayName = `TabIcon_${index}`;
    return TabIcon;
  }, [colors, scaleAnims, isDark]);

  const renderHomeIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Home, 0)(props), [createTabIcon]);

  const renderExploreIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Compass, 1)(props), [createTabIcon]);

  const renderMessageIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(MessageCircle, 2)(props), [createTabIcon]);

  const renderProfileIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(User, 3)(props), [createTabIcon]);

  const CreateFabIcon = React.memo(() => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
    });

    const glowScale = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.2],
    });

    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0.9],
    });

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.fabContainer}>
          <Animated.View style={[
            styles.fabGlow,
            {
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            }
          ]} />
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Plus color={colors.white} size={28} strokeWidth={2.5} />
            </Animated.View>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    );
  });
  CreateFabIcon.displayName = 'CreateFabIcon';

  const renderCreateIcon = useCallback(() => <CreateFabIcon />, [CreateFabIcon]);
  
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      INDICATOR_PADDING + 10,
      TAB_WIDTH + INDICATOR_PADDING + 10,
      TAB_WIDTH * 2 + INDICATOR_PADDING + 10,
      TAB_WIDTH * 3 + INDICATOR_PADDING + 10
    ],
  });

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  const tabBarStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: Platform.OS === 'ios' ? 20 : 16,
    left: 16,
    right: 16,
    height: 72,
    borderRadius: 28,
    paddingBottom: 0,
    paddingTop: 0,
    paddingHorizontal: 0,
    transform: [{ translateY: tabBarAnimation }],
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: isDark ? colors.primary : colors.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.25 : 0.12,
        shadowRadius: 32,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: isDark 
          ? '0 8px 32px rgba(123, 211, 137, 0.12)' 
          : '0 8px 32px rgba(46, 125, 50, 0.12)',
      },
    }),
  }), [tabBarAnimation, colors, isDark]);
  
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.onSurfaceVariant,
    tabBarShowLabel: false,
    lazy: true,
    tabBarHideOnKeyboard: Platform.OS !== 'web',
    tabBarItemStyle: {
      paddingVertical: 0,
      paddingHorizontal: 0,
      margin: 0,
      justifyContent: 'center',
      alignItems: 'center',
      height: 72,
      width: TAB_WIDTH,
    },
    tabBarBackground: () => (
      <View style={styles.tabBarContainer}>
        {Platform.OS === 'web' ? (
          <View
            style={[
              styles.tabBarBackground,
              {
                backgroundColor: isDark 
                  ? 'rgba(26, 28, 26, 0.98)' 
                  : 'rgba(255, 255, 255, 0.98)',
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(123, 211, 137, 0.08)' 
                  : 'rgba(76, 175, 80, 0.08)',
              },
              Platform.OS === 'web' && {
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              } as any
            ]}
          />
        ) : (
          <BlurView
            intensity={isDark ? 70 : 90}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.tabBarBackground,
              {
                backgroundColor: isDark 
                  ? 'rgba(26, 28, 26, 0.85)' 
                  : 'rgba(255, 255, 255, 0.85)',
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(123, 211, 137, 0.08)' 
                  : 'rgba(76, 175, 80, 0.08)',
              }
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.waveAnimation,
            {
              transform: [{ translateX: waveTranslateX }],
            }
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              isDark ? 'rgba(123, 211, 137, 0.3)' : 'rgba(76, 175, 80, 0.3)',
              isDark ? 'rgba(129, 199, 132, 0.4)' : 'rgba(129, 199, 132, 0.4)',
              isDark ? 'rgba(102, 187, 106, 0.3)' : 'rgba(102, 187, 106, 0.3)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.waveGradient}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: isDark 
                ? 'rgba(123, 211, 137, 0.15)' 
                : 'rgba(232, 245, 233, 1)',
              transform: [{ translateX: indicatorTranslateX }],
            }
          ]}
        />
      </View>
    ),
  }), [tabBarStyle, colors, isDark, indicatorTranslateX, waveTranslateX]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Garden',
          tabBarIcon: renderHomeIcon,
          tabBarAccessibilityLabel: 'Garden Tab',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Explore Garden',
          tabBarIcon: renderExploreIcon,
          tabBarAccessibilityLabel: 'Explore Garden Tab',
        }}
      />
      <Tabs.Screen
        name="leaves"
        options={{
          title: 'Leaves',
          tabBarIcon: renderMessageIcon,
          tabBarAccessibilityLabel: 'Leaves Tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Grove',
          tabBarIcon: renderProfileIcon,
          tabBarAccessibilityLabel: 'My Grove Tab',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Plant Seed',
          tabBarIcon: renderCreateIcon,
          tabBarAccessibilityLabel: 'Plant Seed Tab',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 28,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  waveAnimation: {
    position: 'absolute',
    top: 0,
    left: -400,
    width: 800,
    height: 3,
  },
  waveGradient: {
    width: '100%',
    height: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafDecoration: {
    position: 'absolute',
    top: -4,
    right: -2,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafEmoji: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  fabContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fabGlow: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(46, 125, 50, 0.35), 0 0 0 4px rgba(255, 255, 255, 0.9) inset',
      },
    }),
  },
});