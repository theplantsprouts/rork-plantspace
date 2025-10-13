import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, TrendingUp } from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

export default function NotificationPreferencesScreen() {
  const { settings, updateNotificationSetting } = useSettings();
  const { colors } = useTheme();

  const notificationOptions = [
    {
      id: 'likes',
      title: 'Likes',
      subtitle: 'When someone likes your post',
      icon: Heart,
    },
    {
      id: 'comments',
      title: 'Comments',
      subtitle: 'When someone comments on your post',
      icon: MessageCircle,
    },
    {
      id: 'follows',
      title: 'New Followers',
      subtitle: 'When someone follows you',
      icon: UserPlus,
    },
    {
      id: 'mentions',
      title: 'Mentions',
      subtitle: 'When someone mentions you',
      icon: Bell,
    },
    {
      id: 'trending',
      title: 'Trending',
      subtitle: 'Updates about trending topics',
      icon: TrendingUp,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <AnimatedButton
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surfaceContainer }]}
            bounceEffect="subtle"
            hapticFeedback="light"
          >
            <ArrowLeft color={colors.onSurface} size={24} />
          </AnimatedButton>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Push Notifications
          </Text>

          {notificationOptions.map((option, index) => {
            const IconComponent = option.icon;
            const value = settings.notifications[option.id as keyof typeof settings.notifications];
            
            return (
              <View
                key={option.id}
                style={[
                  styles.settingCard,
                  { backgroundColor: colors.surfaceContainer },
                  index === notificationOptions.length - 1 && styles.lastCard,
                ]}
              >
                <View style={styles.settingItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <IconComponent color={colors.primary} size={24} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
                      {option.subtitle}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={value}
                  onValueChange={(newValue) => updateNotificationSetting(option.id as any, newValue)}
                  trackColor={{
                    false: colors.outlineVariant,
                    true: `${colors.primary}4D`,
                  }}
                  thumbColor={value ? colors.primary : colors.outline}
                  ios_backgroundColor={colors.outlineVariant}
                />
              </View>
            );
          })}

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
              🔔 You can customize which notifications you receive. Changes take effect immediately.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginRight: 48,
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: 'uppercase',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  lastCard: {
    marginBottom: 24,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
