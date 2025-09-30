import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PlantTheme } from '@/constants/theme';
import { router, Stack } from 'expo-router';

type NotificationType = 'like' | 'comment' | 'follow';

type Notification = {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const notifications: Notification[] = [];

  const getNotificationIcon = (type: NotificationType) => {
    const iconColor = isDark ? '#c1fbb0' : '#002202';
    const iconSize = 14;
    
    switch (type) {
      case 'like':
        return <Heart size={iconSize} color={iconColor} fill={iconColor} />;
      case 'comment':
        return <MessageCircle size={iconSize} color={iconColor} />;
      case 'follow':
        return <UserPlus size={iconSize} color={iconColor} />;
    }
  };

  const backgroundColor = isDark ? '#112111' : '#f6f8f6';
  const textColor = '#000000';
  const secondaryTextColor = '#424842';
  const containerBg = isDark ? '#1d211d' : '#eef2ee';
  const iconBg = isDark ? '#005307' : '#a6f8a5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🔔</Text>
              <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                When someone likes, comments, or follows you, you&apos;ll see it here
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id} 
                style={[styles.notificationItem, { backgroundColor: containerBg }]}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: notification.user.avatar }} 
                    style={styles.avatar}
                  />
                  <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
                    {getNotificationIcon(notification.type)}
                  </View>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationText, { color: textColor }]}>
                    <Text style={styles.userName}>{notification.user.name}</Text>
                    {' '}
                    {notification.message}
                  </Text>
                  <Text style={[styles.timestamp, { color: secondaryTextColor }]}>
                    {notification.timestamp}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userName: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
