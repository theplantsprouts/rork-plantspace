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
import { ArrowLeft, Lock, Eye, Users, MapPin } from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

export default function PrivacySettingsScreen() {
  const { settings, updatePrivacySetting } = useSettings();
  const { colors } = useTheme();

  const privacyOptions = [
    {
      id: 'privateAccount',
      title: 'Private Account',
      subtitle: 'Only approved followers can see your posts',
      icon: Lock,
      value: settings.privacy.privateAccount,
    },
    {
      id: 'showOnlineStatus',
      title: 'Show Online Status',
      subtitle: 'Let others see when you&apos;re active',
      icon: Eye,
      value: settings.privacy.showOnlineStatus,
    },
    {
      id: 'allowTagging',
      title: 'Allow Tagging',
      subtitle: 'Let others tag you in their posts',
      icon: Users,
      value: settings.privacy.allowTagging,
    },
    {
      id: 'shareLocation',
      title: 'Share Location',
      subtitle: 'Add location to your posts',
      icon: MapPin,
      value: settings.privacy.shareLocation,
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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Privacy Controls
          </Text>

          {privacyOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <View
                key={option.id}
                style={[
                  styles.settingCard,
                  { backgroundColor: colors.surfaceContainer },
                  index === privacyOptions.length - 1 && styles.lastCard,
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
                  value={option.value}
                  onValueChange={(value) => updatePrivacySetting(option.id as any, value)}
                  trackColor={{
                    false: colors.outlineVariant,
                    true: `${colors.primary}4D`,
                  }}
                  thumbColor={option.value ? colors.primary : colors.outline}
                  ios_backgroundColor={colors.outlineVariant}
                />
              </View>
            );
          })}

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
              💡 These settings help you control who can see and interact with your content. You can change them anytime.
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
