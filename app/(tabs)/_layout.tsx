import { Tabs } from "expo-router";
import { Sprout, Compass, Heading, Leaf, TreePine } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { Platform } from "react-native";
import { PlantTheme } from "@/constants/theme";

export default function TabLayout() {
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
      ? 'rgba(76, 175, 80, 0.15)' 
      : 'rgba(76, 175, 80, 0.2)',
    borderTopWidth: 1,
    borderTopColor: PlantTheme.colors.glassBorder,
    position: 'absolute' as const,
    borderTopLeftRadius: PlantTheme.borderRadius.lg,
    borderTopRightRadius: PlantTheme.borderRadius.lg,
    backdropFilter: 'blur(10px)',
    ...PlantTheme.shadows.md,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  }), []);
  
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