import { Tabs } from "expo-router";
import { Sprout, Compass, Plus, Bell, User } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Animated, View, Text } from "react-native";
import { PlantTheme } from "@/constants/theme";
import { BlurView } from "expo-blur";
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

  const createTabIcon = useCallback((IconComponent: React.ComponentType<{ color: string; size: number }>, label: string) => {
    const TabIcon = ({ focused }: { color: string; size: number; focused: boolean }) => (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}>
        <IconComponent 
          color={focused ? PlantTheme.colors.primary : PlantTheme.colors.textSecondary} 
          size={24} 
        />
        <Text style={{
          fontSize: 11,
          fontWeight: focused ? '600' : '500',
          color: focused ? PlantTheme.colors.primary : PlantTheme.colors.textSecondary,
        }}>
          {label}
        </Text>
      </View>
    );
    TabIcon.displayName = `TabIcon_${label}`;
    return TabIcon;
  }, []);

  const renderHomeIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Sprout, 'Home')(props), [createTabIcon]);

  const renderDiscoverIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Compass, 'Discover')(props), [createTabIcon]);

  const renderCreateIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Plus, 'Create')(props), [createTabIcon]);

  const renderNotificationsIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Bell, 'Activity')(props), [createTabIcon]);

  const renderProfileIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(User, 'Profile')(props), [createTabIcon]);
  
  const tabBarStyle = useMemo(() => {
    return {
      position: 'absolute' as const,
      bottom: Platform.OS === 'ios' ? 20 : 16,
      left: 20,
      right: 20,
      height: 80,
      borderRadius: 28,
      paddingBottom: 8,
      paddingTop: 8,
      paddingHorizontal: 8,
      transform: [{ translateY: tabBarAnimation }],
      backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
      borderWidth: 0,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
        },
        android: {
          elevation: 12,
        },
        web: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(20px)',
        },
      }),
    };
  }, [tabBarAnimation]);
  
  // Tab bar animation is now controlled by the context
  
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: PlantTheme.colors.primary,
    tabBarInactiveTintColor: PlantTheme.colors.textSecondary,
    tabBarShowLabel: false,
    lazy: true,
    tabBarHideOnKeyboard: Platform.OS !== 'web',
    tabBarItemStyle: {
      paddingVertical: 4,
      paddingHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ...(Platform.OS !== 'web' && {
      tabBarBackground: () => (
        <BlurView
          intensity={80}
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 28,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
          }}
        />
      ),
    }),
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