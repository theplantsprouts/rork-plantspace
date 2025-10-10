import { Tabs } from "expo-router";
import { Home, Compass, Plus, MessageCircle, User, Leaf } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Animated, View } from "react-native";
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
      if (isCreateButton) {
        return (
          <View style={{
            width: 64,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
          }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              overflow: 'hidden',
              marginTop: -8,
              ...Platform.select({
                ios: {
                  shadowColor: PlantTheme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                },
                android: {
                  elevation: 6,
                },
                web: {
                  boxShadow: `0 4px 16px ${PlantTheme.colors.primary}50`,
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
            </View>
            <View style={{
              position: 'absolute',
              top: 8,
              right: 4,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: PlantTheme.colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#FFFFFF',
            }}>
              <Leaf color="#FFFFFF" size={10} />
            </View>
          </View>
        );
      }
      
      return (
        <View style={{
          width: '100%',
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            backgroundColor: focused ? `${PlantTheme.colors.primary}15` : 'transparent',
          }}>
            <IconComponent 
              color={focused ? PlantTheme.colors.primary : PlantTheme.colors.textSecondary} 
              size={24} 
            />
          </View>
          {focused && (
            <View style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: PlantTheme.colors.primary,
              marginTop: 4,
            }} />
          )}
        </View>
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
      bottom: Platform.OS === 'ios' ? 24 : 20,
      left: 20,
      right: 20,
      height: 80,
      borderRadius: 40,
      paddingBottom: 0,
      paddingTop: 0,
      paddingHorizontal: 8,
      transform: [{ translateY: tabBarAnimation }],
      backgroundColor: 'transparent',
      borderWidth: 0,
      ...Platform.select({
        ios: {
          shadowColor: PlantTheme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: `0 8px 32px ${PlantTheme.colors.primary}20`,
        },
      }),
    };
  }, [tabBarAnimation]);
  
  // Tab bar animation is now controlled by the context
  
  const OrganicTabBarBackground = useCallback(() => (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      borderRadius: 40,
    }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Defs>
          <SvgLinearGradient id="tabBarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={PlantTheme.colors.primary} stopOpacity="0.08" />
            <Stop offset="50%" stopColor={PlantTheme.colors.secondary} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={PlantTheme.colors.tertiary} stopOpacity="0.08" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M0,20 Q50,10 100,15 T200,20 Q250,25 300,15 T400,20 L400,80 L0,80 Z"
          fill="url(#tabBarGradient)"
        />
      </Svg>
      {Platform.OS === 'web' ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderWidth: 1.5,
            borderColor: `${PlantTheme.colors.primary}30`,
            borderRadius: 40,
          }}
        />
      ) : (
        <BlurView
          intensity={100}
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderWidth: 1.5,
            borderColor: `${PlantTheme.colors.primary}30`,
            borderRadius: 40,
          }}
        />
      )}
      <View style={{
        position: 'absolute',
        top: 8,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${PlantTheme.colors.primary}10`,
        opacity: 0.5,
      }} />
      <View style={{
        position: 'absolute',
        bottom: 12,
        right: 30,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: `${PlantTheme.colors.secondary}10`,
        opacity: 0.5,
      }} />
    </View>
  ), []);

  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: PlantTheme.colors.primary,
    tabBarInactiveTintColor: PlantTheme.colors.textSecondary,
    tabBarShowLabel: false,
    lazy: true,
    tabBarHideOnKeyboard: Platform.OS !== 'web',
    tabBarItemStyle: {
      padding: 0,
      margin: 0,
      justifyContent: 'center',
      alignItems: 'center',
      height: 80,
      flex: 1,
    },
    tabBarBackground: OrganicTabBarBackground,
  }), [tabBarStyle, OrganicTabBarBackground]);

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