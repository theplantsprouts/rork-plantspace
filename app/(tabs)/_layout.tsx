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
  
  const tabIconStyles = useMemo(() => {
    const baseContainer = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      minWidth: 48,
      minHeight: 48,
    };

    if (Platform.OS === 'android') {
      return StyleSheet.create({
        container: {
          ...baseContainer,
          elevation: 2,
          shadowColor: PlantTheme.colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        active: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderColor: PlantTheme.colors.primary,
          transform: [{ scale: 1.05 }],
        },
        inactive: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(76, 175, 80, 0.3)',
        },
      });
    }

    return StyleSheet.create({
      container: {
        ...baseContainer,
        ...PlantTheme.shadows.sm,
      },
      active: {
        backgroundColor: PlantTheme.colors.cardBackground,
        borderColor: PlantTheme.colors.primary,
        transform: [{ scale: 1.1 }],
      },
      inactive: {
        backgroundColor: PlantTheme.colors.cardBackground,
        borderColor: PlantTheme.colors.cardBorder,
      },
    });
  }, []);

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
  
  const tabBarStyle = useMemo(() => {
    return {
      borderTopWidth: 1,
      position: 'absolute' as const,
      borderTopLeftRadius: PlantTheme.borderRadius.lg,
      borderTopRightRadius: PlantTheme.borderRadius.lg,
      height: Platform.OS === 'ios' ? 95 : 80,
      paddingBottom: Platform.OS === 'ios' ? 30 : 18,
      paddingTop: Platform.OS === 'ios' ? 8 : 8,
      transform: [{ translateY: tabBarAnimation }],
      backgroundColor: PlantTheme.colors.cardBackground,
      borderTopColor: PlantTheme.colors.cardBorder,
      ...PlantTheme.shadows.md,
    };
  }, [tabBarAnimation]);
  
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