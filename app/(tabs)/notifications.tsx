import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, UserPlus, Share, Leaf } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAppContext } from '@/hooks/use-app-context';
import { PlantTheme, PlantTerminology } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';

const mockNotifications = [
  {
    id: 1,
    type: 'like',
    user: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    message: 'gave sunshine to your tomato harvest post',
    time: '2m ago',
    postImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    type: 'comment',
    user: { name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    message: 'rooted on your post: "Great sustainable farming techniques! 🌱"',
    time: '5m ago',
    postImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    type: 'follow',
    user: { name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    message: 'started tending your garden',
    time: '1h ago',
  },
  {
    id: 4,
    type: 'share',
    user: { name: 'Alex Rodriguez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    message: 'spread seeds from your post',
    time: '2h ago',
    postImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=100&h=100&fit=crop',
  },
  {
    id: 5,
    type: 'like',
    user: { name: 'Lisa Park', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
    message: 'and 12 others gave sunshine to your organic garden',
    time: '3h ago',
    postImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&h=100&fit=crop',
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart color={PlantTheme.colors.accent} size={18} fill={PlantTheme.colors.accent} />;
    case 'comment':
      return <MessageCircle color={PlantTheme.colors.primary} size={18} />;
    case 'follow':
      return <UserPlus color={PlantTheme.colors.secondary} size={18} />;
    case 'share':
      return <Share color={PlantTheme.colors.primaryLight} size={18} />;
    default:
      return <Heart color={PlantTheme.colors.accent} size={18} />;
  }
};

export default function NotificationsScreen() {
  const { notifications, unreadNotifications, markNotificationsAsRead } = useAppContext();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (unreadNotifications > 0) {
      const timer = setTimeout(() => {
        markNotificationsAsRead();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadNotifications, markNotificationsAsRead]);

  const allNotifications = notifications.length > 0 ? notifications : mockNotifications;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>🍃 {PlantTerminology.notifications}</Text>
            <Text style={styles.headerSubtitle}>Stay connected with your garden</Text>
          </View>
          <TouchableOpacity onPress={markNotificationsAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {allNotifications.length === 0 ? (
            <GlassCard style={styles.emptyState}>
              <Leaf color={PlantTheme.colors.textSecondary} size={48} />
              <Text style={styles.emptyStateText}>No leaves yet</Text>
              <Text style={styles.emptyStateSubtext}>When your garden grows, notifications will bloom here</Text>
            </GlassCard>
          ) : (
            allNotifications.map((notification) => (
              <TouchableOpacity key={notification.id} style={styles.notificationItem}>
                <GlassCard style={styles.notificationCard}>
                  <View style={styles.notificationContent}>
                    <View style={styles.leftSection}>
                      <View style={styles.avatarContainer}>
                        <Image 
                          source={{ uri: notification.user.avatar }} 
                          style={styles.userAvatar}
                        />
                        <View style={styles.iconBadge}>
                          {getNotificationIcon(notification.type)}
                        </View>
                      </View>
                      
                      <View style={styles.textSection}>
                        <Text style={styles.notificationText}>
                          <Text style={styles.userName}>{notification.user.name}</Text>
                          {' '}
                          <Text style={styles.messageText}>{notification.message}</Text>
                        </Text>
                        <Text style={styles.timeText}>{notification.time}</Text>
                      </View>
                    </View>
                    
                    {notification.postImage && (
                      <Image 
                        source={{ uri: notification.postImage }} 
                        style={styles.postThumbnail}
                      />
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )}

          <View style={styles.endMessage}>
            <Text style={styles.endMessageText}>Your garden is all tended! 🌱</Text>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
  },
  markAllButton: {
    backgroundColor: PlantTheme.colors.glassBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: PlantTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  markAllRead: {
    color: PlantTheme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationItem: {
    marginBottom: 15,
  },
  notificationCard: {
    padding: 15,
    backgroundColor: 'transparent',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: PlantTheme.colors.primary,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: PlantTheme.colors.white,
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...PlantTheme.shadows.sm,
  },
  textSection: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userName: {
    fontWeight: '600',
    color: PlantTheme.colors.textPrimary,
  },
  messageText: {
    color: PlantTheme.colors.textSecondary,
  },
  timeText: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 12,
  },
  postThumbnail: {
    width: 50,
    height: 50,
    borderRadius: PlantTheme.borderRadius.md,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: PlantTheme.colors.glassBorder,
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  endMessageText: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
  },
  emptyStateText: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtext: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  headerTitleContainer: {
    flex: 1,
  },
});