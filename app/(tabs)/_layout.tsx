import { Tabs } from "expo-router";
import { Sprout, Compass, Heading, Leaf, TreePine } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Animated, View, StyleSheet } from "react-native";
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
  
  const tabIconStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      minWidth: 48,
      minHeight: 48,
      ...(Platform.OS === 'android' ? {} : PlantTheme.shadows.sm),
    },
    active: {
      backgroundColor: 'rgba(76, 175, 80, 0.15)',
      borderColor: 'rgba(76, 175, 80, 0.4)',
      transform: [{ scale: 1.1 }],
    },
    inactive: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
  });

  const createTabIcon = useCallback((IconComponent: React.ComponentType<{ color: string; size: number }>, extraSize: number = 0) => 
    ({ focused }: { color: string; size: number; focused: boolean }) => (
      <View style={[
        tabIconStyles.container,
        focused ? tabIconStyles.active : tabIconStyles.inactive
      ]}>
        <IconComponent 
          color={focused ? PlantTheme.colors.primary : PlantTheme.colors.textPrimary} 
          size={22 + extraSize} 
        />
      </View>
    ), [tabIconStyles]);

  const renderHomeIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Sprout)(props), [createTabIcon]);

  const renderDiscoverIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Compass)(props), [createTabIcon]);

  const renderCreateIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Heading, 2)(props), [createTabIcon]);

  const renderNotificationsIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Leaf)(props), [createTabIcon]);

  const renderProfileIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(TreePine)(props), [createTabIcon]);
  
  const tabBarStyle = useMemo(() => ({
    backgroundColor: Platform.OS === 'web' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : Platform.OS === 'android'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(76, 175, 80, 0.08)',
    borderTopWidth: 1,
    borderTopColor: Platform.OS === 'android' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : PlantTheme.colors.glassBorder,
    position: 'absolute' as const,
    borderTopLeftRadius: PlantTheme.borderRadius.lg,
    borderTopRightRadius: PlantTheme.borderRadius.lg,
    backdropFilter: 'blur(20px)',
    ...(Platform.OS === 'android' ? {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : PlantTheme.shadows.sm),
    height: Platform.OS === 'ios' ? 95 : 80,
    paddingBottom: Platform.OS === 'ios' ? 30 : 18,
    paddingTop: Platform.OS === 'ios' ? 8 : 8,
    transform: [{ translateY: tabBarAnimation }],
  }), [tabBarAnimation]);
  
  // Tab bar animation is now controlled by the context
  
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: PlantTheme.colors.primary,
    tabBarInactiveTintColor: PlantTheme.colors.textPrimary,
    tabBarShowLabel: false,
    lazy: true,
    tabBarHideOnKeyboard: Platform.OS !== 'web',
    tabBarItemStyle: {
      paddingVertical: Platform.OS === 'ios' ? 8 : 12,
      paddingHorizontal: 8,
      marginHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
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