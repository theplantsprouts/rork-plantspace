import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Plus, Menu, Bell, Bookmark, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedIconButton, AnimatedButton } from './AnimatedPressable';

interface FloatingCapsuleProps {
  hideNotifications?: boolean;
}

export function FloatingCapsule({ hideNotifications = false }: FloatingCapsuleProps) {
  const { colors, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(menuAnim, {
        toValue: menuOpen ? 1 : 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(rotateAnim, {
        toValue: menuOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuOpen, menuAnim, rotateAnim]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuAction = (action: () => void) => {
    setMenuOpen(false);
    setTimeout(action, 200);
  };

  const handleCreatePress = () => {
    router.push('/(tabs)/create');
  };

  const menuRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const allMenuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      onPress: () => handleMenuAction(() => router.push('/notifications')),
      translateY: -200,
    },
    {
      icon: Bookmark,
      label: 'Bookmarks',
      onPress: () => handleMenuAction(() => router.push('/saved-content')),
      translateY: -130,
    },
    {
      icon: Settings,
      label: 'Settings',
      onPress: () => handleMenuAction(() => router.push('/settings')),
      translateY: -60,
    },
  ];

  const menuItems = hideNotifications
    ? allMenuItems
        .filter((item) => item.label !== 'Notifications')
        .map((item, index) => ({
          ...item,
          translateY: index === 0 ? -130 : -60,
        }))
    : allMenuItems;

  return (
    <>
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <Animated.View
            style={[
              styles.overlayBackground,
              {
                opacity: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableOpacity>
      )}

      <View style={styles.container} pointerEvents="box-none">
        {menuItems.map((item, index) => {
          const itemTranslateY = menuAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, item.translateY],
          });

          const itemOpacity = menuAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });

          const itemScale = menuAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          });

          return (
            <Animated.View
              key={item.label}
              style={[
                styles.menuItemContainer,
                {
                  transform: [
                    { translateY: itemTranslateY },
                    { scale: itemScale },
                  ],
                  opacity: itemOpacity,
                },
              ]}
              pointerEvents={menuOpen ? 'auto' : 'none'}
            >
              <AnimatedIconButton
                style={[
                  styles.menuItem,
                  { backgroundColor: colors.surfaceContainer },
                ]}
                onPress={item.onPress}
                bounceEffect="subtle"
              >
                {Platform.OS === 'web' ? (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        borderRadius: 28,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      } as any,
                    ]}
                  />
                ) : (
                  <BlurView
                    intensity={isDark ? 60 : 40}
                    tint={isDark ? 'dark' : 'light'}
                    style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
                  />
                )}
                <View style={styles.menuItemContent}>
                  <item.icon size={24} color={colors.primary} />
                  <Text style={[styles.menuItemLabel, { color: colors.onSurface }]}>
                    {item.label}
                  </Text>
                </View>
              </AnimatedIconButton>
            </Animated.View>
          );
        })}

        <View style={styles.capsule}>
          <AnimatedIconButton
            style={[styles.menuButton, { backgroundColor: colors.surfaceContainer }]}
            onPress={toggleMenu}
            bounceEffect="medium"
          >
            {Platform.OS === 'web' ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    borderRadius: 28,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  } as any,
                ]}
              />
            ) : (
              <BlurView
                intensity={isDark ? 60 : 40}
                tint={isDark ? 'dark' : 'light'}
                style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
              />
            )}
            <Animated.View
              style={{
                transform: [{ rotate: menuRotation }],
              }}
            >
              <Menu size={24} color={colors.onSurface} />
            </Animated.View>
          </AnimatedIconButton>

          <AnimatedButton
            style={styles.createButton}
            onPress={handleCreatePress}
            bounceEffect="strong"
            hapticFeedback="medium"
          >
              {Platform.OS === 'web' ? (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: 28,
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    } as any,
                  ]}
                />
              ) : (
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
                />
              )}
              <Plus size={36} color="#FFFFFF" strokeWidth={3} />
          </AnimatedButton>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    right: 16,
    zIndex: 999,
    alignItems: 'flex-end',
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#17cf17',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 6px 28px rgba(23, 207, 23, 0.25)',
      },
    }),
  },
  createButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#17cf17',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0 8px 32px rgba(23, 207, 23, 0.3)',
      },
    }),
  },
  menuItemContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'flex-end',
  },
  menuItem: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#17cf17',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 5px 20px rgba(23, 207, 23, 0.18)',
      },
    }),
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
