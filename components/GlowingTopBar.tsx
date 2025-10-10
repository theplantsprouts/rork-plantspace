import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Home, Compass, MessageCircle, User } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';

interface GlowingTopBarProps {
  activeTab: string;
}

export function GlowingTopBar({ activeTab }: GlowingTopBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [displayedTab, setDisplayedTab] = useState(activeTab);
  const iconScales = useRef({
    home: new Animated.Value(1),
    discover: new Animated.Value(1),
    leaves: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      setDisplayedTab(activeTab);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab, pulseAnim, textOpacity]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.secondary],
  });

  const getTabName = (tab: string): string => {
    const tabNames: Record<string, string> = {
      home: 'Garden',
      discover: 'Explore Garden',
      leaves: 'Leaves',
      profile: 'My Grove',
    };
    return tabNames[tab] || 'Garden';
  };

  const isActive = (route: string): boolean => {
    return pathname.includes(route);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {Platform.OS === 'web' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.glassBackground,
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderBottomWidth: 1,
              borderBottomColor: colors.glassBorder,
            } as any,
          ]}
        />
      ) : (
        <>
          <BlurView
            intensity={isDark ? 70 : 50}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: colors.glassBackground,
                borderBottomWidth: 1,
                borderBottomColor: colors.glassBorder,
              },
            ]}
          />
        </>
      )}

      <View style={styles.content}>
        <View style={styles.leftIcons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isActive('/home') && { backgroundColor: `${colors.primary}15` },
            ]}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Animated.View style={{ transform: [{ scale: iconScales.home }] }}>
              <Home
                size={24}
                color={isActive('/home') ? colors.primary : colors.onSurfaceVariant}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isActive('/discover') && { backgroundColor: `${colors.primary}15` },
            ]}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Animated.View style={{ transform: [{ scale: iconScales.discover }] }}>
              <Compass
                size={24}
                color={isActive('/discover') ? colors.primary : colors.onSurfaceVariant}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.centerCapsule,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.glassBorder,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {Platform.OS === 'web' ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 24,
                  background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`,
                } as any,
              ]}
            />
          ) : (
            <LinearGradient
              colors={[`${colors.primary}15`, `${colors.secondary}15`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
            />
          )}
          <Animated.View
            style={[
              styles.glowRing,
              {
                borderColor: glowColor as any,
                borderRadius: 26,
              },
            ]}
          />
          <Animated.Text style={[styles.tabName, { color: colors.primary, opacity: textOpacity }]}>
            {getTabName(displayedTab)}
          </Animated.Text>
        </Animated.View>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isActive('/leaves') && { backgroundColor: `${colors.primary}15` },
            ]}
            onPress={() => router.push('/(tabs)/leaves')}
          >
            <Animated.View style={{ transform: [{ scale: iconScales.leaves }] }}>
              <MessageCircle
                size={24}
                color={isActive('/leaves') ? colors.primary : colors.onSurfaceVariant}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isActive('/profile') && { backgroundColor: `${colors.primary}15` },
            ]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Animated.View style={{ transform: [{ scale: iconScales.profile }] }}>
              <User
                size={24}
                color={isActive('/profile') ? colors.primary : colors.onSurfaceVariant}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: 12,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'relative',
    zIndex: 1,
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  centerCapsule: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  glowRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    opacity: 0.6,
  },
  tabName: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
