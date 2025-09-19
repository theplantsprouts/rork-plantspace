import { Tabs } from "expo-router";
import { Sprout, Compass, Heading, Leaf, TreePine } from "lucide-react-native";
import React, { useCallback } from "react";
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' 
            ? 'rgba(76, 175, 80, 0.15)' 
            : 'rgba(76, 175, 80, 0.2)',
          borderTopWidth: 1,
          borderTopColor: PlantTheme.colors.glassBorder,
          position: 'absolute',
          borderTopLeftRadius: PlantTheme.borderRadius.lg,
          borderTopRightRadius: PlantTheme.borderRadius.lg,
          backdropFilter: 'blur(10px)',
          ...PlantTheme.shadows.md,
        },
        tabBarActiveTintColor: PlantTheme.colors.primary,
        tabBarInactiveTintColor: PlantTheme.colors.textLight,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        lazy: true,
        tabBarHideOnKeyboard: Platform.OS !== 'web',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Garden',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Explore',
          tabBarIcon: renderDiscoverIcon,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Plant',
          tabBarIcon: renderCreateIcon,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Leaves',
          tabBarIcon: renderNotificationsIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Grove',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tabs>
  );
}