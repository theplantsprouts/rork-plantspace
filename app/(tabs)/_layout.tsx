import { Tabs } from "expo-router";
import { Home, Compass, Plus, MessageCircle, User, Leaf } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Animated, View, Text } from "react-native";
import { PlantTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import createContextHook from '@nkzw/create-context-hook';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

// Create a context for tab bar animation
const [TabBarProvider, useTabBar] = createContextHook(() => {
  const tabBarAnimation = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');
  
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;
    
    // Only animate if scroll difference is significant and we're not at the top
    if (Math.abs(scrollDiff) > 10 && currentScrollY > 50) {
      const newDirection = scrollDiff > 0 ? 'down' : 'up';
      
      if (newDirection !== scrollDirection.current) {
        scrollDirection.current = newDirection;
        
        Animated.timing(tabBarAnimation, {
          toValue: newDirection === 'down' ? 100 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else if (currentScrollY <= 50) {
      // Always show tab bar when near the top
      Animated.timing(tabBarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
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

  const createTabIcon = useCallback((IconComponent: React.ComponentType<{ color: string; size: number }>, label: string, isCreateButton: boolean = false) => {
    const TabIcon = ({ focused }: { color: string; size: number; focused: boolean }) => {
      const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
      const rotateAnim = useRef(new Animated.Value(0)).current;
      
      React.useEffect(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: focused ? 1 : 0.9,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(rotateAnim, {
            toValue: focused ? 1 : 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, [focused, scaleAnim, rotateAnim]);
      
      const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });
      
      if (isCreateButton) {
        return (
          <Animated.View style={{
            width: 64,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: scaleAnim }],
          }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              overflow: 'visible',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Animated.View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                overflow: 'hidden',
                transform: [{ rotate: rotation }],
                ...Platform.select({
                  ios: {
                    shadowColor: PlantTheme.colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                  },
                  android: {
                    elevation: 8,
                  },
                  web: {
                    boxShadow: `0 8px 24px ${PlantTheme.colors.primary}60`,
                  },
                }),
              }}>
                {Platform.OS === 'web' ? (
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${PlantTheme.colors.primary}, ${PlantTheme.colors.secondary})`,
                  }} />
                ) : (
                  <LinearGradient
                    colors={[PlantTheme.colors.primary, PlantTheme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                )}
                <View style={{
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <IconComponent 
                    color="#FFFFFF" 
                    size={28} 
                  />
                </View>
              </Animated.View>
              <View style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: PlantTheme.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2.5,
                borderColor: '#FFFFFF',
                ...Platform.select({
                  ios: {
                    shadowColor: PlantTheme.colors.accent,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 3,
                  },
                }),
              }}>
                <Leaf color="#FFFFFF" size={10} />
              </View>
            </View>
          </Animated.View>
        );
      }
      
      return (
        <Animated.View style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: scaleAnim }],
        }}>
          <View style={{
            width: 64,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            backgroundColor: focused ? PlantTheme.colors.primaryContainer : 'transparent',
            overflow: 'hidden',
          }}>
            {focused && (
              <View style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 24,
                backgroundColor: PlantTheme.colors.primary,
                opacity: 0.12,
              }} />
            )}
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}>
              <IconComponent 
                color={focused ? PlantTheme.colors.primary : PlantTheme.colors.onSurfaceVariant} 
                size={24} 
              />
              <Text style={{
                fontSize: 8,
                color: focused ? PlantTheme.colors.primary : PlantTheme.colors.onSurfaceVariant,
                opacity: 0.6,
                fontWeight: '600' as const,
              }}>•</Text>
            </View>
          </View>
        </Animated.View>
      );
    };
    TabIcon.displayName = `TabIcon_${label}`;
    return TabIcon;
  }, []);

  const renderHomeIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Home, 'Home')(props), [createTabIcon]);

  const renderExploreIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Compass, 'Explore')(props), [createTabIcon]);

  const renderMessageIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(MessageCircle, 'Message')(props), [createTabIcon]);

  const renderProfileIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(User, 'Profile')(props), [createTabIcon]);

  const renderCreateIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Plus, 'Create', true)(props), [createTabIcon]);
  
  const tabBarStyle = useMemo(() => {
    return {
      position: 'absolute' as const,
      bottom: Platform.OS === 'ios' ? 16 : 12,
      left: 16,
      right: 16,
      height: 80,
      borderRadius: 28,
      paddingBottom: 0,
      paddingTop: 0,
      paddingHorizontal: 4,
      transform: [{ translateY: tabBarAnimation }],
      backgroundColor: 'transparent',
      borderWidth: 0,
      ...Platform.select({
        ios: {
          shadowColor: PlantTheme.colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.2,
          shadowRadius: 32,
        },
        android: {
          elevation: 12,
        },
        web: {
          boxShadow: `0 12px 48px ${PlantTheme.colors.primary}25, 0 0 0 1px ${PlantTheme.colors.outline}15`,
        },
      }),
    };
  }, [tabBarAnimation]);
  
  // Tab bar animation is now controlled by the context
  
  const OrganicTabBarBackground = React.memo(() => {
    const pulseAnim = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }, [pulseAnim]);
    
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        borderRadius: 28,
      }}>
        {Platform.OS === 'web' ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: PlantTheme.colors.surfaceContainer,
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderWidth: 1,
              borderColor: PlantTheme.colors.outlineVariant,
              borderRadius: 28,
            }}
          />
        ) : (
          <BlurView
            intensity={80}
            tint="light"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: PlantTheme.colors.surfaceContainer,
              borderWidth: 1,
              borderColor: PlantTheme.colors.outlineVariant,
              borderRadius: 28,
            }}
          />
        )}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.4,
          }}
        >
          <Defs>
            <SvgLinearGradient id="expressiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={PlantTheme.colors.primary} stopOpacity="0.15" />
              <Stop offset="50%" stopColor={PlantTheme.colors.secondary} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={PlantTheme.colors.tertiary} stopOpacity="0.15" />
            </SvgLinearGradient>
          </Defs>
          <Path
            d="M0,30 Q100,15 200,25 T400,30 L400,80 L0,80 Z"
            fill="url(#expressiveGradient)"
          />
        </Svg>
        <View style={{
          position: 'absolute',
          top: 12,
          left: 24,
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${PlantTheme.colors.primary}08`,
        }} />
        <View style={{
          position: 'absolute',
          bottom: 16,
          right: 32,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: `${PlantTheme.colors.tertiary}08`,
        }} />
      </View>
    );
  });
  OrganicTabBarBackground.displayName = 'OrganicTabBarBackground';

  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: PlantTheme.colors.primary,
    tabBarInactiveTintColor: PlantTheme.colors.textSecondary,
    tabBarShowLabel: false,
    lazy: true,
    tabBarHideOnKeyboard: Platform.OS !== 'web',
    tabBarItemStyle: {
      paddingVertical: 8,
      paddingHorizontal: 0,
      margin: 0,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      height: 80,
    },
    tabBarBackground: () => <OrganicTabBarBackground />,
  }), [tabBarStyle]);

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