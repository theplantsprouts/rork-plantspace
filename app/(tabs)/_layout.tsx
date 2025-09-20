import { Tabs } from "expo-router";
import { Sprout, Compass, Heading, Leaf, TreePine } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Animated } from "react-native";
import { PlantTheme } from "@/constants/theme";
import createContextHook from '@nkzw/create-context-hook';

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
  
  const renderHomeIcon = useCallback(({ color, size }: { color: string; size: number }) => (
    <Sprout color={color} size={size} />
  ), []);

  const renderDiscoverIcon = useCallback(({ color, size }: { color: string; size: number }) => (
    <Compass color={color} size={size} />
  ), []);

  const renderCreateIcon = useCallback(({ color, size }: { color: string; size: number }) => (
    <Heading color={color} size={size + 4} />
  ), []);

  const renderNotificationsIcon = useCallback(({ color, size }: { color: string; size: number }) => (
    <Leaf color={color} size={size} />
  ), []);

  const renderProfileIcon = useCallback(({ color, size }: { color: string; size: number }) => (
    <TreePine color={color} size={size} />
  ), []);
  
  const tabBarStyle = useMemo(() => ({
    backgroundColor: Platform.OS === 'web' 
      ? 'rgba(76, 175, 80, 0.05)' 
      : 'rgba(76, 175, 80, 0.08)',
    borderTopWidth: 1,
    borderTopColor: PlantTheme.colors.glassBorder,
    position: 'absolute' as const,
    borderTopLeftRadius: PlantTheme.borderRadius.lg,
    borderTopRightRadius: PlantTheme.borderRadius.lg,
    backdropFilter: 'blur(20px)',
    ...PlantTheme.shadows.sm,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    transform: [{ translateY: tabBarAnimation }],
  }), [tabBarAnimation]);
  
  // Tab bar animation is now controlled by the context
  
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: PlantTheme.colors.primary,
    tabBarInactiveTintColor: PlantTheme.colors.textLight,
    tabBarShowLabel: true,
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '600' as const,
      marginTop: 4,
    },
    lazy: true,
    tabBarHideOnKeyboard: Platform.OS !== 'web',
    tabBarItemStyle: {
      paddingVertical: 5,
    },
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
          title: 'Explore',
          tabBarIcon: renderDiscoverIcon,
          tabBarAccessibilityLabel: 'Explore Tab',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Plant',
          tabBarIcon: renderCreateIcon,
          tabBarAccessibilityLabel: 'Plant Seed Tab',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Leaves',
          tabBarIcon: renderNotificationsIcon,
          tabBarAccessibilityLabel: 'Notifications Tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Grove',
          tabBarIcon: renderProfileIcon,
          tabBarAccessibilityLabel: 'Profile Tab',
        }}
      />
    </Tabs>
  );
}