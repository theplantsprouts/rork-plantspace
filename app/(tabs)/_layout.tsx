import { Tabs } from "expo-router";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Animated, View } from "react-native";
import { PlantTheme } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
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

  const createTabIcon = useCallback((IconComponent: React.ComponentType<{ color: string; size: number }>, label: string, isCreateButton: boolean = false) => {
    const TabIcon = ({ focused }: { color: string; size: number; focused: boolean }) => {
      if (isCreateButton) {
        return (
          <View style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 0,
            overflow: 'hidden',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
              },
              android: {
                elevation: 4,
              },
              web: {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
                background: 'linear-gradient(135deg, rgba(128, 255, 0, 0.6), rgba(0, 255, 128, 0.6))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }} />
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
                }}
              >
                <LinearGradient
                  colors={['rgba(128, 255, 0, 0.6)', 'rgba(0, 255, 128, 0.6)']}
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
              </BlurView>
            )}
            <View style={{
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 35,
              width: '100%',
              height: '100%',
              position: 'absolute',
            }} />
            <IconComponent 
              color="#000000" 
              size={36} 
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
          backgroundColor: focused ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
        }}>
          <IconComponent 
            color={focused ? '#222222' : '#555555'} 
            size={28} 
          />
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
      bottom: Platform.OS === 'ios' ? 20 : 16,
      left: 16,
      right: 16,
      height: 72,
      borderRadius: 50,
      paddingBottom: 0,
      paddingTop: 0,
      paddingHorizontal: 12,
      transform: [{ translateY: tabBarAnimation }],
      backgroundColor: 'transparent',
      borderWidth: 0,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
      paddingVertical: 12,
      paddingHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
      height: 72,
    },
    tabBarBackground: () => (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        gap: 8,
      }}>
        {Platform.OS === 'web' ? (
          <View
            style={{
              flex: 1,
              height: 56,
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          />
        ) : (
          <BlurView
            intensity={80}
            tint="light"
            style={{
              flex: 1,
              height: 56,
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          />
        )}
      </View>
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
          title: 'Explore Garden',
          tabBarIcon: renderExploreIcon,
          tabBarAccessibilityLabel: 'Explore Garden Tab',
        }}
      />
      <Tabs.Screen
        name="notifications"
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