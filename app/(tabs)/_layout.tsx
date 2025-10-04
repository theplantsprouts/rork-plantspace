import { Tabs, usePathname } from "expo-router";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { Platform, Animated, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import createContextHook from '@nkzw/create-context-hook';
import { useTheme } from '@/hooks/use-theme';

const TAB_WIDTH = 64;
const INDICATOR_PADDING = 8;

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

  const createTabIcon = useCallback((IconComponent: React.ComponentType<{ color: string; size: number }>, index: number) => {
    const TabIcon = ({ focused }: { color: string; size: number; focused: boolean }) => {
      useEffect(() => {
        Animated.spring(scaleAnims[index], {
          toValue: focused ? 1.1 : 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 150,
        }).start();
      }, [focused]);

      return (
        <Animated.View style={{
          transform: [{ scale: scaleAnims[index] }],
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
        }}>
          <IconComponent 
            color={focused ? colors.primary : colors.onSurfaceVariant} 
            size={24} 
          />
        </Animated.View>
      );
    };
    TabIcon.displayName = `TabIcon_${index}`;
    return TabIcon;
  }, [colors, scaleAnims]);

  const renderHomeIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Home, 0)(props), [createTabIcon]);

  const renderExploreIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Compass, 1)(props), [createTabIcon]);

  const renderMessageIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(MessageCircle, 2)(props), [createTabIcon]);

  const renderProfileIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(User, 3)(props), [createTabIcon]);

  const renderCreateIcon = useCallback(() => {
    return (
      <View style={styles.fabContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Plus color={isDark ? colors.surface : colors.white} size={26} strokeWidth={2.5} />
        </LinearGradient>
      </View>
    );
  }, [colors, isDark]);
  
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [INDICATOR_PADDING, TAB_WIDTH + INDICATOR_PADDING, TAB_WIDTH * 2 + INDICATOR_PADDING, TAB_WIDTH * 3 + INDICATOR_PADDING],
  });

  const tabBarStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: Platform.OS === 'ios' ? 20 : 16,
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    paddingBottom: 0,
    paddingTop: 0,
    paddingHorizontal: 0,
    transform: [{ translateY: tabBarAnimation }],
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.12)',
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
      height: 64,
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
                  ? 'rgba(26, 28, 26, 0.85)' 
                  : 'rgba(255, 255, 255, 0.85)',
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(123, 211, 137, 0.15)' 
                  : 'rgba(23, 207, 23, 0.15)',
              },
              Platform.OS === 'web' && {
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              } as any
            ]}
          />
        ) : (
          <BlurView
            intensity={isDark ? 60 : 80}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.tabBarBackground,
              {
                backgroundColor: isDark 
                  ? 'rgba(26, 28, 26, 0.7)' 
                  : 'rgba(255, 255, 255, 0.7)',
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(123, 211, 137, 0.15)' 
                  : 'rgba(23, 207, 23, 0.15)',
              }
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: isDark 
                ? 'rgba(123, 211, 137, 0.2)' 
                : 'rgba(23, 207, 23, 0.12)',
              transform: [{ translateX: indicatorTranslateX }],
            }
          ]}
        />
      </View>
    ),
  }), [tabBarStyle, colors, isDark, indicatorTranslateX]);

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
    borderRadius: 32,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    left: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fabContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
});