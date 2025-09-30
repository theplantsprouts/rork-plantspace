import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, UserPlus, Sprout, Leaf, Megaphone } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';

interface NotificationSetting {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  enabled: boolean;
}

interface NotificationSection {
  title: string;
  items: NotificationSetting[];
}

export default function NotificationPreferencesScreen() {
  const insets = useSafeAreaInsets();
  
  const [activitySettings, setActivitySettings] = useState<NotificationSetting[]>([
    {
      id: 'likes',
      title: 'Likes on your posts',
      icon: Heart,
      enabled: true,
    },
    {
      id: 'comments',
      title: 'Comments on your posts',
      icon: MessageCircle,
      enabled: true,
    },
    {
      id: 'followers',
      title: 'New Followers',
      icon: UserPlus,
      enabled: true,
    },
  ]);

  const [messageSettings, setMessageSettings] = useState<NotificationSetting[]>([
    {
      id: 'direct-messages',
      title: 'Direct Sprouts (Messages)',
      icon: Sprout,
      enabled: false,
    },
  ]);

  const [systemSettings, setSystemSettings] = useState<NotificationSetting[]>([
    {
      id: 'updates',
      title: 'PlantSpace Updates',
      subtitle: 'News about new features and updates',
      icon: Leaf,
      enabled: true,
    },
    {
      id: 'promotions',
      title: 'Promotions & Announcements',
      icon: Megaphone,
      enabled: false,
    },
  ]);

  const toggleSetting = (
    section: 'activity' | 'messages' | 'system',
    id: string
  ) => {
    const updateSettings = (settings: NotificationSetting[]) =>
      settings.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );

    if (section === 'activity') {
      setActivitySettings(updateSettings(activitySettings));
    } else if (section === 'messages') {
      setMessageSettings(updateSettings(messageSettings));
    } else {
      setSystemSettings(updateSettings(systemSettings));
    }
  };

  const renderNotificationItem = (
    item: NotificationSetting,
    section: 'activity' | 'messages' | 'system'
  ) => {
    const IconComponent = item.icon;

    return (
      <View key={item.id} style={styles.notificationItem}>
        <View style={styles.notificationLeft}>
          <View style={styles.iconContainer}>
            <IconComponent color="#424842" size={24} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleSetting(section, item.id)}
          trackColor={{
            false: '#2E2E2E',
            true: 'rgba(23, 207, 23, 0.3)',
          }}
          thumbColor={item.enabled ? PlantTheme.colors.primary : '#938F99'}
          ios_backgroundColor="#2E2E2E"
        />
      </View>
    );
  };

  const renderSection = (
    title: string,
    items: NotificationSetting[],
    section: 'activity' | 'messages' | 'system'
  ) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionCard}>
          {items.map((item, index) => (
            <View key={item.id}>
              {renderNotificationItem(item, section)}
              {index < items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1a1c1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderSection('Activity', activitySettings, 'activity')}
        {renderSection('Messages', messageSettings, 'messages')}
        {renderSection('System', systemSettings, 'system')}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F6F8F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PlantTheme.colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: '#F0F4F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1C1C1C',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#444844',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAE6',
    marginLeft: 56,
  },
});
