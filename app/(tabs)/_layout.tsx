import { Tabs } from "expo-router";
import { Sprout, Compass, Plus, Bell, User } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Animated, View } from "react-native";
import { PlantTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
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

  const createTabIcon = useCallback((IconComponent: React.ComponentType<{ color: string; size: number }>, label: string, isCreateButton: boolean = false) => {
    const TabIcon = ({ focused }: { color: string; size: number; focused: boolean }) => {
      if (isCreateButton) {
        return (
          <View style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#ffdde0',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              },
              android: {
                elevation: 8,
              },
              web: {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }),
          }}>
            <IconComponent 
              color="#d93025" 
              size={32} 
            />
          </View>
        );
      }
      
      return (
        <View style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          backgroundColor: focused ? '#d2e3fc' : 'transparent',
        }}>
          <IconComponent 
            color={focused ? '#1a73e8' : '#5f6368'} 
            size={24} 
          />
        </View>
      );
    };
    TabIcon.displayName = `TabIcon_${label}`;
    return TabIcon;
  }, []);

  const renderHomeIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Sprout, 'Home')(props), [createTabIcon]);

  const renderDiscoverIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Compass, 'Discover')(props), [createTabIcon]);

  const renderCreateIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Plus, 'Create', true)(props), [createTabIcon]);

  const renderNotificationsIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(Bell, 'Activity')(props), [createTabIcon]);

  const renderProfileIcon = useCallback((props: { color: string; size: number; focused: boolean }) => 
    createTabIcon(User, 'Profile')(props), [createTabIcon]);
  
  const tabBarStyle = useMemo(() => {
    return {
      position: 'absolute' as const,
      bottom: Platform.OS === 'ios' ? 20 : 16,
      left: 16,
      right: 16,
      height: 64,
      borderRadius: 50,
      paddingBottom: 0,
      paddingTop: 0,
      paddingHorizontal: 8,
      transform: [{ translateY: tabBarAnimation }],
      backgroundColor: 'transparent',
      borderWidth: 0,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
      paddingVertical: 8,
      paddingHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
      height: 64,
    },
    tabBarBackground: () => (
      Platform.OS === 'web' ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 90,
            bottom: 0,
            borderRadius: 50,
            overflow: 'hidden',
            background: 'linear-gradient(to right, #e0eaff, #e0ffec, #ffe0e0)',
          }}
        />
      ) : (
        <LinearGradient
          colors={['#e0eaff', '#e0ffec', '#ffe0e0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 90,
            bottom: 0,
            borderRadius: 50,
            overflow: 'hidden',
          }}
        />
      )
    ),
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