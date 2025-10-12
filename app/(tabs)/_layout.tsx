import { Stack, usePathname, useSegments } from "expo-router";
import React, { useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import createContextHook from '@nkzw/create-context-hook';
import { GlowingTopBar } from "@/components/GlowingTopBar";
import { FloatingCapsule } from "@/components/FloatingCapsule";

const [TabBarProvider, useTabBar] = createContextHook(() => {
  const handleScroll = useCallback(() => {}, []);
  
  return useMemo(() => ({
    handleScroll,
  }), [handleScroll]);
});

export { useTabBar };

export default function TabLayout() {
  return (
    <TabBarProvider>
      <TabLayoutContent />
    </TabBarProvider>
  );
}

function TabLayoutContent() {
  const pathname = usePathname();
  const segments = useSegments();
  
  const activeTab = useMemo(() => {
    if (pathname.includes('/home')) return 'home';
    if (pathname.includes('/discover')) return 'discover';
    if (pathname.includes('/leaves')) return 'leaves';
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/create')) return 'create';
    return 'home';
  }, [pathname]);

  const isCreatePage = useMemo(() => {
    return segments[segments.length - 1] === 'create';
  }, [segments]);

  return (
    <View style={styles.container}>
      {!isCreatePage && <GlowingTopBar activeTab={activeTab} />}
      
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          animationDuration: 0,
        }}
      >
        <Stack.Screen
          name="home"
          options={{
            title: 'Garden',
          }}
        />
        <Stack.Screen
          name="discover"
          options={{
            title: 'Explore Garden',
          }}
        />
        <Stack.Screen
          name="leaves"
          options={{
            title: 'Leaves',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'My Grove',
          }}
        />
        <Stack.Screen
          name="create"
          options={{
            title: 'Plant Seed',
          }}
        />
      </Stack>
      
      {!isCreatePage && <FloatingCapsule />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
