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
import * as Haptics from 'expo-haptics';

export function FloatingCapsule() {
  const { colors, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setMenuOpen(!menuOpen);
  };

  const handleMenuAction = (action: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMenuOpen(false);
    setTimeout(action, 200);
  };

  const handleCreatePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/(tabs)/create');
    });
  };

  const menuRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      onPress: () => handleMenuAction(() => router.push('/notifications')),
      translateY: -140,
    },
    {
      icon: Bookmark,
      label: 'Bookmarks',
      onPress: () => handleMenuAction(() => router.push('/saved-content')),
      translateY: -100,
    },
    {
      icon: Settings,
      label: 'Settings',
      onPress: () => handleMenuAction(() => router.push('/settings')),
      translateY: -60,
    },
  ];

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
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  { backgroundColor: colors.surfaceContainer },
                ]}
                onPress={item.onPress}
                activeOpacity={0.8}
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
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <View style={styles.capsule}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.surfaceContainer }]}
            onPress={toggleMenu}
            activeOpacity={0.8}
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
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePress}
              activeOpacity={0.9}
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
              <Plus size={32} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </Animated.View>
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  createButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
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
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
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
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
